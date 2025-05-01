import axios from 'axios';

// Create axios instance with credentials support
const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

export const authService = {
  async login(username, password) {
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async logout() {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  async getDemoUsers() {
    try {
      const response = await apiClient.get('/auth/demo-users');
      return response.data;
    } catch (error) {
      console.error('Get demo users error:', error);
      throw error;
    }
  }
};

// Export existing functions for backward compatibility
export function authHeader() {
  return {
    'Content-Type': 'application/json'
  };
}

export function isAuthenticated() {
  // We'll rely on app state rather than direct token access
  // This will be managed through the authService
  return false;
}
