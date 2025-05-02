import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { authService } from '../services/api';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  created_at?: string;
}

interface DemoUser {
  username: string;
  displayName: string;
}

export const useUsersStore = defineStore('users', () => {
  // State
  const users = ref<User[]>([]);
  const currentUser = ref<User | null>(null);
  const demoUsers = ref<DemoUser[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const userCount = computed(() => users.value.length);
  
  const getUserById = computed(() => {
    return (id: string) => users.value.find(user => user.id === id);
  });

  // Actions
  async function fetchUsers() {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.get('/api/v1/users');
      users.value = response.data.users;
      return true;
    } catch (err) {
      console.error('Error fetching users:', err);
      error.value = 'Failed to fetch users';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchUserById(id: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.get(`/api/v1/users/${id}`);
      
      if (response.data.success) {
        // Add to users array if not already there
        const existingIndex = users.value.findIndex(u => u.id === response.data.user.id);
        
        if (existingIndex >= 0) {
          users.value[existingIndex] = response.data.user;
        } else {
          users.value.push(response.data.user);
        }
        
        return response.data.user;
      }
      
      return null;
    } catch (err) {
      console.error(`Error fetching user ${id}:`, err);
      error.value = 'Failed to fetch user';
      return null;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function fetchDemoUsers() {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await authService.getDemoUsers();
      
      if (result.success) {
        demoUsers.value = result.users;
        return true;
      }
      
      error.value = result.message || 'Failed to fetch demo users';
      return false;
    } catch (err) {
      console.error('Error fetching demo users:', err);
      error.value = 'Failed to fetch demo users';
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function updateUser(id: string, userData: Partial<User>) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.put(`/api/v1/users/${id}`, userData);
      
      if (response.data.success) {
        // Update in the users array
        const index = users.value.findIndex(u => u.id === id);
        
        if (index >= 0) {
          users.value[index] = { ...users.value[index], ...response.data.user };
        }
        
        return response.data.user;
      }
      
      error.value = response.data.message || 'Failed to update user';
      return null;
    } catch (err) {
      console.error(`Error updating user ${id}:`, err);
      error.value = 'Failed to update user';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    // State
    users,
    currentUser,
    demoUsers,
    isLoading,
    error,
    
    // Getters
    userCount,
    getUserById,
    
    // Actions
    fetchUsers,
    fetchUserById,
    fetchDemoUsers,
    updateUser
  };
});
