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
      console.log('Attempting to fetch demo users from API...');
      // Add debug logging for network issues
      const startTime = Date.now();
      
      try {
        // First, check if the API is reachable with a quick ping
        const pingResponse = await fetch('/api/ping', { 
          method: 'HEAD',
          cache: 'no-store'
        });
        console.log(`API ping response: ${pingResponse.status}`);
      } catch (pingErr) {
        console.warn('API ping failed:', pingErr);
      }
      
      // Add a timeout to ensure we wait for the API response
      const result = await Promise.race([
        authService.getDemoUsers(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('API request timeout')), 8000)
        )
      ]).catch(err => {
        console.warn('API error in getDemoUsers:', err);
        return { success: false, message: `API error: ${err.message || 'Unknown error'}`, users: [] };
      });
      
      const requestTime = Date.now() - startTime;
      console.log(`API response for demo users (took ${requestTime}ms):`, result);
      
      if (result?.success && Array.isArray(result.users) && result.users.length > 0) {
        demoUsers.value = result.users;
        console.log('Demo users fetched successfully from API:', demoUsers.value);
        return true;
      }
      
      // Log more details about the API response
      if (!result?.success) {
        console.warn('API returned unsuccessful response:', result?.message);
      } else if (!Array.isArray(result.users)) {
        console.warn('API response users is not an array:', result.users);
      } else if (result.users.length === 0) {
        console.warn('API returned empty users array');
      }
      
      // If API returns no users, use fallback from hardcodedUsers
      console.warn('Falling back to hardcoded users');
      try {
        // Import directly from TS file with explicit extension
        const { demoUsers: hardcodedDemoUsers } = await import('../data/hardcodedUsers');
        if (Array.isArray(hardcodedDemoUsers) && hardcodedDemoUsers.length > 0) {
          demoUsers.value = hardcodedDemoUsers.map(user => ({
            username: user.username,
            displayName: user.displayName
          }));
          console.log('Using hardcoded fallback users:', demoUsers.value.length);
          return false; // Return false to indicate we're using fallbacks
        }
      } catch (fallbackErr) {
        console.error('Error importing fallback users:', fallbackErr);
      }
      
      error.value = result?.message || 'No demo users available from server';
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
