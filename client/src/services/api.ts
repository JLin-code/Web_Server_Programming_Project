import axios from 'axios';

// Configure axios with default settings
const api = axios.create({
  // Ensure baseURL doesn't include '/api/v1' as it should be included in each endpoint call
  // or be handled by the Vite dev server proxy
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important for cookies/auth
});

// Auth service for authentication operations
export const authService = {
  async login(username: string, password: string) {
    try {
      const response = await api.post('/api/v1/auth/login', { username, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      };
    }
  },

  async logout() {
    try {
      const response = await api.post('/api/v1/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Logout failed'
      };
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/api/v1/auth/current-user');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get current user'
      };
    }
  },

  async getDemoUsers() {
    try {
      // Make sure to use the consistent path format with /api/v1 prefix
      const response = await api.get('/api/v1/auth/demo-users');
      return response.data;
    } catch (error) {
      console.error('Get demo users error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get demo users',
        users: []
      };
    }
  }
};

// User service for user-related operations
export const userService = {
  async getUsers() {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get users',
        items: []
      };
    }
  },

  async getUserById(id: string) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get user ${id} error:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get user'
      };
    }
  },

  async updateUser(id: string, userData: Record<string, string | number | boolean>) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Update user ${id} error:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update user'
      };
    }
  },
  
  // Add delete method for users
  async delete(id: string) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete user ${id} error:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete user'
      };
    }
  }
};

// Export the configured axios instance for other services
export default api;
