const express = require('express');
const caseController = require('../controllers/caseController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Patients can create cases
router.post('/', protect, authorize(['Patient']), caseController.createCase);

// Doctors and the assigned Patient can view cases (simplified for now)
// More specific logic will be needed to check if a patient can view a specific case
// or if a doctor is assigned to it.
router.get('/', protect, authorize(['Patient', 'Doctor']), caseController.getAllCases);

module.exports = router;
