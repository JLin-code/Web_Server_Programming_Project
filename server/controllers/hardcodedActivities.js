/**
 * Controller to serve hardcoded activity data for development and testing
 */
const express = require('express');
const router = express.Router();

// Sample activities data
const mockActivities = [
  {
    id: 'act-001',
    title: 'Morning Run',
    description: 'A quick 5k run around the park',
    activityType: 'running',
    created_at: '2023-11-01T08:30:00Z',
    user: {
      id: 'usr-001',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      profilePicture: 'https://example.com/profiles/admin.jpg'
    },
    comments: [
      {
        id: 'com-001',
        text: 'Great pace!',
        created_at: '2023-11-01T10:15:00Z',
        user: {
          id: 'usr-002',
          name: 'Regular User',
          profilePicture: 'https://example.com/profiles/regular.jpg'
        }
      }
    ]
  },
  {
    id: 'act-002',
    title: 'Weekend Hike',
    description: 'Hiked up to Mountain Peak with friends',
    activityType: 'hiking',
    created_at: '2023-10-28T09:45:00Z',
    user: {
      id: 'usr-002',
      name: 'Regular User',
      email: 'user@example.com',
      role: 'user',
      profilePicture: 'https://example.com/profiles/regular.jpg'
    },
    comments: [
      {
        id: 'com-002',
        text: 'Beautiful views from up there!',
        created_at: '2023-10-28T18:20:00Z',
        user: {
          id: 'usr-001',
          name: 'Admin User',
          profilePicture: 'https://example.com/profiles/admin.jpg'
        }
      },
      {
        id: 'com-003',
        text: 'We should go again sometime!',
        created_at: '2023-10-29T08:05:00Z',
        user: {
          id: 'usr-003',
          name: 'Demo User',
          profilePicture: 'https://example.com/profiles/demo.jpg'
        }
      }
    ]
  },
  {
    id: 'act-003',
    title: 'Yoga Session',
    description: 'Hour-long yoga session focusing on flexibility',
    activityType: 'yoga',
    created_at: '2023-10-30T17:00:00Z',
    user: {
      id: 'usr-003',
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'user',
      profilePicture: 'https://example.com/profiles/demo.jpg'
    },
    comments: []
  }
];

// GET all activities
router.get('/', (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Mock activities retrieved successfully',
      activities: mockActivities
    });
  } catch (error) {
    console.error('Error retrieving mock activities:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving mock activities'
    });
  }
});

// GET activity by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const activity = mockActivities.find(act => act.id === id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: `Activity with ID ${id} not found`
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Mock activity retrieved successfully',
      activity
    });
  } catch (error) {
    console.error(`Error retrieving mock activity ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving mock activity'
    });
  }
});

// GET activities by user ID
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userActivities = mockActivities.filter(activity => activity.user.id === userId);
    
    return res.status(200).json({
      success: true,
      message: `Mock activities for user ${userId} retrieved successfully`,
      activities: userActivities
    });
  } catch (error) {
    console.error(`Error retrieving mock activities for user ${req.params.userId}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving user mock activities'
    });
  }
});

module.exports = router;
