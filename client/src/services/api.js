import axios from 'axios';
import { supabase } from './supabase';

// Get the API URL from environment variables with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with proper baseURL and timeout
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Increase timeout to 10 seconds
  withCredentials: true // Important for cookies
});

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

// Enhance getDemoUsers method with better error handling and fallbacks
const getDemoUsers = async () => {
  try {
    // Log the request start time
    console.log(`Fetching demo users at ${new Date().toLocaleTimeString()}`);
    
    const response = await api.get('/api/v1/auth/demo-users', {
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
      // Fix the API path - ensure it has the correct prefix
      const loginPath = '/api/v1/auth/login';
      console.log(`Sending login request to: ${loginPath}`);
      
      const response = await api.post(loginPath, { username, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      
      // Improved error handling
      if (error.code === 'ERR_NETWORK') {
        return {
          success: false,
          message: 'Cannot connect to server. Please check if the server is running.'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed - please check your credentials'
      };
    }
  },
  
  logout: async () => {
    try {
      // Fix the API path - ensure it has the correct prefix
      const logoutPath = '/api/v1/auth/logout';
      const response = await api.post(logoutPath);
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: error.message || 'Logout failed'
      };
    }
  },
  
  getCurrentUser: async () => {
    let lastError = null;
    let retries = 2;
    
    while (retries >= 0) {
      try {
        console.log(`Attempting to get current user (${retries} retries left)`);
        // Fix the API path - ensure it has the correct prefix
        const userPath = '/api/v1/auth/current-user';
        const response = await api.get(userPath);
        return response.data;
      } catch (err) {
        lastError = err;
        retries--;
        if (retries >= 0) {
          console.warn(`Error fetching current user, retrying (${retries} attempts left)`, err);
          await new Promise(r => setTimeout(r, 1000)); // Wait 1 second before retrying
        }
      }
    }
    
    console.error('Failed to get current user after retries:', lastError);
    throw lastError;
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

// Health service for API health checks
export const healthService = {
  checkApiHealth: async () => {
    // Try multiple endpoints in sequence until one works
    const endpointsToTry = [
      '/api/v1/health',     // First try dedicated health endpoint
      '/api/v1/auth/demo-users', // Then try an endpoint we know should exist
      '/api/v1',            // Then try the base API path
      '/'                   // Finally try the root as a last resort
    ];
    
    let lastError = null;
    
    for (const endpoint of endpointsToTry) {
      try {
        console.log(`Checking API health using endpoint: ${endpoint}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const response = await fetch(endpoint, {
          method: 'GET',
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        clearTimeout(timeoutId);
        
        // If we got any response, the server is up
        return {
          online: true,
          endpoint: endpoint,
          status: response.status,
          statusText: response.statusText,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.warn(`API health check failed for ${endpoint}:`, error);
        lastError = error;
        // Continue to the next endpoint
      }
    }
    
    // All endpoints failed
    return {
      online: false,
      error: lastError?.name === 'AbortError' ? 'Request timed out' : lastError?.message || 'All endpoints failed',
      timestamp: new Date().toISOString()
    };
  },
  
  // Add a more detailed diagnostics function that provides more information
  checkApiDiagnostics: async () => {
    try {
      const results = {
        timestamp: new Date().toISOString(),
        endpoints: {},
        corsStatus: 'unknown',
        overall: false
      };
      
      // Test CORS by trying to access the API directly
      try {
        const baseUrl = window.location.origin;
        const corsTest = await fetch(`${baseUrl}/api/v1`, { 
          method: 'OPTIONS',
          headers: { 'Origin': baseUrl }
        });
        results.corsStatus = corsTest.ok ? 'ok' : `failed: ${corsTest.status}`;
      } catch (corsErr) {
        results.corsStatus = `error: ${corsErr.message}`;
      }
      
      // Test various endpoints
      const endpoints = ['/api/v1/health', '/api/v1/auth/demo-users', '/api/v1', '/'];
      let anySucceeded = false;
      
      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          
          const resp = await fetch(endpoint, {
            signal: controller.signal,
            headers: { 'Cache-Control': 'no-cache' }
          });
          
          clearTimeout(timeoutId);
          
          results.endpoints[endpoint] = {
            status: resp.status,
            ok: resp.ok
          };
          
          if (resp.ok || resp.status < 500) anySucceeded = true;
        } catch (err) {
          results.endpoints[endpoint] = {
            error: err.name === 'AbortError' ? 'timeout' : err.message
          };
        }
      }
      
      results.overall = anySucceeded;
      return results;
    } catch (error) {
      return {
        timestamp: new Date().toISOString(),
        overall: false,
        error: error.message
      };
    }
  }
};

// Export the configured axios instance for other services
export default api;