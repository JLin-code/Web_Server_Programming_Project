import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Create axios instance with credentials support
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important for cookies/sessions
});

// Authentication API
export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }
};

// Users API
export const userService = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  getById: async (id: string | number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  create: async (userData: any) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  update: async (id: string | number, userData: any) => {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  },
  
  delete: async (id: string | number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

// Products API
export const productService = {
  getAll: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  
  getById: async (id: string | number) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  create: async (productData: any) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  
  update: async (id: string | number, productData: any) => {
    const response = await api.patch(`/products/${id}`, productData);
    return response.data;
  },
  
  delete: async (id: string | number) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};

// Friends API
export const friendService = {
  getFriends: async (userId: string | number) => {
    const response = await api.get(`/friends/${userId}`);
    return response.data;
  },
  
  addFriend: async (userId: string | number, friendId: string | number) => {
    const response = await api.post(`/friends/${userId}/add/${friendId}`);
    return response.data;
  },
  
  removeFriend: async (userId: string | number, friendId: string | number) => {
    const response = await api.delete(`/friends/${userId}/remove/${friendId}`);
    return response.data;
  }
};

// Add request interceptor for authentication
api.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Redirect to login or dispatch logout action
      console.error('Authentication error');
    }
    return Promise.reject(error);
  }
);

export default api;
