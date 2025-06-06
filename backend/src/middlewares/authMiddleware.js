const jwt = require('jsonwebtoken');
const User = require('../models/UserModel'); // To potentially fetch fresh user data
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT and add user to request object
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      // Attach user info to request object
      // We can choose to attach just the decoded token info or fetch fresh user data
      // Fetching fresh user data ensures the user hasn't been deleted or roles changed since token issuance
      // For performance, decoded token info is often enough for role checks if tokens are short-lived
      req.user = await User.findById(decoded.userId); // Fetches full user object, excluding passwordHash by model design

      if (!req.user) {
          return res.status(401).json({ message: 'User not found for the token provided.' });
      }
      // Remove passwordHash if it was somehow included, though UserModel.findById should not include it.
      if (req.user && req.user.passwordhash) {
        delete req.user.passwordhash;
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired.' });
      }
      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token.' });
  }
};

// Middleware to authorize based on roles
// roles should be an array of roles, e.g., ['Doctor', 'Admin']
const authorize = (roles = []) => {
  // If roles is a string, convert to array
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'User role not found on request. Ensure "protect" middleware is used before "authorize".' });
    }
    if (roles.length && !roles.includes(req.user.role)) {
      // User's role is not in the list of allowed roles
      return res.status(403).json({ message: `User role '${req.user.role}' is not authorized to access this route.` });
    }
    // Role is authorized
    next();
  };
};

module.exports = { protect, authorize };
