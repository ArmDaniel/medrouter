// Base Report Class (or interface if using TypeScript)
class Report {
  constructor(caseData) {
    this.caseData = caseData; // This would be the comprehensive data from PatientCase.data
    if (!this.caseData || !this.caseData.processedData || !this.caseData.processedData.llmOutputs) {
        // Ensure there's some processed data to work with, even if it's just placeholders
        this.caseData = {
            ...this.caseData,
            patientProvidedInput: this.caseData.patientProvidedInput || { text: "N/A", files: [] },
            processedData: {
                llmOutputs: {
                    medGemma: { summary: "N/A", entities: [], potentialConditions: [] },
                    mistral: []
                },
                ...this.caseData.processedData
            }
        };
    }
  }

  generate() {
    throw new Error("Generate method must be implemented by subclasses.");
  }

  getFileName() {
    return `report-${this.caseData.caseid || 'unknown-case'}.txt`;
  }

  getMimeType() {
    return 'text/plain';
  }
}

// Concrete Report Type: Doctor's Markdown Report
class DoctorMarkdownReport extends Report {
  constructor(caseData) {
    super(caseData);
  }

  generate() {
    const { patientProvidedInput, llmOutputs } = this.caseData.processedData;
    const patientInfo = this.caseData.patientInfo || { name: 'N/A', id: this.caseData.patientid || 'N/A' }; // Assuming patientInfo might be added to caseData

    let markdown = `# Medical Report - Case ID: ${this.caseData.caseid || 'N/A'}\n\n`;
    markdown += `## Patient Information\n`;
    markdown += `- Name: ${patientInfo.name}\n`;
    markdown += `- Patient ID: ${patientInfo.id}\n\n`;

    markdown += `## Patient Provided Input\n`;
    markdown += `### Text Input\n`;
    markdown += ```\n${(patientProvidedInput && patientProvidedInput.text) || 'No text input provided.'}\n```\n\n`;
    if (patientProvidedInput && patientProvidedInput.files && patientProvidedInput.files.length > 0) {
      markdown += `### Submitted Files\n`;
      patientProvidedInput.files.forEach(file => {
        markdown += `- ${file}\n`;
      });
      markdown += `\n`;
    }

    markdown += `## LLM Analysis Results\n`;
    if (llmOutputs.medGemma) {
      markdown += `### MedGemma Text Analysis\n`;
      markdown += `- Summary: ${llmOutputs.medGemma.summary || 'N/A'}\n`;
      markdown += `- Entities: ${(llmOutputs.medGemma.entities || []).map(e => `${e.text} (${e.type})`).join(', ') || 'N/A'}\n`;
      markdown += `- Potential Conditions: ${(llmOutputs.medGemma.potentialConditions || []).join(', ') || 'N/A'}\n`;
      markdown += `#### Raw Output (MedGemma):\n```\n${llmOutputs.medGemma.raw_output_medgemma || 'N/A'}\n```\n\n`;
    }
    if (llmOutputs.mistral && llmOutputs.mistral.length > 0) {
      markdown += `### Mistral Image Analysis\n`;
      llmOutputs.mistral.forEach((imgAnalysis, index) => {
        markdown += `#### Image ${index + 1} (${imgAnalysis.imageId || 'N/A'})\n`;
        markdown += `- Description: ${imgAnalysis.description || 'N/A'}\n`;
        markdown += `- Identified Anomalies: ${(imgAnalysis.identifiedAnomalies || []).join(', ') || 'None'}\n`;
        markdown += `#### Raw Output (Mistral - Image ${index + 1}):\n```\n${imgAnalysis.raw_output_mistral || 'N/A'}\n```\n\n`;
      });
    }

    markdown += `## Doctor's Notes and Diagnosis\n`;
    markdown += `*(Space for doctor to manually edit or add notes here)*\n\n`;
    markdown += `Finalized by: Dr. [Doctor's Name] (User ID: ${this.caseData.doctorid || 'N/A'})\n`;
    markdown += `Date: ${new Date().toISOString()}\n`;

    return markdown;
  }

  getFileName() {
    return `doctor_report_case_${this.caseData.caseid || 'unknown-case'}.md`;
  }

  getMimeType() {
    return 'text/markdown';
  }
}

// Concrete Report Type: Patient-Friendly Report
class PatientFriendlyReport extends Report {
  constructor(caseData, doctorNotes = "Your doctor is reviewing your case.") {
    super(caseData);
    this.doctorNotes = doctorNotes; // Doctor's finalized notes for patient
  }

  generate() {
    const { patientProvidedInput, llmOutputs } = this.caseData.processedData;
    let report = `## Your Medical Case Summary - Case ID: ${this.caseData.caseid || 'N/A'}\n\n`;

    report += `Dear Patient, here is a summary of your case based on the information you provided and initial analysis.\n\n`;

    if (patientProvidedInput && patientProvidedInput.text) {
      report += `### Information You Provided:\n`;
      report += `You described: "${patientProvidedInput.text.substring(0, 100)}..."\n\n`;
    }

    report += `### Summary of Automated Analysis:\n`;
    if (llmOutputs.medGemma && llmOutputs.medGemma.summary) {
      report += `- Overview: ${llmOutputs.medGemma.summary}\n`;
    } else {
      report += `- Automated text analysis is pending or was not applicable.\n`;
    }
    if (llmOutputs.mistral && llmOutputs.mistral.length > 0) {
      report += `- Image Analysis: Your submitted images have been reviewed. ${llmOutputs.mistral.map(img => img.description || 'Details pending.').join(' ')}\n`;
    } else {
      report += `- No images were submitted or image analysis is pending.\n`;
    }
    report += `\n`;

    report += `### Doctor's Notes:\n`;
    report += `${this.doctorNotes}\n\n`;

    report += `Please note: This is a summary and not a final diagnosis. Your doctor will discuss the complete findings with you. You can use the chat feature to ask questions.\n`;
    report += `Report Generated: ${new Date().toLocaleDateString()}\n`;

    return report;
  }

  getFileName() {
    return `patient_summary_case_${this.caseData.caseid || 'unknown-case'}.txt`;
  }

  getMimeType() {
    return 'text/plain'; // Or 'text/html' if generating HTML
  }
}

// Report Factory
const ReportFactory = {
  createReport: (type, caseData, options = {}) => {
    switch (type) {
      case 'DoctorMarkdown':
        return new DoctorMarkdownReport(caseData);
      case 'PatientFriendly':
        return new PatientFriendlyReport(caseData, options.doctorNotes);
      default:
        throw new Error(`Report type '${type}' is not supported.`);
    }
  }
};

module.exports = { ReportFactory, DoctorMarkdownReport, PatientFriendlyReport };
