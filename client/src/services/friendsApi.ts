import api from './api';

export const friendsService = {
  async getFriends(userId: string) {
    try {
      const response = await api.get(`/friends/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get friends error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get friends',
        items: []
      };
    }
  },

  async getFriendRequests(userId: string) {
    try {
      const response = await api.get(`/friends/requests/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get friend requests error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get friend requests',
        items: []
      };
    }
  },

  async sendFriendRequest(userId: string, friendId: string) {
    try {
      const response = await api.post('/friends/request', { userId, friendId });
      return response.data;
    } catch (error) {
      console.error('Send friend request error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send friend request'
      };
    }
  },

  async acceptFriendRequest(requestId: string) {
    try {
      const response = await api.post(`/friends/accept/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Accept friend request error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to accept friend request'
      };
    }
  },

  async rejectFriendRequest(requestId: string) {
    try {
      const response = await api.post(`/friends/reject/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Reject friend request error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reject friend request'
      };
    }
  },

  async removeFriend(userId: string, friendId: string) {
    try {
      const response = await api.delete(`/friends/${userId}/${friendId}`);
      return response.data;
    } catch (error) {
      console.error('Remove friend error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove friend'
      };
    }
  },

  async getFriendActivities(userId: string) {
    try {
      const response = await api.get(`/friends/${userId}/activities`);
      return response.data;
    } catch (error) {
      console.error('Get friend activities error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get friend activities',
        items: []
      };
    }
  }
};
