import api from './api';

export const activitiesService = {
  async getActivities(params: { page?: number; limit?: number } = {}) {
    try {
      const response = await api.get('/activities', { params });
      return response.data;
    } catch (error) {
      console.error('Get activities error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get activities',
        items: []
      };
    }
  },

  async getActivityById(id: string) {
    try {
      const response = await api.get(`/activities/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get activity ${id} error:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get activity'
      };
    }
  },

  async getUserActivities(userId: string) {
    try {
      const response = await api.get(`/activities/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Get user activities error:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get user activities',
        items: []
      };
    }
  },

  async createActivity(activityData: Record<string, any>) {
    try {
      const response = await api.post('/activities', activityData);
      return response.data;
    } catch (error) {
      console.error('Create activity error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create activity'
      };
    }
  },

  async updateActivity(id: string, updateData: Record<string, any>) {
    try {
      const response = await api.patch(`/activities/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Update activity ${id} error:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update activity'
      };
    }
  },

  async deleteActivity(id: string) {
    try {
      const response = await api.delete(`/activities/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete activity ${id} error:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete activity'
      };
    }
  },

  async likeActivity(activityId: string, userId: string) {
    try {
      const response = await api.post(`/activities/${activityId}/likes`, { userId });
      return response.data;
    } catch (error) {
      console.error(`Like activity error:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to like activity'
      };
    }
  },

  async addComment(activityId: string, userId: string, comment: string) {
    try {
      const response = await api.post(`/activities/${activityId}/comments`, { userId, comment });
      return response.data;
    } catch (error) {
      console.error(`Add comment error:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add comment'
      };
    }
  }
};
