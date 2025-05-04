import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/mock`,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const userService = {
  async getAll() {
    const { data } = await api.get('/users');
    return data;
  },
  
  async getById(id) {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },
  
  async getUserProfile(userId) {
    const { data } = await api.get(`/users/${userId}`);
    return data;
  }
};

export const activitiesService = {
  async getAll(limit = 20) {
    const { data } = await api.get('/activities');
    return data;
  },
  
  async getUserActivities(userId) {
    const { data } = await api.get(`/users/${userId}/activities`);
    return data;
  },
  
  async createActivity(activityData) {
    // Just return the data as if it was created successfully
    return {
      id: `new-${Date.now()}`,
      ...activityData,
      created_at: new Date().toISOString(),
      comment_count: 0,
      like_count: 0
    };
  },
  
  async addComment(activityId, userId, comment) {
    // Return a mock comment
    return {
      id: `comment-${Date.now()}`,
      activity_id: activityId,
      user_id: userId,
      comment: comment,
      created_at: new Date().toISOString()
    };
  }
};

export const friendsService = {
  async getFriends(userId) {
    const { data } = await api.get(`/users/${userId}/friends`);
    return data;
  },
  
  async addFriend(userId, friendId) {
    // Just return success
    return { success: true };
  },
  
  async removeFriend(userId, friendId) {
    // Just return success
    return { success: true };
  },
  
  async getFriendActivities(userId) {
    const { data } = await api.get(`/users/${userId}/friend-activities`);
    return data;
  }
};

export const statsService = {
  async getUserStatistics(userId) {
    const { data } = await api.get(`/statistics/user/${userId}`);
    return data;
  },
  
  async getGlobalStatistics() {
    const { data } = await api.get('/statistics/global');
    return data;
  }
};

// Bundle all services
const mockApi = {
  users: userService,
  activities: activitiesService,
  friends: friendsService,
  stats: statsService
};

export default mockApi;
