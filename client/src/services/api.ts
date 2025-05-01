import axios from 'axios';

// Get the base URL from environment variables, or use a default for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for authentication
api.interceptors.request.use(
  config => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to every request header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      // You might want to use a store to trigger UI updates
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Extract the error message from the response or use a default
    const errorMessage = 
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
      
    // You can trigger a notification system here
    console.error('API Error:', errorMessage);
    
    return Promise.reject(error);
  }
);

// Authentication service
export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { email: username, password });
    // Save token to localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  logout: async () => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    return { success: true };
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/current-user');
      return response.data;
    } catch (error) {
      // If there's an error, user is likely not logged in
      return null;
    }
  },
  
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }
};

// User service
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
  },
  
  getUserStats: async (id: string | number) => {
    const response = await api.get(`/users/stats/${id}`);
    return response.data;
  }
};

// Friend service
export const friendService = {
  getFriends: async () => {
    const response = await api.get('/friends');
    return response.data;
  },
  
  addFriend: async (friendId: string | number) => {
    const response = await api.post(`/friends/add/${friendId}`);
    return response.data;
  },
  
  removeFriend: async (friendId: string | number) => {
    const response = await api.delete(`/friends/remove/${friendId}`);
    return response.data;
  }
};

// Activity service
export const activitiesService = {
  getAll: async () => {
    const response = await api.get('/activities');
    return response.data;
  },
  
  getById: async (id: string | number) => {
    const response = await api.get(`/activities/${id}`);
    return response.data;
  },
  
  create: async (activityData: any) => {
    const response = await api.post('/activities', activityData);
    return response.data;
  },
  
  update: async (id: string | number, activityData: any) => {
    const response = await api.patch(`/activities/${id}`, activityData);
    return response.data;
  },
  
  delete: async (id: string | number) => {
    const response = await api.delete(`/activities/${id}`);
    return response.data;
  },
  
  getMyActivities: async () => {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser?.user?.id) {
      throw new Error('User not authenticated');
    }
    const response = await api.get(`/activities/user/${currentUser.user.id}`);
    return response.data;
  },
  
  getFriendActivities: async () => {
    const response = await api.get('/activities/friends');
    return response.data;
  },
  
  getActivityStats: async (period = 'week') => {
    const response = await api.get(`/activities/stats/${period}`);
    return response.data;
  }
};

// Exercise Types service
export const exerciseTypesService = {
  getAll: async () => {
    const response = await api.get('/exercise-types');
    return response.data;
  },
  
  getById: async (id: string | number) => {
    const response = await api.get(`/exercise-types/${id}`);
    return response.data;
  },
  
  create: async (exerciseData: any) => {
    const response = await api.post('/exercise-types', exerciseData);
    return response.data;
  },
  
  update: async (id: string | number, exerciseData: any) => {
    const response = await api.patch(`/exercise-types/${id}`, exerciseData);
    return response.data;
  },
  
  delete: async (id: string | number) => {
    const response = await api.delete(`/exercise-types/${id}`);
    return response.data;
  },
  
  getPopular: async (limit = 5) => {
    const response = await api.get(`/exercise-types/popular?limit=${limit}`);
    return response.data;
  }
};

export default { 
  authService, 
  userService, 
  friendService, 
  activitiesService, 
  exerciseTypesService 
};
