const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Helper function for making fetch requests
async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include' // Important for cookies/sessions
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `API error: ${response.status}`);
  }
  
  return response.json();
}

// Authentication API
export const authService = {
  login: async (username: string, password: string) => {
    return fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },
  
  logout: async () => {
    return fetchApi('/auth/logout', { method: 'POST' });
  },
  
  getCurrentUser: async () => {
    return fetchApi('/auth/me');
  },
  
  register: async (userData: any) => {
    return fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  getUsers: async () => {
    try {
      return await fetchApi('/auth/demo-users');
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

// Users API
export const userService = {
  getAll: async () => {
    return fetchApi('/users');
  },
  
  getById: async (id: string | number) => {
    return fetchApi(`/users/${id}`);
  },
  
  create: async (userData: any) => {
    return fetchApi('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  update: async (id: string | number, userData: any) => {
    return fetchApi(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData)
    });
  },
  
  delete: async (id: string | number) => {
    return fetchApi(`/users/${id}`, { method: 'DELETE' });
  },
  
  // Add getCurrentUser method that uses the auth endpoint
  getCurrentUser: async () => {
    return fetchApi('/auth/me');
  }
};

// Products API
export const productService = {
  getAll: async () => {
    return fetchApi('/products');
  },
  
  getById: async (id: string | number) => {
    return fetchApi(`/products/${id}`);
  },
  
  create: async (productData: any) => {
    return fetchApi('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },
  
  update: async (id: string | number, productData: any) => {
    return fetchApi(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(productData)
    });
  },
  
  delete: async (id: string | number) => {
    return fetchApi(`/products/${id}`, { method: 'DELETE' });
  }
};

// Friends API
export const friendService = {
  getFriends: async (userId: string | number) => {
    return fetchApi(`/friends/${userId}`);
  },
  
  addFriend: async (userId: string | number, friendId: string | number) => {
    return fetchApi(`/friends/${userId}/add/${friendId}`, { method: 'POST' });
  },
  
  removeFriend: async (userId: string | number, friendId: string | number) => {
    return fetchApi(`/friends/${userId}/remove/${friendId}`, { method: 'DELETE' });
  }
};

// Global error handler for fetch
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason instanceof Error && event.reason.message.includes('API error: 401')) {
    console.error('Authentication error');
    // You can add logic to redirect to login page here
  }
});

export default { authService, userService, productService, friendService };
