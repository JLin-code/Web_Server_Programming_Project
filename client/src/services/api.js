const API_URL = 'http://localhost:5000/api';

/**
 * @typedef {Object} DemoUser
 * @property {string} username - Username for login
 * @property {string} displayName - Display name in the dropdown
 */

/**
 * @typedef {Object} DemoUsersResponse
 * @property {boolean} success - Whether the request was successful
 * @property {DemoUser[]} users - Array of demo users
 */

// Define types for our service responses
/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} first_name - User's first name
 * @property {string} last_name - User's last name
 * @property {string} role - User role
 * @property {string} [handle] - Optional user handle
 */

/**
 * @typedef {Object} LoginResponse
 * @property {boolean} success - Whether the login was successful
 * @property {string} message - Login response message
 * @property {User} user - User information
 */

/**
 * Auth service for handling authentication operations
 * @type {{
 *   login: (username: string, password: string) => Promise<LoginResponse>,
 *   logout: () => Promise<{success: boolean, message: string}>,
 *   getCurrentUser: () => Promise<{user: User | null}>,
 *   register: (userData: any) => Promise<any>,
 *   getUsers: () => Promise<DemoUsersResponse>
 * }}
 */
export const authService = {
  async login(username, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to login');
    }

    return response.json();
  },

  async logout() {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to logout');
    }

    return response.json();
  },

  async getCurrentUser() {
    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to get current user');
    }

    return response.json();
  },

  async register(userData) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to register');
    }

    return response.json();
  },

  /**
   * Fetches demo users for the login dropdown
   * @returns {Promise<DemoUsersResponse>} List of demo users
   */
  async getUsers() {
    try {
      const response = await fetch(`${API_URL}/auth/demo-users`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.error('Demo users fetch failed:', response.status);
        throw new Error('Failed to fetch demo users');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error in getUsers:', error);
      // Return a fallback if server is unreachable
      return { 
        success: false, 
        users: [{ username: 'Admin', displayName: 'Admin (Fallback)' }] 
      };
    }
  }
};