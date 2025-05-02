const express = require('express');
const router = express.Router();
const { supabase } = require('../utils/supabaseClient');

// Get all activities
router.get('/', async (req, res) => {
  try {
    const { limit = 20, page = 0 } = req.query;
    const offset = page * limit;
    
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
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching activities:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching activities'
      });
    }
    
    // Transform data to match expected client format
    const transformedData = data.map(activity => ({
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
      items: transformedData,
      count: transformedData.length
    });
  } catch (error) {
    console.error('Error in activities controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing activities request'
    });
  }
});

// Get activity by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
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
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Activity not found'
        });
      }
      console.error('Error fetching activity:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching activity'
      });
    }
    
    // Transform data to match expected client format
    const transformedData = {
      ...data,
      user: data.user ? {
        id: data.user.id,
        name: `${data.user.first_name} ${data.user.last_name}`,
        email: data.user.email,
        role: data.user.role
      } : null,
      comments: data.comments ? data.comments.map(comment => ({
        id: comment.id,
        text: comment.comment,
        created_at: comment.created_at,
        user: comment.user ? {
          id: comment.user.id,
          name: `${comment.user.first_name} ${comment.user.last_name}`
        } : null
      })) : []
    };
    
    return res.json({
      success: true,
      item: transformedData
    });
  } catch (error) {
    console.error('Error in activities controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing activity request'
    });
  }
});

// Get activities by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user activities:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching user activities'
      });
    }
    
    // Transform data to match expected client format
    const transformedData = data.map(activity => ({
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
      items: transformedData,
      count: transformedData.length
    });
  } catch (error) {
    console.error('Error in activities controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing user activities request'
    });
  }
});

// Create activity
router.post('/', async (req, res) => {
  try {
    const activityData = req.body;
    
    // Validate required fields
    if (!activityData.user_id || !activityData.title) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields (user_id and title are required)'
      });
    }
    
    // Set defaults for likes and comments counts
    const newActivity = {
      ...activityData,
      likes: activityData.likes || 0,
      comments: activityData.comments || 0,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('activities')
      .insert([newActivity])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating activity:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating activity'
      });
    }
    
    return res.json({
      success: true,
      item: data
    });
  } catch (error) {
    console.error('Error in activities controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing activity creation'
    });
  }
});

// Update activity
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Get original activity to check ownership or admin status
    const { data: existingActivity, error: fetchError } = await supabase
      .from('activities')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Activity not found'
        });
      }
      console.error('Error fetching activity for update:', fetchError);
      return res.status(500).json({
        success: false,
        message: 'Error updating activity'
      });
    }
    
    // Check if user has permission (is owner or admin)
    // In a real app, you would check req.user.id against activity.user_id
    // or check if req.user.role === 'admin'
    
    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating activity:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating activity'
      });
    }
    
    return res.json({
      success: true,
      item: data
    });
  } catch (error) {
    console.error('Error in activities controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing activity update'
    });
  }
});

// Delete activity
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get original activity to check ownership or admin status
    const { data: existingActivity, error: fetchError } = await supabase
      .from('activities')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Activity not found'
        });
      }
      console.error('Error fetching activity for deletion:', fetchError);
      return res.status(500).json({
        success: false,
        message: 'Error deleting activity'
      });
    }
    
    // Check if user has permission (is owner or admin)
    // In a real app, you would check req.user.id against activity.user_id
    // or check if req.user.role === 'admin'
    
    const { data, error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error deleting activity:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting activity'
      });
    }
    
    return res.json({
      success: true,
      message: 'Activity deleted successfully',
      item: data
    });
  } catch (error) {
    console.error('Error in activities controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing activity deletion'
    });
  }
});

// Add comment to activity
router.post('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, comment } = req.body;
    
    // Validate required fields
    if (!userId || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields (userId and comment are required)'
      });
    }
    
    // First, check if the activity exists
    const { data: activityExists, error: checkError } = await supabase
      .from('activities')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Activity not found'
        });
      }
      console.error('Error checking activity existence:', checkError);
      return res.status(500).json({
        success: false,
        message: 'Error adding comment'
      });
    }
    
    // Add the comment
    const { data, error } = await supabase
      .from('activity_comments')
      .insert([{
        activity_id: id,
        user_id: userId,
        comment: comment
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding comment:', error);
      return res.status(500).json({
        success: false,
        message: 'Error adding comment'
      });
    }
    
    // Update comment count on the activity
    const { error: updateError } = await supabase.rpc('increment_comment_count', {
      act_id: id
    });
    
    if (updateError) {
      console.error('Error incrementing comment count:', updateError);
      // Non-blocking, we'll still return the comment
    }
    
    return res.json({
      success: true,
      item: data
    });
  } catch (error) {
    console.error('Error in activities controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing comment addition'
    });
  }
});

// Like activity
router.post('/:id/likes', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: userId'
      });
    }
    
    // First, check if the activity exists
    const { data: activityExists, error: checkError } = await supabase
      .from('activities')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Activity not found'
        });
      }
      console.error('Error checking activity existence:', checkError);
      return res.status(500).json({
        success: false,
        message: 'Error liking activity'
      });
    }
    
    // Check if already liked
    const { data: existingLike, error: likeCheckError } = await supabase
      .from('activity_likes')
      .select('id')
      .eq('activity_id', id)
      .eq('user_id', userId)
      .single();
    
    if (likeCheckError && likeCheckError.code !== 'PGRST116') {
      console.error('Error checking existing like:', likeCheckError);
      return res.status(500).json({
        success: false,
        message: 'Error liking activity'
      });
    }
    
    if (existingLike) {
      return res.json({
        success: true,
        message: 'Activity already liked by this user',
        alreadyLiked: true
      });
    }
    
    // Add the like
    const { data, error } = await supabase
      .from('activity_likes')
      .insert([{
        activity_id: id,
        user_id: userId
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding like:', error);
      return res.status(500).json({
        success: false,
        message: 'Error liking activity'
      });
    }
    
    // Update like count on the activity
    const { error: updateError } = await supabase.rpc('increment_like_count', {
      act_id: id
    });
    
    if (updateError) {
      console.error('Error incrementing like count:', updateError);
      // Non-blocking, we'll still return the like
    }
    
    return res.json({
      success: true,
      message: 'Activity liked successfully',
      item: data
    });
  } catch (error) {
    console.error('Error in activities controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing activity like'
    });
  }
});

module.exports = router;
