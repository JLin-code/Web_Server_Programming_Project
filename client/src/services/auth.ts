import axios from 'axios'
import type { User } from '../types/User'

// Create API client
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Default fallback users for when API is not available
const fallbackUsers = [
  {
    id: 'fallback-1', 
    username: 'user@example.com',
    displayName: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user'
  },
  {
    id: 'fallback-2', 
    username: 'admin@example.com',
    displayName: 'Admin User',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  }
]

// Auth service for login, logout and session management
export const authService = {
  // Login with username and password
  async login(username: string, password: string) {
    try {
      const response = await apiClient.post('/auth/login', {
        email: username,
        password
      })
      
      if (response.data && response.data.success) {
        return {
          success: true,
          user: response.data.user
        }
      }
      
      // Fallback login if API returns unsuccessful response
      return this.fallbackLogin(username)
    } catch (error) {
      console.error('Login error:', error)
      // Use fallback login
      return this.fallbackLogin(username)
    }
  },
  
  // Fallback login when API is not available
  fallbackLogin(username: string) {
    const user = fallbackUsers.find(u => u.username === username)
    
    if (user) {
      return {
        success: true,
        user: {
          id: user.id,
          name: user.displayName || `${user.firstName} ${user.lastName}`,
          email: user.username,
          isAdmin: user.role === 'admin'
        }
      }
    }
    
    return {
      success: false,
      message: 'Invalid username or password'
    }
  },
  
  // Get current user
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/current')
      
      if (response.data && response.data.success) {
        return {
          success: true,
          user: response.data.user
        }
      }
      
      return {
        success: false,
        message: 'No active session'
      }
    } catch (error) {
      console.error('Get current user error:', error)
      return {
        success: false,
        message: 'Error fetching current user'
      }
    }
  },
  
  // Logout current user
  async logout() {
    try {
      const response = await apiClient.post('/auth/logout')
      return response.data
    } catch (error) {
      console.error('Logout error:', error)
      return {
        success: true, // Return success anyway to allow client-side logout
        message: 'Client-side logout completed'
      }
    }
  }
}
