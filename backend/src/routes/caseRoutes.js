const express = require('express');
const caseController = require('../controllers/caseController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Patient routes
router.post('/', protect, authorize('Patient'), caseController.createCase);
router.get('/my-cases', protect, authorize('Patient'), caseController.getMyCases);
router.post('/select-doctor', protect, authorize('Patient'), caseController.selectDoctorForCase);


// Doctor routes
router.get('/assigned-cases', protect, authorize('Doctor'), caseController.getAssignedCases);
router.put('/:caseId/data', protect, authorize('Doctor'), caseController.updateCaseData); // For general data updates
router.post('/:caseId/process-data', protect, authorize('Doctor'), caseController.processCaseDataByDoctor);
router.post('/:caseId/generate-doctor-report', protect, authorize('Doctor'), caseController.generateDoctorReport);


// Common routes (Patient and assigned Doctor)
router.get('/:caseId', protect, authorize(['Patient', 'Doctor']), caseController.getCaseById);
router.get('/:caseId/final-report', protect, authorize(['Patient', 'Doctor']), caseController.getFinalReport);
router.post('/:caseId/generate-patient-summary', protect, authorize(['Patient', 'Doctor']), caseController.generatePatientSummary); // Allow Patient to also generate their summary if report is ready


// Chat routes within a case
router.post('/:caseId/chat', protect, authorize(['Patient', 'Doctor']), caseController.addChatMessageToCase);
router.get('/:caseId/chat', protect, authorize(['Patient', 'Doctor']), caseController.getCaseChatHistory);


module.exports = router;
