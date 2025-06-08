import axios from 'axios';
import authService from './authService'; // To get tokens

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
 * Fetches cases assigned to the currently logged-in doctor.
 * @returns {Promise<Array<object>>} - An array of case objects.
 */
const getAssignedCases = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cases/assigned-cases`, {
      headers: getAuthHeader(),
    });
    // The backend returns { cases: [...] }
    return response.data.cases || [];
  } catch (error) {
    console.error('Error fetching assigned cases:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to fetch assigned cases. ' + error.message };
  }
};

/**
 * Fetches a single case by its ID.
 * @param {string} caseId
 * @returns {Promise<object>} - The case object.
 */
const getCaseById = async (caseId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cases/${caseId}`, {
      headers: getAuthHeader(),
    });
    // Backend returns { case: {...} }
    return response.data.case;
  } catch (error) {
    console.error(`Error fetching case ${caseId}:`, error.response?.data || error.message);
    throw error.response?.data || { message: `Failed to fetch case ${caseId}. ` + error.message };
  }
};

// Add other case-related API calls here as needed, e.g.:
// - createCase (for patients)
// - selectDoctorForCase (for patients)
// - updateCaseStatus (for doctors)
// - processCaseDataByDoctor (for doctors, already in backend, can add frontend call here)
// - generateDoctorReport (for doctors)
// - generatePatientSummary (for doctors)

const caseService = {
  getAssignedCases,
  getCaseById,
  // ... other functions will be added here
};

export default caseService;
