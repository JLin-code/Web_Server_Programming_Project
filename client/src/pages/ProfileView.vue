<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { authService } from '../services/api';
import { mockDataService } from '../services/mockDataService';
import ProfilePage from '../components/ProfilePage.vue';

const page = 'User Profile';
const loading = ref(true);
const error = ref('');
const userId = ref<string | null>(null);
const route = useRoute();
const usingMockData = ref(false);
const maxRetries = 2;
let retries = 0;

// Function to get user from localStorage fallback
const getUserFromLocalStorage = () => {
  try {
    const localUser = localStorage.getItem('currentUser');
    if (localUser) {
      const parsedUser = JSON.parse(localUser);
      if (parsedUser && parsedUser.id) {
        console.log('Using localStorage user:', parsedUser.id);
        return parsedUser;
      }
    }
    return null;
  } catch (err) {
    console.error('Error parsing localStorage user:', err);
    return null;
  }
};

// Try to get fallback user for when API fails
const getFallbackUser = () => {
  // First try localStorage
  const localStorageUser = getUserFromLocalStorage();
  if (localStorageUser) return localStorageUser;
  
  // Create default mock user as last resort
  return {
    id: 'mock-user-001',
    first_name: 'Demo',
    last_name: 'User',
    email: 'demo@example.com',
    role: 'user',
    profile_picture_url: 'https://randomuser.me/api/portraits/men/3.jpg'
  };
};

// Function to fetch current user with retries
const fetchCurrentUser = async () => {
  try {
    // Try to get current user from API
    const response = await authService.getCurrentUser().catch(err => {
      console.error('Error fetching current user in profile:', err);
      return null;
    });
    
    if (response && response.user) {
      userId.value = response.user.id;
      return response.user;
    }
    
    // If API fails, check if more retries are available
    if (retries < maxRetries) {
      retries++;
      console.log(`Retrying getCurrentUser (${retries}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return await fetchCurrentUser();
    }
    
    // If all retries fail, use fallback
    console.log('Using fallback user data after API failures');
    const fallbackUser = getFallbackUser();
    userId.value = fallbackUser.id;
    usingMockData.value = true;
    return fallbackUser;
  } catch (err) {
    console.error('Error getting current user:', err);
    const fallbackUser = getFallbackUser();
    userId.value = fallbackUser.id;
    usingMockData.value = true;
    return fallbackUser;
  }
};

onMounted(async () => {
  console.log('ProfileView mounted');
  
  try {
    // If ID is provided in route, use that
    if (route.params.id) {
      userId.value = route.params.id as string;
      loading.value = false;
    } else {
      // Otherwise, try to get current user with advanced fallback
      const user = await fetchCurrentUser();
      
      if (!user) {
        error.value = 'Unable to load user profile. Using demo data instead.';
        usingMockData.value = true;
      }
      
      loading.value = false;
    }
  } catch (err) {
    console.error('Error in ProfileView setup:', err);
    error.value = 'Failed to load profile. Using demo data instead.';
    loading.value = false;
    usingMockData.value = true;
    
    // Set a fallback user ID for demo data
    userId.value = 'mock-user-001';
  }
});
</script>

<template>
  <div class="profile-view">
    <h1 class="page-title">{{ page }}</h1>
    
    <div v-if="usingMockData" class="notification is-warning">
      <p><strong>Note:</strong> Showing sample data because we couldn't connect to the server.</p>
    </div>
    
    <div v-if="loading" class="loading-container">
      <p>Loading profile information...</p>
      <progress class="progress is-primary" max="100"></progress>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <div class="buttons is-centered mt-3">
        <button @click="$router.push('/my-activity')" class="button is-primary">
          Go to My Activities
        </button>
        <button @click="$router.push('/')" class="button is-light">
          Return to Home
        </button>
      </div>
    </div>
    
    <ProfilePage v-else :userId="userId" :useMockData="usingMockData" />
  </div>
</template>

<style scoped>
.profile-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.page-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #ffffff;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 2rem;
  background-color: #1e1e1e;
  border-radius: 8px;
  color: #ffffff;
  margin: 2rem 0;
}

.button {
  margin-top: 1rem;
}

.notification {
  margin-bottom: 1.5rem;
  border-radius: 8px;
}

.buttons {
  justify-content: center;
}
</style>
