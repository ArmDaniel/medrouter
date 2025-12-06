import axios from 'axios';
import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Helper to get the auth token
const getAuthHeader = () => {
  const tokens = authService.getTokens();
  if (tokens && tokens.accessToken) {
    return { Authorization: `Bearer ${tokens.accessToken}` };
  }
  return {};
};

/**
 * Gets the current user's information
 * @returns {Promise<object>} - The user object
 */
const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/me`, {
      headers: getAuthHeader(),
    });
    return response.data.user;
  } catch (error) {
    console.error('Error fetching current user:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to fetch user information. ' + error.message };
  }
};

/**
 * Gets list of all doctors (for patient case assignment)
 * @returns {Promise<Array<object>>} - Array of doctor objects
 */
const getDoctors = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/doctors`, {
      headers: getAuthHeader(),
    });
    return response.data.doctors || [];
  } catch (error) {
    console.error('Error fetching doctors:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to fetch doctors. ' + error.message };
  }
};

const userService = {
  getCurrentUser,
  getDoctors,
};

export default userService;
