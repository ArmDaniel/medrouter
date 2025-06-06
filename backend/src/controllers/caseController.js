const CaseModel = require('../models/CaseModel');
const UserModel = require('../models/UserModel'); // To fetch doctor list
const crypto = require('crypto'); // For generating messageId
const DataProcessingService = require('../services/dataProcessingService');
const { ReportFactory } = require('../services/reportGenerationService'); // Added

// Patient creates a new case
exports.createCase = async (req, res) => {
  try {
    const patientId = req.user.userid; // From 'protect' middleware
    const { initialInput } = req.body; // e.g., { text: "symptom description", files: ["file_id_1"] }

    if (!initialInput) {
      return res.status(400).json({ message: 'Initial input for the case is required.' });
    }

    const newCase = await CaseModel.create(patientId, initialInput);
    res.status(201).json({ message: 'Case created successfully.', case: newCase });
  } catch (error) {
    console.error("Error creating case:", error);
    res.status(500).json({ message: 'Failed to create case.', error: error.message });
  }
};

// Patient views their own cases
exports.getMyCases = async (req, res) => {
  try {
    const patientId = req.user.userid;
    const cases = await CaseModel.findByPatientId(patientId);
    res.status(200).json({ cases });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve cases.', error: error.message });
  }
};

// Doctor views cases assigned to them
exports.getAssignedCases = async (req, res) => {
  try {
    const doctorId = req.user.userid;
    const cases = await CaseModel.findByDoctorId(doctorId);
    res.status(200).json({ cases });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve assigned cases.', error: error.message });
  }
};

// Patient selects a doctor for their case
exports.selectDoctorForCase = async (req, res) => {
    try {
        const patientId = req.user.userid;
        const { caseId, doctorId } = req.body;

        if (!caseId || !doctorId) {
            return res.status(400).json({ message: 'Case ID and Doctor ID are required.' });
        }

        const caseToUpdate = await CaseModel.findById(caseId);
        if (!caseToUpdate) {
            return res.status(404).json({ message: 'Case not found.' });
        }
        if (caseToUpdate.patientid !== patientId) {
            return res.status(403).json({ message: 'You are not authorized to update this case.' });
        }
        if (caseToUpdate.doctorid) {
            return res.status(400).json({ message: 'Doctor already assigned to this case.' });
        }

        const doctor = await UserModel.findById(doctorId);
        if (!doctor || doctor.role !== 'Doctor') {
            return res.status(404).json({ message: 'Selected doctor not found or is not a valid doctor.' });
        }

        const updatedCase = await CaseModel.assignDoctor(caseId, doctorId);
        res.status(200).json({ message: 'Doctor assigned successfully.', case: updatedCase });
    } catch (error) {
        console.error("Error selecting doctor for case:", error);
        res.status(500).json({ message: 'Failed to assign doctor.', error: error.message });
    }
};


// Get a specific case by ID
exports.getCaseById = async (req, res) => {
  try {
    const caseId = req.params.caseId;
    const caseDetails = await CaseModel.findById(caseId);

    if (!caseDetails) {
      return res.status(404).json({ message: 'Case not found.' });
    }

    // Authorization: Patient who owns the case or Doctor assigned to it
    if (req.user.role === 'Patient' && caseDetails.patientid !== req.user.userid) {
      return res.status(403).json({ message: 'You are not authorized to view this case.' });
    }
    if (req.user.role === 'Doctor' && caseDetails.doctorid !== req.user.userid) {
      return res.status(403).json({ message: 'You are not authorized to view this case (not assigned).' });
    }

    res.status(200).json({ case: caseDetails });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve case details.', error: error.message });
  }
};

