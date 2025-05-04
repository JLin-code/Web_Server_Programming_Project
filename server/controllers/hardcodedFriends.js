const express = require('express');
const router = express.Router();

// Hardcoded friend relationships
const mockFriends = [
  {
    id: '1',
    user_id: 'user1',
    friend_id: 'user2',
    created_at: '2023-05-01T12:00:00Z'
  },
  {
    id: '2',
    user_id: 'user1',
    friend_id: 'user3',
    created_at: '2023-05-02T14:30:00Z'
  },
  {
    id: '3',
    user_id: 'user2',
    friend_id: 'user1',
    created_at: '2023-05-01T12:05:00Z'
  },
  {
    id: '4',
    user_id: 'user2',
    friend_id: 'user3',
    created_at: '2023-06-15T09:20:00Z'
  },
  {
    id: '5',
    user_id: 'user3',
    friend_id: 'user1',
    created_at: '2023-05-02T14:35:00Z'
  }
];

// GET all friends for a user
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    // Filter friends where the user_id matches the requested userId
    const userFriends = mockFriends
      .filter(f => f.user_id === userId)
      .map(f => ({
        id: f.id,
        user_id: f.user_id,
        friend_id: f.friend_id,
        created_at: f.created_at,
        // Add more details here if needed
      }));
    
    return res.json({
      success: true,
      items: userFriends,
      count: userFriends.length
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching friends',
      error: error.message
    });
  }
});

// POST add a friend
router.post('/:userId/add/:friendId', (req, res) => {
  try {
    const { userId, friendId } = req.params;
    
    // Check if already friends
    const alreadyFriends = mockFriends.some(
      f => f.user_id === userId && f.friend_id === friendId
    );
    
    if (alreadyFriends) {
      return res.json({
        success: true,
        message: 'Already friends',
        alreadyFriends: true
      });
    }
    
    // Create new friendship
    const newFriendship = {
      id: String(mockFriends.length + 1),
      user_id: userId,
      friend_id: friendId,
      created_at: new Date().toISOString()
    };
    
    // Add to mock data
    mockFriends.push(newFriendship);
    
    return res.status(201).json({
      success: true,
      message: 'Friend added successfully',
      friendship: newFriendship
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error adding friend',
      error: error.message
    });
  }
});

// DELETE remove a friend
router.delete('/:userId/remove/:friendId', (req, res) => {
  try {
    const { userId, friendId } = req.params;
    const initialLength = mockFriends.length;
    
    // Filter out the friendship
    const updatedFriends = mockFriends.filter(
      f => !(f.user_id === userId && f.friend_id === friendId)
    );
    
    // Check if any friendship was removed
    if (updatedFriends.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Friendship not found'
      });
    }
    
    // Update the mock data
    mockFriends.length = 0;
    mockFriends.push(...updatedFriends);
    
    return res.json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error removing friend',
      error: error.message
    });
  }
});

module.exports = router;
