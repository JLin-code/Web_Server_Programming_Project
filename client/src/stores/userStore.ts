import { ref } from 'vue';
import type { User } from '../types';

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  error: string;
}

// Create a reactive state
const currentUser = ref<User | null>(null);
const isAuthenticated = ref(false);
const error = ref('');

// Export the store
export const userStore = {
  currentUser,
  isAuthenticated,
  error,
  
  // Add more methods as needed
  setCurrentUser(user: User | null) {
    currentUser.value = user;
    isAuthenticated.value = !!user;
  },
  
  clearUser() {
    currentUser.value = null;
    isAuthenticated.value = false;
  }
};
