<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase, supabaseActivities } from '../services/supabase';
import { authService } from '../services/api';
import { mockDataService } from '../services/mockDataService';
import { checkServerHealth } from '../utils/serverHealth';
import type { Activity, User } from '../types';

const page = 'My Activity';
const currentUser = ref<User | null>(null);
const activities = ref<Activity[]>([]);
const loading = ref(true);
const error = ref('');
const showingSampleData = ref(false);
const retryCount = ref(0);

// Format date helper
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get current user
const getCurrentUser = async () => {
  try {
    loading.value = true;
    error.value = ''; // Clear any previous errors
    
    // Check server connectivity first
    const serverHealth = await checkServerHealth();
    if (!serverHealth.online) {
      console.warn('Server health check failed:', serverHealth);
      error.value = `Server is offline. ${serverHealth.error || ''}`;
      await fetchSampleActivities();
      return;
    }
    
    // Add a timeout to prevent infinite loading
    const userPromise = authService.getCurrentUser();
    const timeoutPromise = new Promise<{user: null}>(resolve => 
      setTimeout(() => resolve({user: null}), 8000)
    );
    
    // Race between the actual request and a timeout
    const response = await Promise.race([userPromise, timeoutPromise]);
    
    if (response && response.user) {
      currentUser.value = response.user;
      // Once we have the user, get their activities
      await fetchUserActivities();
    } else {
      // Try to get user from localStorage as fallback
      try {
        const localUser = localStorage.getItem('currentUser');
        if (localUser) {
          const parsedUser = JSON.parse(localUser);
          if (parsedUser && parsedUser.id) {
            console.log('Using localStorage user:', parsedUser.id);
            currentUser.value = parsedUser;
            await fetchUserActivities();
            return;
          }
        }
      } catch (parseErr) {
        console.error('Error parsing localStorage user:', parseErr);
      }
      
      // If still no user, show sample data
      await fetchSampleActivities();
    }
  } catch (err: any) {
    console.error('Failed to get current user:', err);
    // Improve error message with more context
    if (err.message && err.message.includes('Proxy error')) {
      error.value = 'Server is offline. Proxy error: Unable to connect to API server';
    } else if (err.message && err.message.includes('fetch')) {
      error.value = 'Network error: Unable to reach the server';
    } else {
      error.value = `Failed to authenticate user: ${err.message || 'Unknown error'}`;
    }
    loading.value = false;
    // Try sample data as last resort
    await fetchSampleActivities();
  }
};

// Fetch user activities
const fetchUserActivities = async () => {
  if (!currentUser.value?.id) {
    error.value = 'User not authenticated';
    loading.value = false;
    return;
  }

  try {
    // Check server connectivity before trying to fetch activities
    const serverHealth = await checkServerHealth();
    if (!serverHealth.online) {
      console.warn('Server health check failed before fetching activities:', serverHealth);
      error.value = `Server is offline. ${serverHealth.error || ''}`;
      await fetchSampleActivities();
      return;
    }

    // Add timeout to prevent hanging
    const activityPromise = supabaseActivities.getUserActivities(currentUser.value.id);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timed out')), 10000)
    );
    
    // Race between the actual request and a timeout
    const result = await Promise.race([activityPromise, timeoutPromise]);
    
    if (result && result.success && result.items && result.items.length > 0) {
      // Simplify user information to only show name
      activities.value = result.items.map(activity => ({
        ...activity,
        user: {
          name: 'You', // Simplify user display to just "You" for the current user
          id: activity.user?.id || currentUser.value?.id
        }
      }));
      showingSampleData.value = false;
    } else {
      console.warn('No activities found or empty result:', result);
      await fetchSampleActivities();
    }
  } catch (err: any) {
    console.error('Failed to load activities:', err);
    // Enhanced error handling with more specific messages
    if (err.message && err.message.includes('timeout')) {
      error.value = 'Request timeout: Server took too long to respond';
    } else if (err.message && err.message.includes('Proxy error')) {
      error.value = 'Server is offline. Proxy error: Unable to connect to API server';
    } else if (err.message && err.message.includes('fetch')) {
      error.value = 'Network error: Unable to reach the server';
    } else {
      error.value = `Failed to load activities: ${err.message || 'Unknown error'}`;
    }
    
    // Check server health to see if it's a connectivity issue
    checkServerHealth().then(health => {
      if (!health.online) {
        error.value = `Server is offline. ${health.error || ''}`;
      }
    });
    await fetchSampleActivities();
  } finally {
    loading.value = false;
  }
};

