const axios = require('axios');

const MEDGEMMA_API_URL = process.env.MEDGEMMA_API_URL;

const medGemmaAdapter = {
  /**
   * Analyzes text using the MedGemma LLM.
   * @param {string} text - The input text to analyze.
   * @returns {Promise<object>} - A promise that resolves to a standardized response object:
   *                            { success: boolean, data: object, rawResponse: object, error: string|null }
   *                            The 'data' object will contain fields like 'summary', 'entities',
   *                            'potentialConditions', and 'raw_output_medgemma'.
   */
  analyze: async (text) => {
    if (!MEDGEMMA_API_URL) {
      console.warn("[MedGemmaAdapter] API URL not configured. Cannot analyze text.");
      return {
        success: false,
        data: { summary: "N/A", entities: [], potentialConditions: [], raw_output_medgemma: "" },
        rawResponse: null,
        error: "MedGemma API URL not configured."
      };
    }

    console.log(`[MedGemmaAdapter] Analyzing text via API: "${text.substring(0, 50)}..."`);
    const payload = {
      model: "local-model", // Or get from config if needs to be dynamic
      messages: [
        { role: "system", content: "You are a helpful medical AI assistant. Analyze the following patient query to identify key symptoms, their duration, and any relevant medical history mentioned. Provide a concise summary and list potential conditions if appropriate." },
        { role: "user", content: text }
      ],
      temperature: 0.7,
      // max_tokens: 500, // Consider adding if needed
    };

    try {
      const response = await axios.post(MEDGEMMA_API_URL, payload, {
        headers: { 'Content-Type': 'application/json' }
        // Add Authorization header if your LMStudio setup requires it
      });

      const llmResponseContent = response.data.choices?.[0]?.message?.content || "";

      // TODO: Implement sophisticated parsing of llmResponseContent.
      let summary = `Summary from MedGemma: ${llmResponseContent.substring(0, 100)}...`;
      if (llmResponseContent.toLowerCase().includes("error") || llmResponseContent.length < 10) {
          summary = "Could not generate a valid summary from MedGemma response.";
      }

      return {
        success: true,
        data: {
          summary: summary, // Placeholder parsing
          entities: [], // Placeholder - requires NLP to extract from raw text
          potentialConditions: [], // Placeholder
          raw_output_medgemma: llmResponseContent
        },
        rawResponse: response.data,
        error: null
      };
    } catch (error) {
      console.error("[MedGemmaAdapter] Error calling MedGemma API:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.error?.message || error.message || "Unknown error from MedGemma API";
      return {
        success: false,
        data: { summary: "N/A", entities: [], potentialConditions: [], raw_output_medgemma: "" },
        rawResponse: error.response?.data || null,
        error: `MedGemma API Error: ${errorMessage}`
      };
    }
  }
};

module.exports = medGemmaAdapter;
