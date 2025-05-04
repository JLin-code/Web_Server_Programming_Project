/**
 * This service provides mock data when the API is unavailable
 */
export const mockDataService = {
  getDefaultActivities() {
    return [
      {
        id: 'mock-001',
        title: 'Morning Run',
        description: 'Quick 5K run around the park',
        type: 'running',
        created_at: new Date().toISOString(),
        image_url: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600',
        likes: 5,
        comments: 2,
        user: {
          id: 'mock-user-001',
          name: 'Demo User',
          email: 'demo@example.com',
          role: 'user',
          profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg'
        }
      },
      {
        id: 'mock-002',
        title: 'Gym Workout',
        description: 'Leg day at the gym',
        type: 'strength',
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',
        likes: 3,
        comments: 1,
        user: {
          id: 'mock-user-002',
          name: 'Sample User',
          email: 'sample@example.com',
          role: 'user',
          profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg'
        }
      },
      {
        id: 'mock-003',
        title: 'Yoga Class',
        description: 'Relaxing yoga session',
        type: 'yoga',
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        image_url: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600',
        likes: 7,
        comments: 3,
        user: {
          id: 'mock-user-003',
          name: 'Yoga Enthusiast',
          email: 'yoga@example.com',
          role: 'user',
          profilePicture: 'https://randomuser.me/api/portraits/women/6.jpg'
        }
      }
    ];
  },

  getCurrentUser() {
    return {
      id: 'mock-user-001',
      first_name: 'Demo',
      last_name: 'User',
      email: 'demo@example.com',
      role: 'user',
      profile_picture_url: 'https://randomuser.me/api/portraits/men/3.jpg'
    };
  }
};

export default mockDataService;
