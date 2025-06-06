const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-jwt-secret'; // Replace with a strong secret in .env
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-default-jwt-refresh-secret'; // Replace with a strong secret in .env
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Helper function to generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user.userid, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );
  const refreshToken = jwt.sign(
    { userId: user.userid, role: user.role }, // Refresh token might have less info
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  try {
    const { role, name, email, password, specialty } = req.body;

    if (!role || !name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields (role, name, email, password).' });
    }
    if (role === 'Doctor' && !specialty) {
      return res.status(400).json({ message: 'Specialty is required for Doctor role.' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    const newUser = await User.create({ role, name, email, password, specialty });
    // Avoid sending passwordHash back
    const userResponse = { ...newUser };
    delete userResponse.passwordhash;


    const tokens = generateTokens(newUser);
    // Typically, refresh token is sent via httpOnly cookie for web
    // For this example, we'll return it in the JSON response
    res.status(201).json({
      message: 'User registered successfully.',
      user: userResponse,
      tokens
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user.', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await User.verifyPassword(password, user.passwordhash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Password mismatch.' });
    }

    const userResponse = { ...user };
    delete userResponse.passwordhash;

    const tokens = generateTokens(user);

    res.status(200).json({
      message: 'Login successful.',
      user: userResponse,
      tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in.', error: error.message });
  }
};

// Placeholder for token refresh endpoint
exports.refreshToken = async (req, res) => {
  const { token: providedRefreshToken } = req.body;

  if (!providedRefreshToken) {
    return res.status(401).json({ message: 'Refresh token is required.' });
  }

  try {
    const decoded = jwt.verify(providedRefreshToken, JWT_REFRESH_SECRET);
    // Optionally: Check if refresh token is revoked or still valid in DB

    const user = await User.findById(decoded.userId); // Ensure user still exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token. User not found.' });
    }

    const userResponse = { ...user };
    delete userResponse.passwordhash;

    const tokens = generateTokens(userResponse); // Generate new set of tokens
    res.status(200).json({
      message: 'Tokens refreshed successfully.',
      tokens
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
        return res.status(403).json({ message: 'Invalid or expired refresh token.', error: error.message });
    }
    res.status(500).json({ message: 'Error refreshing token.', error: error.message });
  }
};
