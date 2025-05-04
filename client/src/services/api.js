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

// Create a base API instance
const api = axios.create({
  baseURL: '/api/v1',
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
    
    // Use a consistent URL format - either with or without /api/v1
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
      // Ensure consistent URL format
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
      // Add retry logic for connection refused errors
      let retries = 2;
      let lastError = null;
      
      while (retries >= 0) {
        try {
          console.log(`Attempting to get current user (${retries} retries left)`);
          const response = await api.get('/auth/current-user');
          return response.data;
        } catch (err) {
          lastError = err;
          // Only retry on connection errors
          if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
            retries--;
            if (retries >= 0) {
              console.log(`Connection failed, retrying ${retries} more times...`);
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
              continue;
            }
          } else {
            break; // Don't retry on non-connection errors
          }
        }
      }
      
      console.error('Get current user error:', lastError);
      
      // If server is down, return a standardized offline response
      if (lastError && (lastError.code === 'ECONNREFUSED' || lastError.code === 'ERR_NETWORK')) {
        console.warn('API server appears to be offline');
        return {
          success: false,
          message: 'API server is offline or unreachable',
          offline: true
        };
      }
      
      return {
        success: false,
        message: lastError instanceof Error ? lastError.message : 'Failed to get current user'
      };
    } catch (error) {
      console.error('Unexpected error in getCurrentUser:', error);
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
  
  getUserById: async (id) => {
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
  
  updateUser: async (id, userData) => {
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
  
  delete: async (id) => {
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

// Health service for API health checks
export const healthService = {
  checkApiHealth: async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch('/api/v1/health', {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      clearTimeout(timeoutId);
      
      return {
        online: response.ok,
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.warn('API health check failed:', error);
      return {
        online: false,
        error: error.name === 'AbortError' ? 'Request timed out' : error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
};

// Export the configured axios instance for other services
export default api;