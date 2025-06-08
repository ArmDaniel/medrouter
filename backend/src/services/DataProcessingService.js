const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const MEDGEMMA_API_URL = process.env.MEDGEMMA_API_URL;
const MISTRAL_IMAGE_API_URL = process.env.MISTRAL_IMAGE_API_URL;
const MISTRAL_IMAGE_API_KEY = process.env.MISTRAL_IMAGE_API_KEY;

const medGemmaService = {
  analyzeText: async (text) => {
    if (!MEDGEMMA_API_URL) {
      console.warn("[MedGemmaService] API URL not configured. Returning default error structure.");
      return { error: "MedGemma API URL not configured.", summary: "N/A", entities: [], potentialConditions: [], raw_output_medgemma: "" };
    }
    console.log(`[MedGemmaService] Analyzing text via API: "${text.substring(0, 50)}..."`);
    const payload = {
      model: "local-model",
      messages: [
        { role: "system", content: "You are a helpful medical AI assistant. Analyze the following patient query to identify key symptoms, their duration, and any relevant medical history mentioned. Provide a concise summary and list potential conditions if appropriate." },
        { role: "user", content: text }
      ],
      temperature: 0.7,
    };
    try {
      const response = await axios.post(MEDGEMMA_API_URL, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      const llmResponseContent = response.data.choices?.[0]?.message?.content || "";

      let summary = `Summary from MedGemma: ${llmResponseContent.substring(0, 100)}...`;
      // Basic check for non-informative summary, could be improved
      if (llmResponseContent.length < 20 && !llmResponseContent.toLowerCase().includes("error")) {
          summary = "MedGemma provided a very short response. Full response in raw output.";
      } else if (llmResponseContent.toLowerCase().includes("error")) {
           summary = "Could not generate a valid summary from MedGemma response due to error indication in content.";
      }


      return {
        summary: summary,
        entities: [], // Placeholder - requires NLP to extract from raw text
        potentialConditions: [], // Placeholder
        raw_output_medgemma: llmResponseContent,
        error: null // Explicitly null on success
      };
    } catch (error) {
      console.error("Error calling MedGemma API:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.error?.message || error.message || "Unknown error from MedGemma API";
      return {
        error: `MedGemma API Error: ${errorMessage}`,
        summary: "N/A",
        entities: [],
        potentialConditions: [],
        raw_output_medgemma: ""
      };
    }
  }
};

const mistralImageService = {
  analyzeImage: async (fileRef) => { // fileRef is expected to be a filename or a reference usable for lookup
    if (!MISTRAL_IMAGE_API_URL) {
      console.warn("[MistralImageService] API URL not configured. Returning default error structure.");
      return { imageId: fileRef, error: "Mistral Image API URL not configured.", description: 'N/A', identifiedAnomalies: [], confidenceScore: 0, raw_output_mistral: null };
    }
    console.log(`[MistralImageService] Analyzing image ref: ${fileRef} via API.`);

    // Corrected placeholder path logic: Assume 'uploads_placeholder' is in 'backend' directory, sibling to 'src'
    const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads_placeholder');
    const filePath = path.join(uploadsDir, path.basename(fileRef)); // Use path.basename to ensure fileRef is treated as a filename

    if (!fs.existsSync(filePath)) {
        console.error(`[MistralImageService] File not found at path: ${filePath}. This is a placeholder path. Ensure files are accessible or fileRef is correctly resolved.`);
        if (process.env.NODE_ENV === 'development') {
            // Ensure the directory exists before writing
            if (!fs.existsSync(uploadsDir)) {
                try {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                } catch (dirError) {
                    console.error(`[MistralImageService] Error creating dummy directory ${uploadsDir}: ${dirError.message}`);
                    return { imageId: fileRef, error: `Failed to create dummy directory. File not found: ${fileRef}.`, description: 'N/A', identifiedAnomalies: [], confidenceScore: 0, raw_output_mistral: null };
                }
            }
            try {
                fs.writeFileSync(filePath, "This is a dummy image content for testing purposes created because the original file was not found.");
                console.warn(`[MistralImageService] Created dummy file at ${filePath} for development testing as original was not found.`);
            } catch (writeError) {
                console.error(`[MistralImageService] Error writing dummy file ${filePath}: ${writeError.message}`);
                return { imageId: fileRef, error: `Failed to write dummy file. File not found: ${fileRef}.`, description: 'N/A', identifiedAnomalies: [], confidenceScore: 0, raw_output_mistral: null };
            }
        } else { // Not development, and file not found
            return { imageId: fileRef, error: `File not found: ${fileRef}. Backend file access needs configuration.`, description: 'N/A', identifiedAnomalies: [], confidenceScore: 0, raw_output_mistral: null };
        }
    }

    const form = new FormData();
    form.append('image', fs.createReadStream(filePath));

    try {
      const response = await axios.post(MISTRAL_IMAGE_API_URL, form, {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${MISTRAL_IMAGE_API_KEY}`
        },
      });
      return {
        imageId: fileRef,
        description: response.data.description || 'No description provided.',
        identifiedAnomalies: response.data.anomalies || [],
        confidenceScore: response.data.confidence || 0,
        raw_output_mistral: response.data,
        error: null // Explicitly null on success
      };
    } catch (error) {
      console.error("Error calling Mistral Image API:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || "Unknown error from Mistral Image API";
      return {
        imageId: fileRef,
        error: `Mistral Image API Error: ${errorMessage}`,
        description: 'N/A',
        identifiedAnomalies: [],
        confidenceScore: 0,
        raw_output_mistral: null
      };
    }
  }
};

const DataProcessingService = {
  processCaseInput: async (caseData) => {
    const compiledData = {
      patientProvidedInput: caseData.initialInput,
      llmOutputs: {}
    };

    if (caseData.initialInput && caseData.initialInput.text) {
      const medGemmaResult = await medGemmaService.analyzeText(caseData.initialInput.text);
      compiledData.llmOutputs.medGemma = medGemmaResult;
    } else {
      compiledData.llmOutputs.medGemma = { error: "No text input provided for MedGemma analysis.", summary: "N/A", entities: [], potentialConditions: [], raw_output_medgemma: "" };
    }

    if (caseData.initialInput && caseData.initialInput.files && caseData.initialInput.files.length > 0) {
      compiledData.llmOutputs.mistral = [];
      for (const fileRef of caseData.initialInput.files) {
        const mistralResult = await mistralImageService.analyzeImage(fileRef);
        compiledData.llmOutputs.mistral.push(mistralResult);
      }
    } else {
      compiledData.llmOutputs.mistral = []; // Ensure mistral key exists and is an array
    }

    return compiledData;
  }
};

module.exports = DataProcessingService;
