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

const getChatMessages = async (caseId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cases/${caseId}/chat`, {
      headers: getAuthHeader(),
    });
    return response.data.chatHistory || []; // Backend returns { chatHistory: [...] }
  } catch (error) {
    console.error('Error fetching chat messages:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to fetch messages. ' + error.message };
  }
};

const sendChatMessage = async (caseId, messageData) => {
  // messageData should be an object like { content: "Hello!" }
  // senderId and senderRole are implicitly known by the backend via JWT
  try {
    const response = await axios.post(`${API_BASE_URL}/cases/${caseId}/chat`, messageData, {
      headers: getAuthHeader(),
    });
    // The backend's addChatMessageToCase returns { message: 'Message sent successfully.', chatHistory: updatedCase.chathistory }
    // We are interested in the updated chat history, or specifically the new message if backend returned it.
    // For now, let's assume the controller returns the new message or the full updated history.
    // The current backend controller returns the full history.
    return response.data; // This should contain { message: string, chatHistory: array }
  } catch (error) {
    console.error('Error sending chat message:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to send message. ' + error.message };
  }
};

const chatService = {
  getChatMessages,
  sendChatMessage,
};

export default chatService;
