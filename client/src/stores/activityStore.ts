import { ref, computed } from 'vue';
import { userStore } from './userStore';
import { activitiesService } from '../services/api';
import type { Activity } from '../types';

// Create a reactive array to store activities
const activities = ref<Activity[]>([]);
const loading = ref(true);
const error = ref('');

// Initialize activities from the API
const initializeActivities = async () => {
  loading.value = true;
  try {
    const response = await activitiesService.getAll();
    activities.value = response.items || [];
  } catch (err) {
    console.error('Failed to load activities:', err);
    error.value = 'Failed to load activities';
    activities.value = []; // Empty array instead of mock data
  } finally {
    loading.value = false;
  }
};

// Get activities for current user
const getMyActivities = async () => {
  loading.value = true;
  try {
    const response = await activitiesService.getMyActivities();
    activities.value = response.items || [];
  } catch (err) {
    console.error('Failed to load my activities:', err);
    error.value = 'Failed to load my activities';
    activities.value = [];
  } finally {
    loading.value = false;
  }
};

// Get activities from friends
const getFriendActivities = async () => {
  loading.value = true;
  try {
    const response = await activitiesService.getFriendActivities();
    activities.value = response.items || [];
  } catch (err) {
    console.error('Failed to load friend activities:', err);
    error.value = 'Failed to load friend activities';
    activities.value = [];
  } finally {
    loading.value = false;
  }
};

// Get activity statistics
const getActivityStats = async (period = 'week') => {
  try {
    const response = await activitiesService.getActivityStats(period);
    return response.item;
  } catch (err) {
    console.error(`Failed to load activity stats for ${period}:`, err);
    throw err;
  }
};

// Delete an activity
const deleteActivity = async (id: string | number) => {
  try {
    await activitiesService.delete(id);
    activities.value = activities.value.filter(a => a.id !== id);
  } catch (err) {
    console.error('Failed to delete activity:', err);
    error.value = 'Failed to delete activity';
  }
};

// Like an activity
const likeActivity = async (id: string | number) => {
  const activity = activities.value.find(a => a.id === id);
  if (!activity) return;
  
  try {
    await activitiesService.update(id, { likes: activity.likes + 1 });
    activity.likes++;
  } catch (err) {
    console.error('Failed to like activity:', err);
    error.value = 'Failed to like activity';
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

// Add a new activity
const addActivity = async (
  title: string,
  description: string,
  type: string,
  metrics: Record<string, string | number>,
  image?: string
): Promise<Activity | null> => {
  try {
    const currentUser = userStore.currentUser.value;
    if (!currentUser) {
      error.value = 'User not logged in';
      return null;
    }
    
    const newActivity = {
      title,
      description,
      type,
      metrics,
      image
    };
    
    const response = await activitiesService.create(newActivity);
    if (response.item) {
      activities.value.unshift(response.item);
      return response.item;
    }
    return null;
  } catch (err) {
    console.error('Failed to add activity:', err);
    error.value = 'Failed to add activity';
    return null;
  }
};

// Export the store
export const activityStore = {
  activities,
  loading,
  error,
  initializeActivities,
  getMyActivities,
  getFriendActivities,
  getActivityStats,
  deleteActivity,
  likeActivity,
  formatDate,
  addActivity
};
