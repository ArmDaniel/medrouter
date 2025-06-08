const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const MISTRAL_IMAGE_API_URL = process.env.MISTRAL_IMAGE_API_URL;
const MISTRAL_IMAGE_API_KEY = process.env.MISTRAL_IMAGE_API_KEY;

const mistralAdapter = {
  /**
   * Analyzes an image using the Mistral Image LLM.
   * @param {string} fileRef - A reference to the image file (e.g., filename or path).
   *                           The adapter will attempt to resolve this to a local file path.
   * @returns {Promise<object>} - A promise that resolves to a standardized response object:
   *                            { success: boolean, data: object, rawResponse: object, error: string|null }
   *                            The 'data' object will contain fields like 'imageId', 'description',
   *                            'identifiedAnomalies', 'confidenceScore', and 'raw_output_mistral'.
   */
  analyze: async (fileRef) => {
    if (!MISTRAL_IMAGE_API_URL) {
      console.warn("[MistralAdapter] API URL not configured. Cannot analyze image.");
      return {
        success: false,
        data: { imageId: fileRef, description: 'N/A', identifiedAnomalies: [], confidenceScore: 0, raw_output_mistral: null },
        rawResponse: null,
        error: "Mistral Image API URL not configured."
      };
    }
    if (!MISTRAL_IMAGE_API_KEY) {
      // Depending on API, key might be optional, or this check might be more stringent.
      console.warn("[MistralAdapter] API Key not configured. Proceeding without key, but API call may fail.");
      // Some APIs might work without a key for certain tiers, or this could be a hard error:
      // return { success: false, data: { ... }, error: "Mistral API Key not configured." };
    }

    console.log(`[MistralAdapter] Analyzing image ref: ${fileRef} via API.`);

    // Placeholder for resolving fileRef to an actual file path
    const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads_placeholder');
    const filePath = path.join(uploadsDir, path.basename(fileRef));

    if (!fs.existsSync(filePath)) {
      console.error(`[MistralAdapter] File not found at path: ${filePath}. This is a placeholder path.`);
      if (process.env.NODE_ENV === 'development') {
        if (!fs.existsSync(uploadsDir)) {
            try {
                fs.mkdirSync(uploadsDir, { recursive: true });
            } catch (dirError) {
                console.error(`[MistralAdapter] Error creating dummy directory ${uploadsDir}: ${dirError.message}`);
                return {
                    success: false,
                    data: { imageId: fileRef, description: 'N/A', identifiedAnomalies: [], confidenceScore: 0, raw_output_mistral: null },
                    rawResponse: null,
                    error: `Failed to create dummy directory. File not found: ${fileRef}.`
                };
            }
        }
        try {
            fs.writeFileSync(filePath, "This is a dummy image content for Mistral testing created because the original file was not found.");
            console.warn(`[MistralAdapter] Created dummy file at ${filePath} for development testing.`);
        } catch (writeError) {
            console.error(`[MistralAdapter] Error writing dummy file ${filePath}: ${writeError.message}`);
            return {
                success: false,
                data: { imageId: fileRef, description: 'N/A', identifiedAnomalies: [], confidenceScore: 0, raw_output_mistral: null },
                rawResponse: null,
                error: `Failed to write dummy file. File not found: ${fileRef}.`
            };
        }
      } else { // Not development, and file not found
        return {
          success: false,
          data: { imageId: fileRef, description: 'N/A', identifiedAnomalies: [], confidenceScore: 0, raw_output_mistral: null },
          rawResponse: null,
          error: `File not found: ${fileRef}. Backend file access needs configuration.`
        };
      }
    }

    const form = new FormData();
    form.append('image', fs.createReadStream(filePath)); // Field name 'image'

    try {
      const response = await axios.post(MISTRAL_IMAGE_API_URL, form, {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${MISTRAL_IMAGE_API_KEY}` // Adjust if API key format is different
        },
      });

      return {
        success: true,
        data: {
          imageId: fileRef,
          description: response.data.description || 'No description provided.',
          identifiedAnomalies: response.data.anomalies || [],
          confidenceScore: response.data.confidence || 0,
          raw_output_mistral: response.data
        },
        rawResponse: response.data,
        error: null
      };
    } catch (error) {
      console.error("[MistralAdapter] Error calling Mistral Image API:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || "Unknown error from Mistral Image API";
      return {
        success: false,
        data: { imageId: fileRef, description: 'N/A', identifiedAnomalies: [], confidenceScore: 0, raw_output_mistral: null },
        rawResponse: error.response?.data || null,
        error: `Mistral Image API Error: ${errorMessage}`
      };
    }
  }
};

module.exports = mistralAdapter;
