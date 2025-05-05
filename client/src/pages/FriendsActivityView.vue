<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase, supabaseFriends, supabaseActivities } from '../services/supabase';
import { authService } from '../services/api';
import mockDataService from '../services/mockDataService'; // Fix import to match MyActivityView
import ConnectionErrorMessage from '../components/ConnectionErrorMessage.vue';
import type { Activity, User } from '../types';

const page = 'Friends Activity';
const currentUser = ref<User | null>(null);
const activities = ref<Activity[]>([]);
const loading = ref(true);
const error = ref('');
const authRetries = ref(0);
const MAX_AUTH_RETRIES = 2;
const showingSampleData = ref(false);

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

// Get current user with retry logic
const getCurrentUser = async () => {
  try {
    console.log('Attempting to get current user in FriendsActivityView');
    const response = await authService.getCurrentUser().catch(err => {
      console.error('Error in getCurrentUser call:', err);
      return null;
    });
    
    if (response && response.user) {
      console.log('User found:', response.user.id);
      currentUser.value = response.user;
      // Once we have the user, get friends' activities
      await fetchFriendsActivities();
    } else {
      console.warn('No user returned from getCurrentUser');
      
      // Try fallback approach - check if user exists in localStorage
      const localUser = localStorage.getItem('currentUser');
      if (localUser) {
        try {
          const parsedUser = JSON.parse(localUser);
          if (parsedUser && parsedUser.id) {
            console.log('Using localStorage user:', parsedUser.id);
            currentUser.value = parsedUser;
            await fetchFriendsActivities();
            return;
          }
        } catch (parseErr) {
          console.error('Error parsing localStorage user:', parseErr);
        }
      }
      
      if (authRetries.value < MAX_AUTH_RETRIES) {
        authRetries.value++;
        console.log(`Retrying getCurrentUser (${authRetries.value}/${MAX_AUTH_RETRIES})`);
        setTimeout(getCurrentUser, 1000); // Retry after 1 second
      } else {
        // After max retries, use sample activities
        console.log('Max retries reached, using sample activities');
        await fetchSampleActivities();
      }
    }
  } catch (err) {
    console.error('Failed to get current user:', err);
    error.value = 'Unable to authenticate user. Showing sample activities instead.';
    await fetchSampleActivities();
  } finally {
    loading.value = false;
  }
};

// Fallback: Use sample mock activities when all else fails
const fetchSampleActivities = async () => {
  showingSampleData.value = true;
  console.log("Loading sample activities (API is unavailable)");
  
  try {
    const allMockActivities = mockDataService.getDefaultActivities();
    
    if (!allMockActivities || allMockActivities.length === 0) {
      // Handle empty mock data
      error.value = 'No sample activities available.';
      activities.value = [];
      return;
    }
    
    activities.value = allMockActivities;
    console.log(`Loaded ${activities.value.length} sample activities`);
  } catch (err) {
    console.error('Error loading sample activities:', err);
    activities.value = [];
    error.value = 'Unable to load any activities.';
  } finally {
    loading.value = false;
  }
};

// Fetch friends' activities
const fetchFriendsActivities = async () => {
  if (!currentUser.value?.id) {
    console.warn('No user ID available for fetchFriendsActivities');
    await fetchAllActivities();
    return;
  }

  try {
    console.log(`Fetching activities for friends of user ${currentUser.value.id}`);
    
    // Get friend IDs first
    const { data: friendsData, error: friendsError } = await supabase
      .from('friends')
      .select('friend_id')
      .eq('user_id', currentUser.value.id);
      
    if (friendsError || !friendsData || friendsData.length === 0) {
      console.warn("No friends found or error fetching friends:", friendsError);
      await fetchAllActivities();
      return;
    }
    
    const friendIds = friendsData.map(f => f.friend_id);
    console.log(`Found ${friendIds.length} friends`);
    
    // Get activities from those friends
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select(`
        *,
        user:user_id (
          id, first_name, last_name, email, role, profile_picture_url
        ),
        comments:activity_comments (
          id, user_id, comment, created_at,
          user:user_id (
            id, first_name, last_name, profile_picture_url
          )
        )
      `)
      .in('user_id', friendIds)
      .order('created_at', { ascending: false });
      
    if (activitiesError || !activitiesData || activitiesData.length === 0) {
      console.warn("No activities found or error fetching activities:", activitiesError);
      await fetchAllActivities();
      return;
    }
    console.log(`Found ${activitiesData.length} friend activities`);
    processActivities(activitiesData);
    
  } catch (err) {
    console.error('Failed to load friend activities:', err);
    error.value = 'Failed to load friend activities. Showing all activities instead.';
    await fetchAllActivities();
  }
};

