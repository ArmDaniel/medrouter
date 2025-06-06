import create from 'zustand';
import authService from '../services/authService';

const useAuthStore = create((set, get) => ({
  user: authService.getCurrentUser(),
  tokens: authService.getTokens(),
  isAuthenticated: !!authService.getTokens(), // Check if tokens exist
  error: null,
  loading: false,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.login(credentials);
      set({
        user: data.user,
        tokens: data.tokens,
        isAuthenticated: true,
        loading: false,
      });
      return data;
    } catch (error) {
      set({ error, loading: false, isAuthenticated: false, user: null, tokens: null });
      throw error;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.register(userData);
      set({
        user: data.user,
        tokens: data.tokens,
        isAuthenticated: true,
        loading: false,
      });
      return data;
    } catch (error) {
      set({ error, loading: false, isAuthenticated: false, user: null, tokens: null });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, tokens: null, isAuthenticated: false, error: null });
  },

  // You might add a function here to handle token refresh if needed
}));

export default useAuthStore;
