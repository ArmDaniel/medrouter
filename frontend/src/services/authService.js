import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/auth'; // Ensure backend is running on port 3000 or configure this

const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    if (response.data && response.data.tokens) {
      // Store tokens and user info (e.g., in localStorage or state management)
      localStorage.setItem('medRouterUser', JSON.stringify(response.data.user));
      localStorage.setItem('medRouterTokens', JSON.stringify(response.data.tokens));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    if (response.data && response.data.tokens) {
      localStorage.setItem('medRouterUser', JSON.stringify(response.data.user));
      localStorage.setItem('medRouterTokens', JSON.stringify(response.data.tokens));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

const logout = () => {
  localStorage.removeItem('medRouterUser');
  localStorage.removeItem('medRouterTokens');
  // Optionally: Call a backend logout endpoint if it exists to invalidate refresh token server-side
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('medRouterUser');
  return userStr ? JSON.parse(userStr) : null;
};

const getTokens = () => {
  const tokensStr = localStorage.getItem('medRouterTokens');
  return tokensStr ? JSON.parse(tokensStr) : null;
};

// TODO: Add refreshToken function if needed to call /api/auth/refresh

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  getTokens,
};

export default authService;
