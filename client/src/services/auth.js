import axios from 'axios';
import { supabase } from './supabase';

// API base URL from environment
const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Create axios instance with credentials support
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Log configuration for debugging
console.log('Auth service configured with API URL:', API_URL);

export const authService = {
  async login(username, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Login failed:', error);
      // Return a structured error object rather than throwing
      return { 
        success: false, 
        message: 'Network error during login. Please try again.' 
      };
    }
  },

  async logout() {
    try {
      console.log('Attempting API logout');
      const response = await apiClient.post('/auth/logout');
      
      // Also logout from Supabase directly
      try {
        await supabase.auth.signOut();
      } catch (supabaseError) {
        console.warn('Supabase logout error:', supabaseError);
      }
      
      return response.data;
    } catch (error) {
      console.error('API logout error:', error.response?.data || error.message);
      
      // Try Supabase logout directly
      try {
        await supabase.auth.signOut();
        return { success: true };
      } catch (supabaseError) {
        console.error('Supabase logout error:', supabaseError);
        throw error;
      }
    }
  },

  async getCurrentUser() {
    try {
      const response = await fetch(`${API_URL}/auth/current-user`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated - this is normal for logged out users
          return { success: false, user: null };
        }
        throw new Error(`Server returned ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn('Get current user failed:', error);
      // Return a structured error object rather than throwing
      return { 
        success: false, 
        message: 'Failed to get current user', 
        user: null 
      };
    }
  },

  async getDemoUsers() {
    try {
      console.log('Fetching demo users for login form from API');
      const response = await apiClient.get('/auth/demo-users');
      return response.data;
    } catch (error) {
      console.error('Error fetching demo users from API:', error.response?.data || error.message);
      
      // Try fetching from Supabase directly
      try {
        console.log('Attempting to get demo users from Supabase');
        const { data, error: supabaseError } = await supabase
          .from('users')
          .select('id, email, first_name, last_name, role')
          .limit(5);
        
        if (supabaseError) throw supabaseError;
        
        // Transform to expected format
        return {
          success: true,
          users: data.map(user => ({
            username: user.email,
            displayName: `${user.first_name} ${user.last_name} (${user.role === 'admin' ? 'Admin' : 'User'})`,
          })),
          source: 'supabase-direct'
        };
      } catch (supabaseError) {
        console.error('Supabase demo users error:', supabaseError);
        
        // Return hardcoded fallback
        return {
          success: true,
          users: [
            { username: 'john.doe@example.com', displayName: 'John Doe (User)' },
            { username: 'jane.smith@example.com', displayName: 'Jane Smith (User)' },
            { username: 'admin@example.com', displayName: 'Admin User (Admin)' },
            { username: 'emily.johnson@example.com', displayName: 'Emily Johnson (User)' },
            { username: 'david.wilson@example.com', displayName: 'David Wilson (User)' }
          ],
          source: 'hardcoded-fallback'
        };
      }
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
