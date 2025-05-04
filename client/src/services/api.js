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

// Export with enhanced getDemoUsers
export const authService = {
  login,
  logout,
  getCurrentUser,
  getDemoUsers,
  // ...other methods...
};