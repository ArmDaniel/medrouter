const User = require('../models/UserModel');

exports.getMe = async (req, res) => {
  // req.user is attached by the 'protect' middleware
  if (!req.user) {
    return res.status(400).json({ message: "User not found on request. This shouldn't happen if 'protect' middleware is working." });
  }
  // Return user information (excluding sensitive details like passwordHash)
  const { passwordhash, ...userData } = req.user; // Ensure passwordhash is not sent
  res.status(200).json({
    message: "Current user data fetched successfully.",
    user: userData
  });
};

exports.getDoctorDashboard = async (req, res) => {
    // This is a placeholder for a doctor-specific resource
    res.status(200).json({
        message: "Welcome to the Doctor's Dashboard!",
        user: req.user // req.user already has passwordhash removed by protect middleware if findById is well designed
    });
};

exports.getPatientDashboard = async (req, res) => {
    // This is a placeholder for a patient-specific resource
    res.status(200).json({
        message: "Welcome to the Patient's Dashboard!",
        user: req.user
    });
};