// Placeholder for updating case data (e.g. LLM results) - typically by Doctor/System
exports.updateCaseData = async (req, res) => {
    try {
        const { caseId } = req.params;
        const { dataToAppend } = req.body; // e.g., { llmOutput: { summary: '...' } }

        if (!dataToAppend) {
            return res.status(400).json({ message: "Data to append is required." });
        }

        const caseDetails = await CaseModel.findById(caseId);
        if (!caseDetails) {
            return res.status(404).json({ message: 'Case not found.' });
        }
        // Authorization: Only doctor assigned to the case or a system role (not implemented yet)
        if (req.user.role === 'Doctor' && caseDetails.doctorid !== req.user.userid) {
            return res.status(403).json({ message: 'You are not authorized to update this case.' });
        }
        // Add more checks if other roles can update

        const updatedCase = await CaseModel.updateData(caseId, dataToAppend);
        res.status(200).json({ message: 'Case data updated.', case: updatedCase });

    } catch (error) {
        console.error("Error updating case data:", error);
        res.status(500).json({ message: 'Failed to update case data.', error: error.message });
    }
};

// Add a new chat message to a case
exports.addChatMessageToCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { content } = req.body; // Message content
    const senderId = req.user.userid;
    const senderRole = req.user.role;

    if (!content) {
      return res.status(400).json({ message: 'Message content is required.' });
    }

    const caseDetails = await CaseModel.findById(caseId);
    if (!caseDetails) {
      return res.status(404).json({ message: 'Case not found.' });
    }

    // Authorization: Patient who owns the case or Doctor assigned to it can send messages
    if (req.user.role === 'Patient' && caseDetails.patientid !== senderId) {
      return res.status(403).json({ message: 'You are not authorized to send messages to this case.' });
    }
    if (req.user.role === 'Doctor' && caseDetails.doctorid !== senderId) {
      return res.status(403).json({ message: 'You are not authorized to send messages to this case (not assigned).' });
    }
    // Additional check: ensure sender matches the role they claim for this case
    if ((senderRole === 'Patient' && caseDetails.patientid !== senderId) || (senderRole === 'Doctor' && caseDetails.doctorid !== senderId)) {
        return res.status(403).json({ message: 'Sender role does not match case assignment.' });
    }

    const message = {
      messageId: crypto.randomUUID(), // Generate UUID for message
      senderId,
      senderRole,
      content,
      timestamp: new Date().toISOString()
    };

    const updatedCase = await CaseModel.addChatMessage(caseId, message);
    res.status(201).json({ message: 'Message sent successfully.', chatHistory: updatedCase.chathistory }); // Return updated history

  } catch (error) {
    console.error("Error adding chat message:", error);
    res.status(500).json({ message: 'Failed to send message.', error: error.message });
  }
};

// Retrieve chat history for a case
exports.getCaseChatHistory = async (req, res) => {
  try {
    const { caseId } = req.params;
    const caseDetails = await CaseModel.findById(caseId);

    if (!caseDetails) {
      return res.status(404).json({ message: 'Case not found.' });
    }

    // Authorization: Patient who owns the case or Doctor assigned to it can view chat
    if (req.user.role === 'Patient' && caseDetails.patientid !== req.user.userid) {
      return res.status(403).json({ message: 'You are not authorized to view this chat history.' });
    }
    if (req.user.role === 'Doctor' && caseDetails.doctorid !== req.user.userid) {
      return res.status(403).json({ message: 'You are not authorized to view this chat history (not assigned).' });
    }

    res.status(200).json({ chatHistory: caseDetails.chathistory || [] });

  } catch (error) {
    console.error("Error retrieving chat history:", error);
    res.status(500).json({ message: 'Failed to retrieve chat history.', error: error.message });
  }
};

// Doctor triggers data processing for a case
exports.processCaseDataByDoctor = async (req, res) => {
  try {
    const { caseId } = req.params;
    const doctorId = req.user.userid;

    const caseDetails = await CaseModel.findById(caseId);
    if (!caseDetails) {
      return res.status(404).json({ message: 'Case not found.' });
    }
    if (caseDetails.doctorid !== doctorId) {
      return res.status(403).json({ message: 'You are not assigned to this case to trigger processing.' });
    }

    if (!caseDetails.data || !caseDetails.data.initialInput) {
        return res.status(400).json({ message: 'Case has no initial input data to process.' });
    }

    const processedData = await DataProcessingService.processCaseInput(caseDetails.data);
    const updatedCase = await CaseModel.updateData(caseId, { processedData });

    res.status(200).json({ message: 'Case data processed successfully.', case: updatedCase });

  } catch (error) {
    console.error("Error processing case data by doctor:", error);
    res.status(500).json({ message: 'Failed to process case data.', error: error.message });
  }
};

