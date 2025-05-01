import axios from 'axios';
import { fallbackDataService } from './fallbackDataService';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Create axios instance with credentials support
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Log configuration for debugging
console.log('Activities service configured with API URL:', API_URL);

export const activitiesService = {
  // Get all activities
  async getAll() {
    try {
      const response = await apiClient.get('/activities');
      return response.data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      console.log('Falling back to demo activities data');
      
      // Return fallback data in the same structure as the API would
      return {
        success: true,
        items: fallbackDataService.getActivities(),
        count: fallbackDataService.getActivities().length,
        source: 'fallback'
      };
    }
  },
  
  // Get user activities
  async getUserActivities(userId) {
    try {
      // For fallback IDs, use our fallback data service
      if (fallbackDataService.isFallbackId(userId)) {
        console.log('Using fallback data for user activities:', userId);
        return {
          success: true,
          items: fallbackDataService.getActivities(userId),
          count: fallbackDataService.getActivities(userId).length,
          source: 'fallback'
        };
      }
      
      const response = await apiClient.get(`/activities/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user activities:', error);
      console.log('Falling back to demo activities data');
      
      // Return fallback data in the same structure as the API would
      return {
        success: true,
        items: fallbackDataService.getActivities(),
        count: fallbackDataService.getActivities().length,
        source: 'fallback'
      };
    }
  },
  
  // The rest of your methods stay the same
  async get(id) {
    const response = await apiClient.get(`/activities/${id}`);
    return response.data;
  },

  async create(activity) {
    const response = await apiClient.post('/activities', activity);
    return response.data;
  },

  async update(id, updates) {
    const response = await apiClient.patch(`/activities/${id}`, updates);
    return response.data;
  },

  async delete(id) {
    const response = await apiClient.delete(`/activities/${id}`);
    return response.data;
  },
  
  // Add a convenience method for liking activities
  async like(id) {
    // Get the activity first to increment its current likes count
    const activity = await this.get(id);
    return this.update(id, { likes: activity.likes + 1 });
  }
};