// Fetch sample activities when API is unavailable
const fetchSampleActivities = async () => {
  showingSampleData.value = true;
  console.log("Loading sample activities (API is unavailable)");
  
  try {
    // Get mock activities from the mockDataService
    let sampleActivities = mockDataService.getDefaultActivities();
    
    // If no mock activities are returned or the function doesn't exist
    if (!sampleActivities || !Array.isArray(sampleActivities) || sampleActivities.length === 0) {
      console.log("Creating fallback mock activities");
      
      // Generate some basic mock activities as fallback
      sampleActivities = [
        {
          id: 'mock-001',
          title: 'Morning Run',
          description: 'Quick 5K run around the park',
          type: 'running',
          created_at: new Date().toISOString(),
          user: {
            id: 'current-user',
            name: 'You',
            profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg'
          },
          likes: 5,
          comments: 2
        },
        {
          id: 'mock-002',
          title: 'Evening Yoga',
          description: 'Relaxing yoga session at home',
          type: 'yoga',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          user: {
            id: 'current-user',
            name: 'You',
            profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg'
          },
          likes: 3,
          comments: 1
        }
      ];
    }
    
    // Only modify user name for activities that belong to current user
    if (currentUser.value && currentUser.value.id) {
      sampleActivities = sampleActivities.map(activity => {
        // Only change user name to "You" if this activity belongs to current user
        if (activity.user && 
            (activity.user.id === currentUser.value?.id || 
             activity.user.id === 'mock-user-001' || 
             activity.user.id === 'current-user')) {
          return {
            ...activity,
            user: {
              ...activity.user,
              name: 'You'
            }
          };
        }
        // Keep original user info for activities from other users
        return activity;
      });
      
      // Filter to show only current user's activities if we're on My Activities page
      sampleActivities = sampleActivities.filter(
        a => a.user && (a.user.id === currentUser.value?.id || 
                        a.user.id === 'mock-user-001' || 
                        a.user.id === 'current-user')
      );
    }
    
    activities.value = sampleActivities;
    error.value = '';
  } catch (err) {
    console.error('Error loading sample activities:', err);
    activities.value = [];
    error.value = 'Could not load any activities. Please try again later.';
  } finally {
    loading.value = false;
  }
};

// Try loading data again
const retryLoading = async () => {
  loading.value = true;
  error.value = '';
  retryCount.value++;
  
  // First check if the server is online
  try {
    const health = await checkServerHealth();
    if (!health.online) {
      error.value = `Server is still offline. ${health.error || ''}`;
      loading.value = false;
      return;
    }
    // If server is online, proceed with regular loading
    await getCurrentUser();
  } catch (err) {
    console.error('Error checking server health during retry:', err);
    error.value = 'Unable to check server status. Using sample data.';
    await fetchSampleActivities();
    loading.value = false;
  }
};

// Like Activity
const likeActivity = async (activityId: string) => {
  if (!currentUser.value?.id) return;
  
  try {
    await supabaseActivities.likeActivity(activityId, currentUser.value.id);
    
    // Update the activity in the list
    const activity = activities.value.find(a => a.id === activityId);
    if (activity) {
      activity.likes = (activity.likes || 0) + 1;
    }
  } catch (err) {
    console.error('Failed to like activity:', err);
  }
};

// Add comment
const addComment = async (activityId: string, comment: string) => {
  if (!currentUser.value?.id || !comment.trim()) return;
  
  try {
    await supabaseActivities.addComment(activityId, currentUser.value.id, comment);
    
    // Update the activity in the list
    const activity = activities.value.find(a => a.id === activityId);
    if (activity) {
      activity.comments = (activity.comments || 0) + 1;
    }
    
    // Refresh activities to show the new comment
    fetchUserActivities();
  } catch (err) {
    console.error('Failed to add comment:', err);
  }
};

// Delete activity
const deleteActivity = async (id: string) => {
  try {
    const { data, error: deleteError } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)
      .eq('user_id', currentUser.value?.id); // Ensure user can only delete their own activities
    
    if (!deleteError) {
      activities.value = activities.value.filter(a => a.id !== id);
    } else {
      console.error('Failed to delete activity:', deleteError);
    }
  } catch (err) {
    console.error('Failed to delete activity:', err);
  }
};

// Extract metrics from activity for display
const getActivityMetrics = (activity: Activity) => {
  let metrics: Record<string, string> = {};
  
  // Add type-specific metrics depending on the activity type
  switch (activity.type?.toLowerCase()) {
    case 'running':
      metrics = { distance: '5 km', pace: '5:30 min/km', duration: '27:30' };
      break;
    case 'cycling':
      metrics = { distance: '25 km', speed: '20 km/h', duration: '1:15:00' };
      break;
    case 'swimming':
      metrics = { distance: '1000 m', laps: '20', duration: '25:00' };
      break;
    case 'strength':
      metrics = { sets: '4', reps: '12', weight: 'varied' };
      break;
    case 'yoga':
    case 'pilates':
    case 'dance':
      metrics = { duration: '45:00', intensity: 'moderate', focus: 'full body' };
      break;
    default:
      metrics = { duration: '45:00' };
  }
  
  return metrics;
};

