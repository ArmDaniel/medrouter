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
 * Uploads a single file for a given case.
 * @param {string} caseId - The ID of the case to associate the file with.
 * @param {File} file - The file object to upload.
 * @param {function} onUploadProgress - Optional callback for upload progress.
 * @returns {Promise<object>} - The response data from the server (e.g., file metadata).
 */
const uploadFile = async (caseId, file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file); // 'file' is the field name the backend will expect (e.g., with multer)
  // Optionally, you can append other data if your backend expects it:
  // formData.append('caseId', caseId); // Though caseId is in URL, sometimes useful in body too.
  // formData.append('description', 'Patient submitted document');

  try {
    const response = await axios.post(
      `${API_BASE_URL}/cases/${caseId}/files`, // Assuming this endpoint structure
      formData,
      {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: progressEvent => {
          if (onUploadProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onUploadProgress(percentCompleted);
          }
        }
      }
    );
    // Assuming backend returns data like { message: 'File uploaded successfully', fileId: '...', filePath: '...' }
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to upload file. ' + error.message };
  }
};

/**
 * Uploads multiple files. This is a helper that calls uploadFile for each.
 * A more optimized version might make a single request if the backend supports it,
 * but handling progress and errors per file is often better UX.
 * @param {string} caseId - The ID of the case.
 * @param {File[]} files - An array of file objects to upload.
 * @param {function} onSingleFileUploadProgress - Optional callback for individual file upload progress.
 * @param {function} onOverallProgress - Optional callback for overall progress (e.g., based on number of files uploaded).
 * @returns {Promise<Array<object>>} - An array of responses from the server for each file.
 */
const uploadFiles = async (caseId, files, onSingleFileUploadProgress, onOverallProgress) => {
  const uploadedFileResponses = [];
  for (let i = 0; i < files.length; i++) {
    try {
      // Pass a specific progress callback for this individual file if onSingleFileUploadProgress is defined
      const singleProgressCb = onSingleFileUploadProgress ?
        (percent) => onSingleFileUploadProgress(files[i].name, percent) : undefined;

      const response = await uploadFile(caseId, files[i], singleProgressCb);
      uploadedFileResponses.push({fileName: files[i].name, status: 'success', data: response});

      if (onOverallProgress) {
        onOverallProgress(((i + 1) / files.length) * 100);
      }
    } catch (error) {
      uploadedFileResponses.push({fileName: files[i].name, status: 'error', error: error });
      // Decide if you want to stop on first error or try to upload all
      // For now, continues with other files.
      if (onOverallProgress) { // Still update overall progress even on error
        onOverallProgress(((i + 1) / files.length) * 100);
      }
    }
  }
  return uploadedFileResponses;
};


const fileService = {
  uploadFile,
  uploadFiles, // If you prefer to expose a multi-file helper
};

export default fileService;