// Fetch all recent activities
const fetchAllActivities = async () => {
  try {
    console.log("Fetching recent activities from all users as fallback");
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select(`
        *,
        user:user_id (
          id, first_name, last_name, email, role, profile_picture_url
        ),
        comments:activity_comments (
          id, user_id, comment, created_at,
          user:user_id (
            id, first_name, last_name, profile_picture_url
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (activitiesError) {
      console.error("Error fetching all activities:", activitiesError);
      await fetchSampleActivities();
      return;
    }
    
    if (!activitiesData || activitiesData.length === 0) {
      console.warn("No activities found in database");
      await fetchSampleActivities();
      return;
    }
    console.log(`Found ${activitiesData.length} activities from all users`);
    processActivities(activitiesData);
  } catch (err) {
    console.error('Failed to load any activities:', err);
    await fetchSampleActivities();
  }
};

// Process activities data into the correct format
const processActivities = (activitiesData: any[]) => {
  activities.value = activitiesData.map(activity => ({
    ...activity,
    user: activity.user ? {
      id: activity.user.id,
      name: `${activity.user.first_name} ${activity.user.last_name}`,
      email: activity.user.email,
      role: activity.user.role,
      profilePicture: activity.user.profile_picture_url
    } : {
      id: 'unknown',
      name: 'Unknown User',
      email: '',
      role: 'user',
      profilePicture: null
    }
  }));
  console.log(`Processed ${activities.value.length} activities`);
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
  console.log("FriendsActivityView mounted");
  getCurrentUser();
});
</script>

<template>
  <main>
    <h1 class="title">{{ page }}</h1>
    
    <ConnectionErrorMessage 
      v-if="showingSampleData" 
      :onRetry="getCurrentUser"
    />
    
    <div class="activities-container">
      <div v-if="loading" class="loading">
        <p>Loading activities...</p>
        <progress class="progress is-primary" max="100"></progress>
      </div>
      
      <div v-else-if="error && activities.length === 0" class="error">
        <p>{{ error }}</p>
      </div>
      
      <div v-else-if="activities.length === 0" class="empty-state">
        <p>No friend activities have been recorded yet.</p>
        <p>Add friends to see their activities here!</p>
      </div>
      
      <div v-else>
        <div v-if="error" class="notification is-info">
          <p>{{ error }}</p>
        </div>
        
        <div class="activities-list">
          <div v-for="activity in activities" :key="activity.id" class="activity-card card">
            <div class="user-info">
              <img 
                v-if="activity.user?.profilePicture" 
                :src="activity.user.profilePicture" 
                :alt="activity.user?.name" 
                class="user-avatar"
              >
              <div v-else class="user-avatar-placeholder">
                <i class="fas fa-user"></i>
              </div>
              <div>
                <h4 class="user-name">{{ activity.user?.name || 'Unknown User' }}</h4>
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
                <span>{{ activity.comments?.length || 0 }} comments</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <pre v-if="showingSampleData && !loading && activities.length > 0" style="background: #333; color: white; padding: 10px; margin-top: 20px; overflow: auto;">
      Sample data loaded: {{ activities.length }} activities
      First activity: {{ JSON.stringify(activities[0], null, 2) }}
    </pre>
  </main>
</template>

<style scoped>
.title {
  margin-bottom: 2rem;
}

.notification {
  margin-bottom: 1.5rem;
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
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 3rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
  color: #a0a0a0;
}

.activity-card {
  margin-bottom: 1.5rem;
  position: relative;
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 1.5rem;
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
  color: #ffffff;
}

.activity-date {
  font-size: 0.85rem;
  color: #a0a0a0;
}

.activity-content {
  margin-bottom: 1.5rem;
}

.activity-title {
  margin-bottom: 0.5rem;
  color: #ffffff;
  font-size: 1.4rem;
  font-weight: 600; 
}

.activity-description {
  margin-bottom: 1rem;
  color: #e0e0e0;
}

.activity-metrics {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  background-color: #3a3a3a;
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
  color: #4caf50;
}

.metric-label {
  font-size: 0.85rem;
  color: #a0a0a0;
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
  color: #a0a0a0;
}

.notification.is-warning {
  background-color: #ffd14a;
  color: #3e2800;
}

.notification.is-info {
  background-color: #3298dc;
  color: #fff;
}
</style>