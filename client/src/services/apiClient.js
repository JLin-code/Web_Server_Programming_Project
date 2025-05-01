import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add data service methods
export const dataService = {
  // Activities
  async getAllActivities(limit = 20, page = 0) {
    const response = await apiClient.get('/data/activities', {
      params: { limit, page }
    });
    return response.data;
  },
  
  async getUserActivities(userId) {
    const response = await apiClient.get(`/data/users/${userId}/activities`);
    return response.data;
  },
  
  async createActivity(activityData) {
    const response = await apiClient.post('/data/activities', activityData);
    return response.data;
  },
  
  async addComment(activityId, userId, comment) {
    const response = await apiClient.post(`/data/activities/${activityId}/comments`, {
      userId,
      comment
    });
    return response.data;
  },
  
  async likeActivity(activityId, userId) {
    const response = await apiClient.post(`/data/activities/${activityId}/likes`, {
      userId
    });
    return response.data;
  },
  
  // Friends
  async getUserFriends(userId) {
    const response = await apiClient.get(`/data/users/${userId}/friends`);
    return response.data;
  },
  
  async getFriendActivities(userId, limit = 20) {
    const response = await apiClient.get(`/data/users/${userId}/friends/activities`, {
      params: { limit }
    });
    return response.data;
  }
};

export default apiClient;