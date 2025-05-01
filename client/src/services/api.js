import axios from 'axios';
import { authHeader, isAuthenticated } from './auth';

// Base URL from environment variables with fallback
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance with custom config
const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true, // Enable sending cookies with requests
  timeout: 10000
});

// Add request interceptor to attach auth token
apiClient.interceptors.request.use(
  config => {
    // Use the authHeader function from auth.js instead of the store
    if (isAuthenticated()) {
      Object.assign(config.headers, authHeader());
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Log errors to console in development
    if (import.meta.env.DEV) {
      console.error('API Error:', error.response || error);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;