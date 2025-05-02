const express = require('express');
const router = express.Router();
const userModel = require('../models/user');
const { supabase } = require('../utils/supabaseClient');

// Get all friends for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get friend relationships from database
    const { data, error } = await supabase
      .from('friends')
      .select(`
        friend_id,
        friend:friend_id (
          id, first_name, last_name, email, role
        )
      `)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching friends:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching friends'
      });
    }
    
    // Transform data for frontend consumption
    const friendsList = data.map(friend => ({
      id: friend.friend_id,
      name: `${friend.friend.first_name} ${friend.friend.last_name}`,
      email: friend.friend.email,
      role: friend.friend.role
    }));
    
    return res.json({
      success: true,
      items: friendsList,
      count: friendsList.length
    });
  } catch (error) {
    console.error('Error in friends controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing friend request'
    });
  }
});

// Add a friend
router.post('/:userId/add/:friendId', async (req, res) => {
  try {
    const { userId, friendId } = req.params;
    
    // Check if already friends
    const { data: existing, error: checkError } = await supabase
      .from('friends')
      .select('id')
      .eq('user_id', userId)
      .eq('friend_id', friendId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking friendship:', checkError);
      return res.status(500).json({
        success: false,
        message: 'Error checking friendship status'
      });
    }
    
    if (existing) {
      return res.json({
        success: true,
        message: 'Already friends',
        alreadyFriends: true
      });
    }
    
    // Add friend relationship
    const { error } = await supabase
      .from('friends')
      .insert([{
        user_id: userId,
        friend_id: friendId
      }]);
    
    if (error) {
      console.error('Error adding friend:', error);
      return res.status(500).json({
        success: false,
        message: 'Error adding friend'
      });
    }
    
    return res.json({
      success: true,
      message: 'Friend added successfully'
    });
  } catch (error) {
    console.error('Error in friends controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing friend request'
    });
  }
});

// Remove a friend
router.delete('/:userId/remove/:friendId', async (req, res) => {
  try {
    const { userId, friendId } = req.params;
    
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('user_id', userId)
      .eq('friend_id', friendId);
    
    if (error) {
      console.error('Error removing friend:', error);
      return res.status(500).json({
        success: false,
        message: 'Error removing friend'
      });
    }
    
    return res.json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (error) {
    console.error('Error in friends controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing friend request'
    });
  }
});

// Get activities from friends
router.get('/:userId/activities', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;
    
    // Get friend IDs
    const { data: friendsData, error: friendsError } = await supabase
      .from('friends')
      .select('friend_id')
      .eq('user_id', userId);
    
    if (friendsError) {
      console.error('Error fetching friend IDs:', friendsError);
      return res.status(500).json({
        success: false,
        message: 'Error fetching friend activities'
      });
    }
    
    if (!friendsData || friendsData.length === 0) {
      return res.json({
        success: true,
        items: [],
        count: 0
      });
    }
    
    const friendIds = friendsData.map(f => f.friend_id);
    
    // Get activities from friends
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        user:user_id (
          id, first_name, last_name, email, role
        ),
        comments:activity_comments (
          id, user_id, comment, created_at,
          user:user_id (
            id, first_name, last_name
          )
        )
      `)
      .in('user_id', friendIds)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching friend activities:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching friend activities'
      });
    }
    
    // Transform data for frontend consumption
    const activitiesList = data.map(activity => ({
      ...activity,
      user: activity.user ? {
        id: activity.user.id,
        name: `${activity.user.first_name} ${activity.user.last_name}`,
        email: activity.user.email,
        role: activity.user.role
      } : null,
      comments: activity.comments ? activity.comments.map(comment => ({
        id: comment.id,
        text: comment.comment,
        created_at: comment.created_at,
        user: comment.user ? {
          id: comment.user.id,
          name: `${comment.user.first_name} ${comment.user.last_name}`
        } : null
      })) : []
    }));
    
    return res.json({
      success: true,
      items: activitiesList,
      count: activitiesList.length
    });
  } catch (error) {
    console.error('Error in friends controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing friend activities request'
    });
  }
});

module.exports = router;