// Doctor generates a Markdown report for a case
exports.generateDoctorReport = async (req, res) => {
  try {
    const { caseId } = req.params;
    const doctorId = req.user.userid;

    const caseDetails = await CaseModel.findById(caseId);
    if (!caseDetails) {
      return res.status(404).json({ message: 'Case not found.' });
    }
    if (caseDetails.doctorid !== doctorId) {
      return res.status(403).json({ message: 'You are not assigned to this case to generate a report.' });
    }
    if (!caseDetails.data || !caseDetails.data.processedData) {
        return res.status(400).json({ message: 'Case data has not been processed yet. Process data before generating report.' });
    }

    const reportInstance = ReportFactory.createReport('DoctorMarkdown', caseDetails);
    const reportContent = reportInstance.generate();

    await CaseModel.saveFinalReport(caseId, reportContent);
    // CaseModel.saveFinalReport also updates status to 'Report Generated'

    res.status(200).json({
        message: 'Doctor report generated and saved successfully.',
        reportType: 'DoctorMarkdown',
        fileName: reportInstance.getFileName(),
        mimeType: reportInstance.getMimeType(),
        content: reportContent,
        caseId: caseId
    });

  } catch (error) {
    console.error("Error generating doctor report:", error);
    res.status(500).json({ message: 'Failed to generate doctor report.', error: error.message });
  }
};

// Patient or Doctor retrieves the finalized report (Doctor's MD version)
exports.getFinalReport = async (req, res) => {
    try {
        const { caseId } = req.params;
        const caseDetails = await CaseModel.findById(caseId);

        if (!caseDetails) {
            return res.status(404).json({ message: 'Case not found.' });
        }
        // Authorization
        if (req.user.role === 'Patient' && caseDetails.patientid !== req.user.userid) {
            return res.status(403).json({ message: 'Not authorized to view this report.' });
        }
        if (req.user.role === 'Doctor' && caseDetails.doctorid !== req.user.userid) {
            return res.status(403).json({ message: 'Not authorized to view this report (not assigned).' });
        }

        if (!caseDetails.finalreport || caseDetails.status !== 'Report Generated') {
            return res.status(404).json({ message: 'Final report is not yet available for this case.' });
        }

        res.setHeader('Content-Type', 'text/markdown');
        res.status(200).send(caseDetails.finalreport);

    } catch (error) {
        console.error("Error retrieving final report:", error);
        res.status(500).json({ message: 'Failed to retrieve final report.', error: error.message });
    }
};

// Generate Patient-Friendly Summary
exports.generatePatientSummary = async (req, res) => {
    try {
        const { caseId } = req.params;
        const user = req.user; // Patient or Doctor

        const caseDetails = await CaseModel.findById(caseId);
        if (!caseDetails) return res.status(404).json({ message: 'Case not found.' });

        // Authorization: Patient who owns case or Doctor assigned to it
        if (user.role === 'Patient' && caseDetails.patientid !== user.userid) {
             return res.status(403).json({ message: 'Not authorized for this case summary.' });
        }
        if (user.role === 'Doctor' && caseDetails.doctorid !== user.userid) {
            return res.status(403).json({ message: 'Not authorized for this case summary (not assigned).' });
        }

        if (!caseDetails.data || !caseDetails.data.processedData || !caseDetails.finalreport) {
            return res.status(400).json({ message: 'Case needs processed data and a finalized doctor report before generating patient summary.' });
        }

        const doctorNotesForPatient = "Your doctor has reviewed your case. Key findings have been summarized for you. Please discuss with your doctor via chat if you have questions.";

        const reportInstance = ReportFactory.createReport('PatientFriendly', caseDetails, { doctorNotes: doctorNotesForPatient });
        const summaryContent = reportInstance.generate();

        res.status(200).json({
            message: 'Patient summary generated.',
            reportType: 'PatientFriendly',
            fileName: reportInstance.getFileName(),
            mimeType: reportInstance.getMimeType(),
            content: summaryContent,
            caseId: caseId
        });

    } catch (error) {
        console.error("Error generating patient summary:", error);
        res.status(500).json({ message: 'Failed to generate patient summary.', error: error.message });
    }
};
