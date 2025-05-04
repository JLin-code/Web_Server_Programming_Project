/**
 * Mock Data Service
 * Provides fallback data when API calls fail
 */

// Default mock activities
const defaultActivities = [
  {
    id: 'mock-001',
    title: 'Morning Run',
    description: 'Quick 5K run around the park',
    type: 'running',
    duration: 30,
    distance: 5.2,
    calories: 320,
    created_at: new Date().toISOString(),
    image_url: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600',
    likes: 5,
    comments: 2,
    user: {
      id: 'mock-user-001',
      name: 'Demo User',
      profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg'
    }
  },
  {
    id: 'mock-002',
    title: 'Gym Workout',
    description: 'Leg day at the gym',
    type: 'strength',
    duration: 45,
    calories: 280,
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',
    likes: 3,
    comments: 1,
    user: {
      id: 'mock-user-001',
      name: 'Demo User',
      profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg'
    }
  },
  {
    id: 'mock-003',
    title: 'Yoga Class',
    description: 'Relaxing yoga session',
    type: 'yoga',
    duration: 60,
    calories: 150,
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    image_url: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600',
    likes: 7,
    comments: 3,
    user: {
      id: 'mock-user-001',
      name: 'Demo User',
      profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg'
    }
  },
  {
    id: 'mock-004',
    title: 'Evening Bike Ride',
    description: 'Scenic bike ride through the city',
    type: 'cycling',
    duration: 75,
    distance: 15.3,
    calories: 450,
    created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    likes: 12,
    comments: 4,
    user: {
      id: 'mock-user-001',
      name: 'Demo User',
      profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg'
    }
  }
];

// Default user profile data
const defaultUserProfile = {
  id: 'mock-user-001',
  first_name: 'Demo',
  last_name: 'User',
  email: 'demo@example.com',
  role: 'user',
  profile_picture_url: 'https://randomuser.me/api/portraits/men/3.jpg',
  created_at: new Date(Date.now() - 7776000000).toISOString() // 90 days ago
};

// Default user statistics
const defaultUserStats = {
  total_activities: defaultActivities.length,
  total_comments: defaultActivities.reduce((sum, activity) => sum + (activity.comments || 0), 0),
  total_likes_received: defaultActivities.reduce((sum, activity) => sum + (activity.likes || 0), 0),
  activity_type_distribution: defaultActivities.reduce((dist, activity) => {
    const type = activity.type || 'other';
    dist[type] = (dist[type] || 0) + 1;
    return dist;
  }, {})
};

export const mockDataService = {
  getDefaultActivities: () => defaultActivities,
  
  getUserProfile: (userId) => {
    // For now just return the default profile
    return {
      ...defaultUserProfile,
      id: userId || defaultUserProfile.id
    };
  },
  
  getUserStats: (userId) => {
    // Return default stats
    return defaultUserStats;
  }
};
