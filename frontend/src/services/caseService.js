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

/**
 * Creates a new case (for patients).
 * @param {object} initialInput - The initial case data { text, files }
 * @returns {Promise<object>} - The created case object.
 */
const createCase = async (initialInput) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/cases`,
      { initialInput },
      { headers: getAuthHeader() }
    );
    return response.data.case;
  } catch (error) {
    console.error('Error creating case:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to create case. ' + error.message };
  }
};

/**
 * Fetches cases for the current patient.
 * @returns {Promise<Array<object>>} - An array of case objects.
 */
const getMyCases = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cases/my-cases`, {
      headers: getAuthHeader(),
    });
    return response.data.cases || [];
  } catch (error) {
    console.error('Error fetching my cases:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to fetch cases. ' + error.message };
  }
};

/**
 * Selects a doctor for a case (for patients).
 * @param {string} caseId - The case ID
 * @param {string} doctorId - The doctor's user ID
 * @returns {Promise<object>} - The updated case object.
 */
const selectDoctorForCase = async (caseId, doctorId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/cases/select-doctor`,
      { caseId, doctorId },
      { headers: getAuthHeader() }
    );
    return response.data.case;
  } catch (error) {
    console.error('Error selecting doctor:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to select doctor. ' + error.message };
  }
};

/**
 * Processes case data by doctor.
 * @param {string} caseId - The case ID
 * @returns {Promise<object>} - The updated case object.
 */
const processCaseData = async (caseId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/cases/${caseId}/process-data`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data.case;
  } catch (error) {
    console.error('Error processing case data:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to process case data. ' + error.message };
  }
};

/**
 * Generates doctor report for a case.
 * @param {string} caseId - The case ID
 * @returns {Promise<object>} - Report data including content.
 */
const generateDoctorReport = async (caseId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/cases/${caseId}/generate-doctor-report`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error generating doctor report:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to generate doctor report. ' + error.message };
  }
};

/**
 * Generates patient-friendly summary for a case.
 * @param {string} caseId - The case ID
 * @returns {Promise<object>} - Summary data including content.
 */
const generatePatientSummary = async (caseId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/cases/${caseId}/generate-patient-summary`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error generating patient summary:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to generate patient summary. ' + error.message };
  }
};

/**
 * Retrieves the final report for a case.
 * @param {string} caseId - The case ID
 * @returns {Promise<string>} - The report content (markdown text).
 */
const getFinalReport = async (caseId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/cases/${caseId}/final-report`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching final report:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to fetch final report. ' + error.message };
  }
};

const caseService = {
  getAssignedCases,
  getCaseById,
  createCase,
  getMyCases,
  selectDoctorForCase,
  processCaseData,
  generateDoctorReport,
  generatePatientSummary,
  getFinalReport,
};

export default caseService;
