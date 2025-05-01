import { ref, reactive } from 'vue';
import { authService } from '../services/api';
import type { User } from '../types';

interface UserState {
  id: string | number | null;
  firstName: string;
  lastName: string;
  email: string;
  handle: string;
  isAdmin: boolean;
  avatar?: string;
}

// Create reactive state
const currentUser = ref<UserState | null>(null);
const isAuthenticated = ref(false);
const isLoading = ref(false);
const error = ref('');

// Initialize the store by checking for existing sessions
const initializeStore = async () => {
  isLoading.value = true;
  
  try {
    // Check if user is already logged in
    const response = await authService.getCurrentUser();
    
    if (response?.user) {
      setCurrentUser({
        id: response.user.id,
        firstName: response.user.first_name,
        lastName: response.user.last_name,
        email: response.user.email,
        handle: response.user.handle,
        isAdmin: response.user.is_admin,
        avatar: response.user.avatar
      });
    }
  } catch (err) {
    console.error('Failed to initialize user store:', err);
    error.value = 'Failed to restore session';
  } finally {
    isLoading.value = false;
  }
};

// Login handler
const login = async (email: string, password: string) => {
  isLoading.value = true;
  error.value = '';
  
  try {
    const response = await authService.login(email, password);
    
    if (response.user) {
      setCurrentUser({
        id: response.user.id,
        firstName: response.user.first_name,
        lastName: response.user.last_name,
        email: response.user.email,
        handle: response.user.handle,
        isAdmin: response.user.is_admin,
        avatar: response.user.avatar
      });
      return true;
    }
    return false;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Login failed';
    return false;
  } finally {
    isLoading.value = false;
  }
};

// Logout handler
const logout = async () => {
  try {
    await authService.logout();
    clearUser();
    return true;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Logout failed';
    return false;
  }
};

// Register handler
const register = async (userData: any) => {
  isLoading.value = true;
  error.value = '';
  
  try {
    const response = await authService.register(userData);
    
    if (response.user) {
      setCurrentUser({
        id: response.user.id,
        firstName: response.user.first_name,
        lastName: response.user.last_name,
        email: response.user.email,
        handle: response.user.handle,
        isAdmin: response.user.is_admin,
        avatar: response.user.avatar
      });
      return true;
    }
    return false;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Registration failed';
    return false;
  } finally {
    isLoading.value = false;
  }
};

// Set user data
const setCurrentUser = (user: UserState) => {
  currentUser.value = user;
  isAuthenticated.value = !!user;
};

// Clear user data
const clearUser = () => {
  currentUser.value = null;
  isAuthenticated.value = false;
};

// Export the store
export const userStore = {
  currentUser,
  isAuthenticated,
  isLoading,
  error,
  initializeStore,
  login,
  logout,
  register,
  setCurrentUser,
  clearUser
};
