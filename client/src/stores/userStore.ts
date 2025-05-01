import { reactive } from 'vue';
import supabase from '../services/supabase';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isAdmin: boolean;
  isLoggedIn: boolean;
}

// Initialize with empty values
const userProfile = reactive<UserProfile>({
  id: '',
  email: '',
  firstName: '',
  lastName: '',
  role: '',
  isAdmin: false,
  isLoggedIn: false
});

export const userStore = {
  // Getter for the user profile
  get profile() {
    return userProfile;
  },
  
  // Check if user is authenticated and load profile
  async initialize() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        this.clearProfile();
        return false;
      }
      
      // User is logged in, load profile data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, role')
        .eq('email', session.user.email)
        .single();
      
      if (userError || !userData) {
        console.error('Error loading user profile:', userError);
        this.clearProfile();
        return false;
      }
      
      // Update profile with database data
      userProfile.id = userData.id;
      userProfile.email = userData.email;
      userProfile.firstName = userData.first_name;
      userProfile.lastName = userData.last_name;
      userProfile.role = userData.role;
      userProfile.isAdmin = userData.role === 'admin';
      userProfile.isLoggedIn = true;
      
      return true;
    } catch (error) {
      console.error('Error initializing user store:', error);
      this.clearProfile();
      return false;
    }
  },
  
  // Set the user profile after login
  setProfile(userData: { 
    id: string; 
    email: string; 
    first_name: string; 
    last_name: string; 
    role: string; 
  }) {
    userProfile.id = userData.id;
    userProfile.email = userData.email;
    userProfile.firstName = userData.first_name;
    userProfile.lastName = userData.last_name;
    userProfile.role = userData.role;
    userProfile.isAdmin = userData.role === 'admin';
    userProfile.isLoggedIn = true;
  },
  
  // Clear the user profile on logout
  clearProfile() {
    userProfile.id = '';
    userProfile.email = '';
    userProfile.firstName = '';
    userProfile.lastName = '';
    userProfile.role = '';
    userProfile.isAdmin = false;
    userProfile.isLoggedIn = false;
  }
};

// Initialize on import
userStore.initialize();