onMounted(() => {
  getCurrentUser();
});
</script>

<template>
  <main>
    <h1 class="title">{{ page }}</h1>
    

    
    <div class="activities-container">
      <div v-if="loading" class="loading">
        <p>Loading activities...</p>
        <progress class="progress is-primary" max="100"></progress>
      </div>
      
      <div v-else-if="error" class="error">
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ error }}</p>
          <div v-if="error.includes('Server is offline') || error.includes('Proxy error')" class="connection-details">
            <p class="connection-tip">The server might be temporarily down or your internet connection is unstable.</p>
          </div>
        </div>
        <button @click="retryLoading" class="btn retry-btn">
          <i class="fas fa-sync"></i> Try Again
        </button>
      </div>
      
      <div v-else-if="activities.length === 0" class="empty-state">
        <p>You haven't recorded any activities yet.</p>
        <button class="btn">Record New Activity</button>
      </div>
      
      <div v-else class="activities-list">
        <div v-for="activity in activities" :key="activity.id" class="activity-card card">
          <div class="delete-button" @click="deleteActivity(activity.id)">✕</div>
          
          <div class="user-info">
            <img 
              v-if="activity.user?.profilePicture" 
              :src="activity.user.profilePicture" 
              :alt="activity.user?.name || 'User'" 
              class="user-avatar"
            >
            <div v-else class="user-avatar-placeholder">
              <i class="fas fa-user"></i>
            </div>
            
            <div>
              <h4 class="user-name">{{ activity.user?.name || 'You' }}</h4>
              <p class="activity-date">{{ formatDate(activity.created_at) }}</p>
            </div>
          </div>
          
          <div class="activity-content">
            <h3 class="activity-title">{{ activity.title }}</h3>
            <p class="activity-description">{{ activity.description }}</p>
            
            <div v-if="activity.image_url" class="activity-image-container">
              <img :src="activity.image_url" :alt="activity.title" class="activity-image">
            </div>
            
            <div class="activity-metrics">
              <div v-for="(value, key) in getActivityMetrics(activity)" :key="key" class="metric">
                <span class="metric-value">{{ value }}</span>
                <span class="metric-label">{{ key }}</span>
              </div>
            </div>
          </div>
          
          <div class="activity-engagement">
            <div class="engagement-stats">
              <span>{{ activity.likes || 0 }} likes</span>
              <span>{{ activity.comments || 0 }} comments</span>
            </div>
            
            <div class="engagement-actions">
              <button class="engagement-btn" @click="likeActivity(activity.id)">
                👍 Like
              </button>
              <button class="engagement-btn">
                💬 Comment
              </button>
              <button class="btn-small">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.title {
  margin-bottom: 2rem;
}

.activities-container {
  max-width: 800px;
  margin: 0 auto;
}

.loading, .error, .empty-state {
  text-align: center;
  padding: 2rem;
}

.empty-state {
  background-color: var(--dark-bg);
  border-radius: 8px;
  padding: 3rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
}

.activity-card {
  margin-bottom: 1.5rem;
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 1rem;
  object-fit: cover;
}

.user-avatar-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 1rem;
  background-color: #4a4a4a;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 1.5rem;
}

.user-name {
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
}

.activity-date {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.activity-content {
  margin-bottom: 1.5rem;
}

.activity-title {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-size: 1.4rem;
  font-weight: 600; 
}

.activity-description {
  margin-bottom: 1rem;
}

.activity-metrics {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0.5rem;
}

.metric-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--highlight);
}

.metric-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-transform: capitalize;
}

.activity-image-container {
  margin: 1rem 0;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.activity-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.activity-image:hover {
  transform: scale(1.02);
}

.activity-engagement {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
}

.engagement-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.engagement-actions {
  display: flex;
  gap: 1rem;
}

.engagement-btn {
  background-color: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.engagement-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  background-color: var(--accent-color);
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.btn-small:hover {
  background-color: var(--highlight);
}

.delete-button {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.delete-button:hover {
  background: rgba(255, 0, 0, 0.6);
  opacity: 1;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.btn-primary {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.notification {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 4px;
  background-color: #856404;
  color: #fff3cd;
}

.progress {
  display: block;
  margin: 1rem auto;
  height: 8px;
}

.retry-btn {
  margin-top: 1rem;
  background-color: var(--accent-color);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.retry-btn:hover {
  background-color: var(--highlight);
}

.error-message {
  background-color: rgba(255, 59, 48, 0.1);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.error-message i {
  color: #ff3b30;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.connection-details {
  margin-top: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.connection-tip {
  margin-top: 0.5rem;
  font-style: italic;
}
</style>