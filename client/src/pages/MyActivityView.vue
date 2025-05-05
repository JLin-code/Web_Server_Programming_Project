<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase } from '../utils/supabaseClient';
import { supabaseActivities } from '../services/supabase';
import { authService } from '../services/api';
import { mockDataService } from '../services/mockDataService';
import { checkServerHealth } from '../utils/serverHealth';
import type { Activity, User } from '../types';

const page = 'My Activity';
const currentUser = ref<User | null>(null);
const activities = ref<Activity[]>([]);
const loading = ref(true);
const error = ref('');
const authRetries = ref(0);
const MAX_AUTH_RETRIES = 2;
const showingSampleData = ref(false);

// Add debug mode to help troubleshoot
const isDebugMode = ref(false);
const debugInfo = ref({
  connectionStatus: 'Unknown',
  databaseAccessible: false,
  lastError: '',
  activities: [],
  userIds: []
});

const toggleDebug = () => {
  isDebugMode.value = !isDebugMode.value;
  console.log('Debug mode:', isDebugMode.value);
  if (isDebugMode.value) {
    checkDatabaseConnection();
  }
};

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

// Check if we can connect to the database at all
const checkDatabaseConnection = async () => {
  try {
    debugInfo.value.connectionStatus = 'Checking...';
    
    // First check if we can access the database
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('activities')
      .select('count()', { count: 'exact', head: true });
      
    if (error) {
      debugInfo.value.connectionStatus = 'Error';
      debugInfo.value.lastError = error.message;
      debugInfo.value.databaseAccessible = false;
      return;
    }
    
    const duration = Date.now() - startTime;
    debugInfo.value.connectionStatus = `Connected (${duration}ms)`;
    debugInfo.value.databaseAccessible = true;
    
    // Get sample of activities in database
    const { data: sampleActivities, error: sampleError } = await supabase
      .from('activities')
      .select('id, user_id, title')
      .limit(5);
      
    if (!sampleError && sampleActivities) {
      debugInfo.value.activities = sampleActivities;
      
      // Get unique user IDs from activities
      const userIds = [...new Set(sampleActivities.map(a => a.user_id))];
      debugInfo.value.userIds = userIds;
    }
  } catch (err) {
    debugInfo.value.connectionStatus = 'Error';
    debugInfo.value.lastError = err.message || 'Unknown error';
    debugInfo.value.databaseAccessible = false;
  }
};

// Test using another user ID from the database
const testWithUserId = async (userId: string) => {
  try {
    const { data: testActivities, error: testError } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .limit(3);
      
    if (testError) {
      alert(`Error testing with user ID ${userId}: ${testError.message}`);
      return;
    }
    
    if (testActivities && testActivities.length > 0) {
      alert(`Success! Found ${testActivities.length} activities for user ${userId}`);
    } else {
      alert(`No activities found for user ${userId}`);
    }
  } catch (err) {
    alert(`Error: ${err.message || 'Unknown error'}`);
  }
};

