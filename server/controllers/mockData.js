const express = require('express');
const router = express.Router();

// Mock data for users
const mockUsers = [
  {
    id: 'user1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    role: 'user',
    profile_picture_url: 'https://i.pravatar.cc/150?img=1',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 'user2',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane@example.com',
    role: 'admin',
    profile_picture_url: 'https://i.pravatar.cc/150?img=2',
    created_at: '2024-01-16T09:20:00Z'
  },
  {
    id: 'user3',
    first_name: 'Mike',
    last_name: 'Johnson',
    email: 'mike@example.com',
    role: 'user',
    profile_picture_url: 'https://i.pravatar.cc/150?img=3',
    created_at: '2024-01-17T14:15:00Z'
  }
];

// Mock data for activities
const mockActivities = [
  {
    id: 'act1',
    user_id: 'user1',
    activity_type: 'running',
    title: 'Morning Run',
    description: 'Great 5K run this morning!',
    duration: 30,
    distance: 5.0,
    calories: 320,
    created_at: '2024-03-10T08:15:00Z',
    comment_count: 2,
    like_count: 5
  },
  {
    id: 'act2',
    user_id: 'user2',
    activity_type: 'cycling',
    title: 'Weekend Cycling Tour',
    description: 'Beautiful route through the countryside',
    duration: 120,
    distance: 28.5,
    calories: 750,
    created_at: '2024-03-09T15:30:00Z',
    comment_count: 1,
    like_count: 8
  },
  {
    id: 'act3',
    user_id: 'user3',
    activity_type: 'weightlifting',
    title: 'Strength Training',
    description: 'New personal best on bench press!',
    duration: 60,
    calories: 450,
    created_at: '2024-03-08T17:45:00Z',
    comment_count: 3,
    like_count: 12
  },
  {
    id: 'act4',
    user_id: 'user1',
    activity_type: 'swimming',
    title: 'Pool Session',
    description: 'Working on my freestyle technique',
    duration: 45,
    distance: 1.5,
    calories: 400,
    created_at: '2024-03-07T12:30:00Z',
    comment_count: 0,
    like_count: 3
  }
];

// Mock data for comments
const mockComments = [
  {
    id: 'comment1',
    activity_id: 'act1',
    user_id: 'user2',
    comment: 'Great job on your run!',
    created_at: '2024-03-10T09:20:00Z'
  },
  {
    id: 'comment2',
    activity_id: 'act1',
    user_id: 'user3',
    comment: 'What route did you take?',
    created_at: '2024-03-10T10:05:00Z'
  },
  {
    id: 'comment3',
    activity_id: 'act2',
    user_id: 'user1',
    comment: 'The countryside looks amazing!',
    created_at: '2024-03-09T16:15:00Z'
  },
  {
    id: 'comment4',
    activity_id: 'act3',
    user_id: 'user1',
    comment: 'What was your PR?',
    created_at: '2024-03-08T18:10:00Z'
  },
  {
    id: 'comment5',
    activity_id: 'act3',
    user_id: 'user2',
    comment: 'Beast mode activated!',
    created_at: '2024-03-08T18:30:00Z'
  },
  {
    id: 'comment6',
    activity_id: 'act3',
    user_id: 'user3',
    comment: 'Thanks for the support everyone!',
    created_at: '2024-03-08T19:15:00Z'
  }
];

// Mock data for friends
const mockFriends = [
  { user_id: 'user1', friend_id: 'user2' },
  { user_id: 'user1', friend_id: 'user3' },
  { user_id: 'user2', friend_id: 'user1' },
  { user_id: 'user3', friend_id: 'user1' },
  { user_id: 'user2', friend_id: 'user3' },
  { user_id: 'user3', friend_id: 'user2' }
];

// Mock statistics
const mockGlobalStats = {
  total_users: 24,
  total_activities: 156,
  total_comments: 312,
  activity_type_distribution: {
    running: 45,
    cycling: 32,
    swimming: 28,
    weightlifting: 35,
    yoga: 16
  },
  periods: {
    all_time: { likes: 742 },
    last_month: { likes: 185 },
    last_week: { likes: 58 }
  }
};

// Helper functions to enrich mock data
function enrichActivities(activities) {
  return activities.map(activity => {
    const user = mockUsers.find(u => u.id === activity.user_id);
    const activityComments = mockComments.filter(c => c.activity_id === activity.id).map(c => {
      const commentUser = mockUsers.find(u => u.id === c.user_id);
      return {
        id: c.id,
        text: c.comment,
        created_at: c.created_at,
        user: commentUser ? {
          id: commentUser.id,
          name: `${commentUser.first_name} ${commentUser.last_name}`,
          profilePicture: commentUser.profile_picture_url
        } : null
      };
    });

    return {
      ...activity,
      user: user ? {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role,
        profilePicture: user.profile_picture_url
      } : null,
      comments: activityComments
    };
  });
}

function getUserStatistics(userId) {
  const userActivities = mockActivities.filter(a => a.user_id === userId);
  const userComments = mockComments.filter(c => c.user_id === userId);
  const likesReceived = userActivities.reduce((sum, act) => sum + act.like_count, 0);
  
  const activityTypes = {};
  userActivities.forEach(act => {
    activityTypes[act.activity_type] = (activityTypes[act.activity_type] || 0) + 1;
  });
  
  return {
    total_activities: userActivities.length,
    total_comments: userComments.length,
    total_likes_received: likesReceived,
    activity_type_distribution: activityTypes,
    periods: {
      all_time: { likes: likesReceived },
      last_month: { likes: Math.floor(likesReceived * 0.6) },
      last_week: { likes: Math.floor(likesReceived * 0.2) }
    }
  };
}

// Endpoints
router.get('/users', (req, res) => {
  res.json({ items: mockUsers, total: mockUsers.length });
});

router.get('/users/:id', (req, res) => {
  const user = mockUsers.find(u => u.id === req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

router.get('/activities', (req, res) => {
  res.json({
    success: true,
    items: enrichActivities(mockActivities)
  });
});

router.get('/users/:id/activities', (req, res) => {
  const userActivities = mockActivities.filter(a => a.user_id === req.params.id);
  res.json({
    success: true,
    items: enrichActivities(userActivities)
  });
});

router.get('/users/:id/friends', (req, res) => {
  const userFriends = mockFriends
    .filter(f => f.user_id === req.params.id)
    .map(f => {
      const friend = mockUsers.find(u => u.id === f.friend_id);
      return {
        id: friend.id,
        name: `${friend.first_name} ${friend.last_name}`,
        email: friend.email,
        role: friend.role,
        profilePicture: friend.profile_picture_url
      };
    });
  
  res.json({
    success: true,
    items: userFriends
  });
});

router.get('/users/:id/friend-activities', (req, res) => {
  const userFriends = mockFriends.filter(f => f.user_id === req.params.id).map(f => f.friend_id);
  const friendActivities = mockActivities.filter(a => userFriends.includes(a.user_id));
  
  res.json({
    success: true,
    items: enrichActivities(friendActivities)
  });
});

router.get('/statistics/global', (req, res) => {
  res.json(mockGlobalStats);
});

router.get('/statistics/user/:id', (req, res) => {
  const userStats = getUserStatistics(req.params.id);
  res.json(userStats);
});

module.exports = router;
