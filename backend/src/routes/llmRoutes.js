const express = require('express');
const llmController = require('../controllers/llmController');
const { protect, authorize } = require('../middlewares/authMiddleware'); // LLM routes should be protected

const router = express.Router();

// Assuming only doctors can directly trigger LLM processing,
// or it's done internally as part of case processing.
// For now, let's protect it and allow Doctors.
router.post('/medgemma/text', protect, authorize(['Doctor']), llmController.processText);
router.post('/mistral/image', protect, authorize(['Doctor']), llmController.processImage); // Needs file upload handling later

module.exports = router;