// Create a test activity for the current user
const createTestActivity = async () => {
  if (!currentUser.value?.id) {
    alert('No current user to create activity for');
    return;
  }
  
  try {
    const newActivity = {
      user_id: currentUser.value.id,
      title: 'Test Activity',
      description: 'Created from debug panel',
      type: 'test',
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('activities')
      .insert([newActivity])
      .select();
      
    if (error) {
      alert(`Error creating test activity: ${error.message}`);
      return;
    }
    
    alert('Test activity created successfully!');
    fetchUserActivities(); // Refresh activities
  } catch (err) {
    alert(`Error: ${err.message || 'Unknown error'}`);
  }
};

// Get current user with retry logic - similar to FriendsActivityView approach
const getCurrentUser = async () => {
  try {
    console.log('Attempting to get current user in MyActivityView');
    const response = await authService.getCurrentUser().catch(err => {
      console.error('Error in getCurrentUser call:', err);
      return null;
    });
    
    if (response && response.user) {
      console.log('User found:', response.user.id);
      currentUser.value = response.user;
      // Once we have the user, get their activities
      await fetchUserActivities();
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
            await fetchUserActivities();
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

// Fetch user activities - primary function
const fetchUserActivities = async () => {
  if (!currentUser.value?.id) {
    console.warn('No user ID available for fetchUserActivities');
    await fetchSampleActivities();
    return;
  }

  try {
    console.log(`Fetching activities for user ${currentUser.value.id}`);
    
    // Debug user info to make sure it matches what's in the database
    if (isDebugMode.value) {
      console.log('Current user object:', JSON.stringify(currentUser.value));
    }
    
    // Get activities for the current user
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
      .eq('user_id', currentUser.value.id)
      .order('created_at', { ascending: false });
      
    if (activitiesError) {
      // Improve error logging to show detailed error information
      console.error("Error fetching user activities:", {
        message: activitiesError.message,
        details: activitiesError.details,
        hint: activitiesError.hint,
        code: activitiesError.code
      });
      
      // Try a simpler query to see if it's a query structure issue
      console.log("Trying simpler query to debug...");
      const { data: simpleCheck, error: simpleError } = await supabase
        .from('activities')
        .select('id, user_id')
        .limit(5);
        
      if (simpleError) {
        console.error("Simple query also failed:", simpleError);
      } else {
        console.log("Simple query succeeded, found activities:", simpleCheck);
        if (simpleCheck && simpleCheck.length > 0) {
          console.log("Sample user_ids in database:", simpleCheck.map(a => a.user_id));
        }
      }
      
      await fetchSampleActivities();
      return;
    }
    
    if (!activitiesData || activitiesData.length === 0) {
      console.warn(`No activities found for user ID: ${currentUser.value.id}`);
      
      // Check if there are any activities in the database at all
      const { data: anyActivities } = await supabase
        .from('activities')
        .select('id, user_id')
        .limit(5);
        
      if (anyActivities && anyActivities.length > 0) {
        console.log("Activities exist but none for this user. Sample user_ids:", 
          anyActivities.map(a => a.user_id));
      } else {
        console.log("No activities found in the database at all");
      }
      
      await fetchSampleActivities();
      return;
    }
    
    console.log(`Found ${activitiesData.length} user activities`);
    processActivities(activitiesData);
    showingSampleData.value = false;
    
  } catch (err) {
    console.error('Failed to load user activities:', err);
    error.value = 'Failed to load your activities. Showing sample data instead.';
    await fetchSampleActivities();
  }
};

// Fetch sample activities when API is unavailable
const fetchSampleActivities = async () => {
  showingSampleData.value = true;
  console.log("Loading sample activities (API is unavailable)");
  
  try {
    // Get default activities
    const allMockActivities = mockDataService.getDefaultActivities();
    
    if (!allMockActivities || allMockActivities.length === 0) {
      // Handle empty mock data
      error.value = 'No sample activities available.';
      activities.value = [];
      return;
    }
    
    // Create a consistent user profile
    const user = currentUser.value || {
      id: 'sample-user',
      first_name: 'Demo',
      last_name: 'User',
      email: 'demo@example.com'
    };
    
    const userProfilePicture = currentUser.value?.profilePicture || 
                              currentUser.value?.profile_picture_url || 
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name || '')}&background=random`;
    
    // Filter and modify activities to be from the current user
    const filteredActivities = allMockActivities.map((activity, index) => ({
      ...activity,
      id: activity.id || `sample-${Date.now()}-${index}`,
      user_id: user.id,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        profilePicture: userProfilePicture
      }
    }));
    
    activities.value = filteredActivities;
    console.log(`Loaded ${activities.value.length} sample activities for current user`);
  } catch (err) {
    console.error('Error loading sample activities:', err);
    activities.value = [];
    error.value = 'Unable to load any activities.';
  } finally {
    loading.value = false;
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
      id: currentUser.value?.id || 'unknown',
      name: currentUser.value ? `${currentUser.value.first_name} ${currentUser.value.last_name}` : 'You',
      email: currentUser.value?.email || '',
      role: currentUser.value?.role || 'user',
      profilePicture: currentUser.value?.profilePicture || null
    },
    // Convert comments from array to count if needed
    comments: Array.isArray(activity.comments) ? activity.comments.length : (activity.comments || 0)
  }));
  console.log(`Processed ${activities.value.length} activities`);
};

// Try loading data again
const retryLoading = async () => {
  loading.value = true;
  error.value = '';
  authRetries.value = 0;
  await getCurrentUser();
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

// Delete activity with better error handling
const deleteActivity = async (id: string) => {
  try {
    if (!currentUser.value?.id) {
      console.error('Cannot delete activity: User not authenticated');
      return;
    }
    
    if (id.startsWith('sample-')) {
      // For sample activities, just remove from the local array
      activities.value = activities.value.filter(a => a.id !== id);
      return;
    }
    
    console.log(`Attempting to delete activity ${id} for user ${currentUser.value.id}`);
    
    // Try using the service function first
    try {
      await supabaseActivities.deleteActivity(id);
      console.log(`Successfully deleted activity ${id}`);
      activities.value = activities.value.filter(a => a.id !== id);
      return;
    } catch (serviceErr) {
      console.warn('Service delete failed, falling back to direct query:', serviceErr);
    }
    
    // Fall back to direct query
    const { error: deleteError } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)
      .eq('user_id', currentUser.value.id); // Ensure user can only delete their own activities
    
    if (deleteError) {
      console.error('Failed to delete activity:', deleteError);
      return;
    }
    
    console.log(`Successfully deleted activity ${id}`);
    activities.value = activities.value.filter(a => a.id !== id);
  } catch (err) {
    console.error('Exception when deleting activity:', err);
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
  console.log('MyActivityView mounted, initializing...');
  getCurrentUser();
});
</script>

<template>
  <main>
    <h1 class="title">{{ page }}</h1>
    
    <!-- Add debug button -->
    <button @click="toggleDebug" class="debug-button" title="Toggle Debug Mode">
      🐞
    </button>
    
    <div v-if="showingSampleData" class="notification is-warning">
      <p><strong>Note:</strong> Showing sample data because we couldn't connect to the server.</p>
    </div>
    
    <!-- Add current user debug info -->
    <div v-if="isDebugMode" class="debug-info">
      <h3>Debug Info</h3>
      <div class="debug-section">
        <h4>Current User</h4>
        <p><strong>ID:</strong> {{ currentUser?.id || 'None' }}</p>
        <p><strong>Name:</strong> {{ currentUser?.first_name }} {{ currentUser?.last_name }}</p>
        <p><strong>Email:</strong> {{ currentUser?.email }}</p>
        <p><strong>Role:</strong> {{ currentUser?.role }}</p>
        <p><strong>Is Sample Data:</strong> {{ showingSampleData ? 'Yes' : 'No' }}</p>
        <div class="debug-actions">
          <button @click="fetchUserActivities" class="button is-small is-info">
            Retry Fetch
          </button>
          <button @click="createTestActivity" class="button is-small is-success">
            Create Test Activity
          </button>
        </div>
      </div>
      
      <div class="debug-section">
        <h4>Database Connection</h4>
        <p><strong>Status:</strong> {{ debugInfo.connectionStatus }}</p>
        <p><strong>Database Accessible:</strong> {{ debugInfo.databaseAccessible ? 'Yes' : 'No' }}</p>
        <p v-if="debugInfo.lastError" class="error-text">{{ debugInfo.lastError }}</p>
        <button @click="checkDatabaseConnection" class="button is-small is-info">
          Check Connection
        </button>
      </div>
      
      <div v-if="debugInfo.activities.length > 0" class="debug-section">
        <h4>Sample Activities in Database</h4>
        <table class="debug-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>Title</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="activity in debugInfo.activities" :key="activity.id">
              <td>{{ activity.id }}</td>
              <td>{{ activity.user_id }}</td>
              <td>{{ activity.title }}</td>
              <td>
                <button 
                  @click="testWithUserId(activity.user_id)" 
                  class="button is-small is-link"
                  title="Test fetching activities with this user ID"
                >
                  Test
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="debugInfo.userIds.length > 0" class="debug-section">
        <h4>User IDs with Activities</h4>
        <div class="user-ids-list">
          <div v-for="userId in debugInfo.userIds" :key="userId" class="user-id-item">
            <code>{{ userId }}</code>
            <button @click="testWithUserId(userId)" class="button is-small is-link">
              Test User ID {{ userId }}
            </button>
          </div>
        </div>
      </div>
      
      <div class="debug-section">
        <h4>Actions</h4>
        <button @click="fetchSampleActivities" class="button is-small is-warning">
          Load Sample Data
        </button>
      </div>
    </div>
    
    <div class="activities-container">
      <div v-if="loading" class="loading">
        <p>Loading activities...</p>
        <progress class="progress is-primary" max="100"></progress>
      </div>
      
      <div v-else-if="error && activities.length === 0" class="error">
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
        <div v-if="error" class="notification is-info">
          <p>{{ error }}</p>
        </div>
        
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
            <h3 class="activity-title">{{ activity.title || 'Activity' }}</h3>
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

.notification.is-warning {
  background-color: #ffd14a;
  color: #3e2800;
  margin-bottom: 1.5rem;
}

.notification.is-info {
  background-color: #3298dc;
  color: #fff;
  margin-bottom: 1.5rem;
}

.debug-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #333;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  border: none;
  z-index: 100;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.debug-button:hover {
  opacity: 1;
  transform: scale(1.1);
}

.debug-info {
  margin: 1rem auto;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  max-width: 800px;
  margin-bottom: 2rem;
  border: 1px dashed #666;
}

.debug-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
}

.debug-section h4 {
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #7bb7e4;
}

.debug-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.debug-table {
  width: 100%;
  margin-top: 0.5rem;
  border-collapse: collapse;
}

.debug-table th, 
.debug-table td {
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid #444;
}

.user-ids-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.user-id-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.error-text {
  color: #ff6b6b;
}

code {
  font-family: monospace;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}
</style>