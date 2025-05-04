<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase, supabaseFriends } from '../services/supabase';
import { authService } from '../services/api';
import type { Activity, User } from '../types';

const page = 'Friends Activity';
const currentUser = ref<User | null>(null);
const activities = ref<Activity[]>([]);
const loading = ref(true);
const error = ref('');

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
    const response = await authService.getCurrentUser();
    if (response && response.user) {
      currentUser.value = response.user;
      // Once we have the user, get friends' activities
      await fetchFriendsActivities();
    }
  } catch (err) {
    console.error('Failed to get current user:', err);
    error.value = 'Failed to authenticate user';
    loading.value = false;
  }
};

// Fetch friends' activities
const fetchFriendsActivities = async () => {
  if (!currentUser.value?.id) {
    error.value = 'User not authenticated';
    loading.value = false;
    return;
  }

  try {
    // Get activities from Supabase
    const result = await supabaseFriends.getFriendActivities(currentUser.value.id);
    
    if (result && result.success && result.items) {
      activities.value = result.items;
    } else {
      error.value = 'No friend activities found';
    }
  } catch (err) {
    console.error('Failed to load friend activities:', err);
    error.value = 'Failed to load friend activities';
  } finally {
    loading.value = false;
  }
};

// Like Activity
const likeActivity = async (activityId: string) => {
  if (!currentUser.value?.id) return;
  
  try {
    await supabase
      .from('activity_likes')
      .insert([
        { activity_id: activityId, user_id: currentUser.value.id }
      ]);
    
    await supabase.rpc('increment_like_count', { act_id: activityId });
    
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
    await supabase
      .from('activity_comments')
      .insert([
        { activity_id: activityId, user_id: currentUser.value.id, comment }
      ]);
    
    await supabase.rpc('increment_comment_count', { act_id: activityId });
    
    // Update the activity in the list
    const activity = activities.value.find(a => a.id === activityId);
    if (activity) {
      activity.comments = (activity.comments || 0) + 1;
    }
    
    // Refresh activities to show the new comment
    fetchFriendsActivities();
  } catch (err) {
    console.error('Failed to add comment:', err);
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
      </div>
      
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
      </div>
      
      <div v-else-if="activities.length === 0" class="empty-state">
        <p>No friend activities have been recorded yet.</p>
        <p>Add friends to see their activities here!</p>
      </div>
      
      <div v-else class="activities-list">
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
              <h4 class="user-name">{{ activity.user?.name }}</h4>
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
              <span>{{ activity.likes }} likes</span>
              <span>{{ activity.comments }} comments</span>
            </div>
            
            <div class="engagement-actions">
              <button class="engagement-btn" @click="likeActivity(activity.id)">
                👍 Like
              </button>
              <button class="engagement-btn">
                💬 Comment
              </button>
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
</style>