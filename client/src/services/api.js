import axios from 'axios';
import { supabase } from './supabase';

// Add token refresh interceptor
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // If error is 401 Unauthorized and we haven't tried to refresh the token yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      console.log('Token expired, attempting refresh...');
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const { data } = await supabase.auth.refreshSession();
        if (data.session) {
          console.log('Token refreshed successfully');
          // Retry the original request with new token
          return axios(originalRequest);
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Configure axios with default settings
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important for cookies/auth
});

// Enhance getDemoUsers method with better error handling and fallbacks
const getDemoUsers = async () => {
  try {
    // Log the request start time
    console.log(`Fetching demo users at ${new Date().toLocaleTimeString()}`);
    
    const response = await axios.get('/api/v1/auth/demo-users', {
      timeout: 5000, // Set a reasonable timeout
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (response.data && Array.isArray(response.data.users)) {
      return {
        success: true,
        message: 'Users fetched from API',
        users: response.data.users,
        source: response.data.source || 'api'
      };
    } else {
      console.warn('API returned invalid data structure for demo users:', response.data);
      return await getFallbackDemoUsers();
    }
  } catch (error) {
    console.error('Error fetching demo users from API:', error);
    return await getFallbackDemoUsers();
  }
};

// Helper function to get fallback users
const getFallbackDemoUsers = async () => {
  try {
    // Dynamic import for better error handling
    const { demoUsers, getDemoUsers } = await import('../data/hardcodedUsers');
    
    if (typeof getDemoUsers === 'function') {
      return getDemoUsers();
    }
    
    if (Array.isArray(demoUsers) && demoUsers.length > 0) {
      return {
        success: true,
        message: 'Using fallback demo users',
        users: demoUsers.map(user => ({
          username: user.username,
          displayName: user.displayName
        })),
        source: 'fallback'
      };
    }
    
    return {
      success: false,
      message: 'No fallback users available',
      users: []
    };
  } catch (fallbackError) {
    console.error('Error getting fallback users:', fallbackError);
    return {
      success: false,
      message: 'Failed to load any users',
      users: []
    };
  }
};

// Auth service for authentication operations
export const authService = {
  login: async (username, password) => {
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
  
  logout: async () => {
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
  
  getCurrentUser: async () => {
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
  
  getDemoUsers
};

// User service for user-related operations
export const userService = {
  getUsers: async () => {
    try {
      const response = await api.get('/api/v1/users');
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
  
  getUserById: async (id) => {
    try {
      const response = await api.get(`/api/v1/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get user ${id} error:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get user'
      };
    }
  },
  
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/api/v1/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Update user ${id} error:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update user'
      };
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`/api/v1/users/${id}`);
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