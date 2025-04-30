import { ref } from 'vue';
import { userStore } from './userStore';
import { activitiesService } from '../services/activitiesApi';

// Keep the interfaces - they're just type definitions
interface User {
  id: number;
  name: string;
  avatar: string;
}

interface Metrics {
  [key: string]: string | number;
}

interface Activity {
  id: number;
  user: User;
  type: string;
  title: string;
  description: string;
  date: string;
  metrics: Metrics;
  likes: number;
  comments: number;
  image: string | null;
}

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
const deleteActivity = async (id: number) => {
  try {
    await activitiesService.delete(id);
    activities.value = activities.value.filter(a => a.id !== id);
  } catch (err) {
    console.error('Failed to delete activity:', err);
    error.value = 'Failed to delete activity';
  }
};

const likeActivity = async (id: number) => {
  const activity = activities.value.find(a => a.id === id);
  if (activity) {
    try {
      await activitiesService.update(id, { likes: activity.likes + 1 });
      activity.likes++;
    } catch (err) {
      console.error('Failed to like activity:', err);
      error.value = 'Failed to like activity';
    }
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
  metrics: Metrics,
  image: string | null = null
) => {
  try {
    const userId = userStore.userId;
    if (!userId) {
      error.value = 'User not logged in';
      return null;
    }
    
    const newActivity = {
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
