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
    let lastError = null;
    let retries = 2;
    
    while (retries >= 0) {
      try {
        console.log(`Attempting to get current user (${retries} retries left)`);
        const response = await api.get('/auth/current-user');
        return response.data;
      } catch (err) {
        lastError = err;
        
        // If it's a 401 Unauthorized, the user is simply not logged in - don't retry
        if (err.response && err.response.status === 401) {
          console.log('User not authenticated (401) - this is normal for guests');
          break;
        }
        
        // Only retry on connection errors
        if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
          retries--;
          if (retries >= 0) {
            console.log(`Connection failed, retrying ${retries} more times...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            continue;
          }
        } else {
          // Log non-401 errors as actual errors
          console.error(`Get current user failed with ${err.response?.status || 'unknown'} error:`, err);
          break; // Don't retry on other errors
        }
      }
    }
    
    // If server is down, return a standardized offline response
    if (lastError && (lastError.code === 'ECONNREFUSED' || lastError.code === 'ERR_NETWORK')) {
      console.warn('API server appears to be offline');
      return {
        success: false,
        message: 'API server is offline or unreachable',
        offline: true
      };
    }
    
    // For 401 errors, return a standardized unauthorized response
    if (lastError && lastError.response && lastError.response.status === 401) {
      return {
        success: false,
        message: 'User is not authenticated',
        unauthorized: true
      };
    }
    
    return {
      success: false,
      message: lastError instanceof Error ? lastError.message : 'Failed to get current user'
    };
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