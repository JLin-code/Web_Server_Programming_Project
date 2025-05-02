import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../utils/supabaseClient';
import { authService } from '../services/api';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isAdmin: boolean;
  } | null>(null);
  
  const isAuthenticated = ref(false);
  const authError = ref<string | null>(null);
  const isLoading = ref(false);

  // Getters
  const fullName = computed(() => {
    return user.value ? `${user.value.firstName} ${user.value.lastName}` : '';
  });

  const userRole = computed(() => {
    return user.value?.role || 'guest';
  });

  // Actions
  async function login(email: string, password: string) {
    isLoading.value = true;
    authError.value = null;
    
    try {
      // First try Supabase auth if available
      let isSuccessful = false;
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        if (data?.user) isSuccessful = true;
        
      } catch (supabaseError) {
        console.warn('Supabase login failed, falling back to API:', supabaseError);
      }
      
      // If Supabase failed or isn't set up, use API login
      if (!isSuccessful) {
        const response = await authService.login(email, password);
        
        if (!response.success) {
          throw new Error(response.message || 'Login failed');
        }
        
        user.value = {
          id: response.user.id,
          firstName: response.user.first_name,
          lastName: response.user.last_name,
          email: response.user.email,
          role: response.user.role,
          isAdmin: response.user.role === 'admin'
        };
        
        isAuthenticated.value = true;
        return true;
      }
      
      // If we succeeded with Supabase, fetch user details from API
      const userDetails = await authService.getCurrentUser();
      
      if (userDetails.success && userDetails.user) {
        user.value = {
          id: userDetails.user.id,
          firstName: userDetails.user.first_name,
          lastName: userDetails.user.last_name,
          email: userDetails.user.email,
          role: userDetails.user.role,
          isAdmin: userDetails.user.role === 'admin'
        };
        
        isAuthenticated.value = true;
        return true;
      }
      
      throw new Error('Failed to get user details after authentication');
      
    } catch (error) {
      authError.value = error instanceof Error ? error.message : 'An unknown error occurred';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    isLoading.value = true;
    
    try {
      // Try Supabase logout
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.warn('Supabase logout error:', error);
      }
      
      // Also perform API logout
      await authService.logout();
      
      // Clear local state
      user.value = null;
      isAuthenticated.value = false;
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function checkAuthStatus() {
    isLoading.value = true;
    
    try {
      // Check Supabase session first
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          // We have a Supabase session, get user details from API
          const userDetails = await authService.getCurrentUser();
          
          if (userDetails.success && userDetails.user) {
            user.value = {
              id: userDetails.user.id,
              firstName: userDetails.user.first_name,
              lastName: userDetails.user.last_name,
              email: userDetails.user.email,
              role: userDetails.user.role,
              isAdmin: userDetails.user.role === 'admin'
            };
            
            isAuthenticated.value = true;
            return true;
          }
        }
      } catch (error) {
        console.warn('Error checking Supabase session:', error);
      }
      
      // Fall back to API check
      const response = await authService.getCurrentUser();
      
      if (response.success && response.user) {
        user.value = {
          id: response.user.id,
          firstName: response.user.first_name,
          lastName: response.user.last_name,
          email: response.user.email,
          role: response.user.role,
          isAdmin: response.user.role === 'admin'
        };
        
        isAuthenticated.value = true;
        return true;
      }
      
      // Not authenticated
      return false;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    // State
    user,
    isAuthenticated,
    authError,
    isLoading,
    
    // Getters
    fullName,
    userRole,
    
    // Actions
    login,
    logout,
    checkAuthStatus
  };
});
