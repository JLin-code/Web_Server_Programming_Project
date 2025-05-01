import { ref } from 'vue';
import { userStore } from '../stores/userStore';
import { activitiesService } from '../services/activitiesApi';
import type { Activity } from '../types';

// Create a reactive array to store activities
const activities = ref<Activity[]>([]);
const loading = ref(true);
const error = ref('');

// Replace mock initialization with API calls
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

// Keep the actions but make them use the API
const deleteActivity = async (id: string | number) => {
  try {
    await activitiesService.delete(id);
    activities.value = activities.value.filter(a => a.id !== id);
  } catch (err) {
    console.error('Failed to delete activity:', err);
    error.value = 'Failed to delete activity';
  }
};

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

// Add activity function that calls the API
const addActivity = async (
  title: string,
  description: string,
  type: string,
  metrics: Record<string, string | number>,
  image?: string
) => {
  try {
    const userResponse = await userStore.currentUser;
    if (!userResponse) {
      error.value = 'User not logged in';
      return null;
    }
    
    const userId = userResponse.value?.id;
    
    const newActivity: Partial<Activity> = {
      user_id: userId,
      title,
      description,
      type,
      metrics,
      image
    };
    
    const response = await activitiesService.create(newActivity);
    activities.value.unshift(response);
    return response;
  } catch (err) {
    console.error('Failed to add activity:', err);
    error.value = 'Failed to add activity';
    return null;
  }
};

export const activityStore = {
  activities,
  loading,
  error,
  initializeActivities,
  deleteActivity,
  likeActivity,
  formatDate,
  addActivity
};
