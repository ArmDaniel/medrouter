// Import the LLM adapters
const medGemmaAdapter = require('../llm_adapters/medGemmaAdapter');
const mistralAdapter = require('../llm_adapters/mistralAdapter');

// Note: No need for axios, FormData, fs, path directly in this service anymore for LLM calls,
// as that logic is now within the adapters.

const DataProcessingService = {
  /**
   * Processes patient case data by orchestrating calls to various LLM adapters.
   * @param {object} caseData - The patient case data, expected to have an 'initialInput' field
   *                            like { text: "...", files: ["file_ref_1", "file_ref_2"] }.
   * @returns {Promise<object>} - A promise that resolves to the compiled data object containing
   *                              patient input and structured LLM outputs.
   */
  processCaseInput: async (caseData) => {
    const compiledData = {
      patientProvidedInput: caseData.initialInput || {}, // Ensure initialInput exists
      llmOutputs: {}
    };

    // Process textual input with MedGemma Adapter
    if (compiledData.patientProvidedInput && compiledData.patientProvidedInput.text) {
      console.log("[DataProcessingService] Processing text input with MedGemmaAdapter...");
      const medGemmaResult = await medGemmaAdapter.analyze(compiledData.patientProvidedInput.text);
      compiledData.llmOutputs.medGemma = {
        success: medGemmaResult.success,
        summary: medGemmaResult.data?.summary,
        entities: medGemmaResult.data?.entities,
        potentialConditions: medGemmaResult.data?.potentialConditions,
        raw_output_medgemma: medGemmaResult.data?.raw_output_medgemma,
        error: medGemmaResult.error
      };
    } else {
      console.log("[DataProcessingService] No text input found for MedGemmaAdapter.");
      compiledData.llmOutputs.medGemma = {
        success: false, // Or true if 'no input' is not an error condition for this field
        summary: "N/A",
        entities: [],
        potentialConditions: [],
        raw_output_medgemma: "",
        error: "No text input provided for MedGemma analysis."
      };
    }

    // Process image files with Mistral Adapter
    if (compiledData.patientProvidedInput && compiledData.patientProvidedInput.files && compiledData.patientProvidedInput.files.length > 0) {
      console.log("[DataProcessingService] Processing image files with MistralAdapter...");
      compiledData.llmOutputs.mistral = [];
      for (const fileRef of compiledData.patientProvidedInput.files) {
        const mistralResult = await mistralAdapter.analyze(fileRef);
        compiledData.llmOutputs.mistral.push({
          success: mistralResult.success,
          imageId: mistralResult.data?.imageId || fileRef, // Use fileRef as fallback for imageId
          description: mistralResult.data?.description,
          identifiedAnomalies: mistralResult.data?.identifiedAnomalies,
          confidenceScore: mistralResult.data?.confidenceScore,
          raw_output_mistral: mistralResult.data?.raw_output_mistral,
          error: mistralResult.error
        });
      }
    } else {
      console.log("[DataProcessingService] No image files found for MistralAdapter.");
      compiledData.llmOutputs.mistral = []; // Ensure mistral array exists
    }

    // TODO: Add PDF text extraction and processing (potentially another adapter or pre-processing step)

    console.log("[DataProcessingService] Finished processing case input.");
    return compiledData;
  }
  // Other methods can be added for more specific data processing tasks if needed.
};

module.exports = DataProcessingService;
