const express = require('express');
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// A protected route to get current user's info (any logged-in user)
router.get('/me', protect, userController.getMe);

// A route only accessible by users with the 'Doctor' role
router.get('/doctor/dashboard', protect, authorize(['Doctor']), userController.getDoctorDashboard);
// Example of authorizing a single role string
router.get('/patient/dashboard', protect, authorize('Patient'), userController.getPatientDashboard);


module.exports = router;
