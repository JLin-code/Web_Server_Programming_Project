/**
 * This service provides fallback data when the API or Supabase is unavailable
 * It helps ensure that users can still see demo content even when backend services fail
 */
import type { Activity, User } from '../types/models';

// Sample activities for fallback usage
const fallbackActivities: Activity[] = [
  {
    id: 'fb-1',
    user_id: 'fallback-id-admin',
    title: 'Morning Run',
    description: 'Started the day with a refreshing 5k run through the park.',
    type: 'workout',
    metrics: { 
      distance: '5km', 
      duration: '28min', 
      pace: '5:36/km' 
    },
    likes: 12,
    comments: 3,
    image: 'https://images.unsplash.com/photo-1510672981848-a1c4f1cb5ccf?w=600&auto=format&fit=crop',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    user: {
      id: 'fallback-id-admin',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin'
    },
    comments_list: []
  },
  {
    id: 'fb-2',
    user_id: 'fallback-id-john',
    title: 'New Personal Best!',
    description: 'Just beat my deadlift record at the gym today! Feeling strong.',
    type: 'achievement',
    metrics: { 
      weight: '140kg', 
      reps: '3', 
      sets: '1' 
    },
    likes: 24,
    comments: 8,
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    user: {
      id: 'fallback-id-john',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'user'
    },
    comments_list: []
  },
  {
    id: 'fb-3',
    user_id: 'fallback-id-jane',
    title: 'Weekly Goal Set',
    description: 'Setting a goal to run 20km total this week. Who wants to join my challenge?',
    type: 'goal',
    metrics: { 
      target: '20km', 
      timeframe: '7 days' 
    },
    likes: 7,
    comments: 4,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    user: {
      id: 'fallback-id-jane',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'user'
    },
    comments_list: []
  }
];

// Sample users for fallback usage - minimal data, no hardcoded personal info
const fallbackUsers: User[] = [
  {
    id: 'fallback-id-admin',
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@example.com',
    role: 'admin',
    created_at: '2023-01-01T00:00:00Z'
  },
  {
    id: 'fallback-id-user',
    first_name: 'Regular',
    last_name: 'User',
    email: 'user@example.com',
    role: 'user',
    created_at: '2023-01-02T00:00:00Z'
  }
];

export const fallbackDataService = {
  // Get all activities with fallback support
  getActivities(userId?: string): Activity[] {
    if (userId) {
      return fallbackActivities.filter(activity => activity.user_id === userId);
    }
    return fallbackActivities;
  },
  
  // Get user by ID or email with fallback support
  getUser(idOrEmail: string): User | undefined {
    return fallbackUsers.find(user => 
      user.id === idOrEmail || 
      user.email.toLowerCase() === idOrEmail.toLowerCase()
    );
  },
  
  // Get all users with fallback support
  getUsers(): User[] {
    return fallbackUsers;
  },
  
  // Check if a string looks like it might be a fallback ID
  isFallbackId(id: string): boolean {
    return id?.startsWith('fallback-id');
  }
};
