import { authHeader } from './auth';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const activitiesService = {
  async getAll() {
    const response = await fetch(`${API_URL}/activities`, {
      headers: authHeader()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch activities');
    }
    
    return await response.json();
  },

  async getByUser(userId) {
    const response = await fetch(`${API_URL}/activities/user/${userId}`, {
      headers: authHeader()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to fetch activities for user ${userId}`);
    }
    
    return await response.json();
  },

  async get(id) {
    const response = await fetch(`${API_URL}/activities/${id}`, {
      headers: authHeader()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to fetch activity with id ${id}`);
    }
    
    return await response.json();
  },

  async create(activity) {
    const response = await fetch(`${API_URL}/activities`, {
      method: 'POST',
      headers: {
        ...authHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(activity)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create activity');
    }
    
    return await response.json();
  },

  async update(id, updates) {
    const response = await fetch(`${API_URL}/activities/${id}`, {
      method: 'PATCH',
      headers: {
        ...authHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to update activity with id ${id}`);
    }
    
    return await response.json();
  },

  async delete(id) {
    const response = await fetch(`${API_URL}/activities/${id}`, {
      method: 'DELETE',
      headers: authHeader()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to delete activity with id ${id}`);
    }
    
    return await response.json();
  },
  
  // Add a convenience method for liking activities
  async like(id) {
    // Get the activity first to increment its current likes count
    const activity = await this.get(id);
    return this.update(id, { likes: activity.likes + 1 });
  }
};
