/**
 * Comments controller for handling comment-related API endpoints
 */
const express = require('express');
const router = express.Router();
const { supabase } = require('../utils/supabaseClient');

// Get comments for a specific activity
router.get('/:activityId', async (req, res) => {
  try {
    const { activityId } = req.params;
    
    const { data, error } = await supabase
      .from('activity_comments')
      .select(`
        *,
        user:user_id (
          id, first_name, last_name, profile_picture_url
        )
      `)
      .eq('activity_id', activityId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching comments'
      });
    }
    
    // Transform data to match expected client format
    const transformedData = data.map(comment => ({
      id: comment.id,
      text: comment.comment,
      created_at: comment.created_at,
      user: comment.user ? {
        id: comment.user.id,
        name: `${comment.user.first_name} ${comment.user.last_name}`,
        profilePicture: comment.user.profile_picture_url
      } : null
    }));
    
    return res.json({
      success: true,
      items: transformedData,
      count: transformedData.length
    });
  } catch (error) {
    console.error('Error in comments controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing comments request'
    });
  }
});

// Add a new comment
router.post('/', async (req, res) => {
  try {
    const { activity_id, user_id, comment } = req.body;
    
    // Validate required fields
    if (!activity_id || !user_id || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields (activity_id, user_id, and comment are required)'
      });
    }
    
    // Add the comment
    const { data, error } = await supabase
      .from('activity_comments')
      .insert([{
        activity_id,
        user_id,
        comment
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
    await supabase.rpc('increment_comment_count', {
      act_id: activity_id
    });
    
    return res.json({
      success: true,
      item: data
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error adding comment'
    });
  }
});

// Delete a comment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the comment first to check ownership and get activity_id
    const { data: comment, error: fetchError } = await supabase
      .from('activity_comments')
      .select('activity_id, user_id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }
      console.error('Error fetching comment:', fetchError);
      return res.status(500).json({
        success: false,
        message: 'Error deleting comment'
      });
    }
    
    // Delete the comment
    const { error } = await supabase
      .from('activity_comments')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting comment:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting comment'
      });
    }
    
    // Decrement comment count on the activity
    await supabase.rpc('decrement_comment_count', {
      act_id: comment.activity_id
    });
    
    return res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting comment'
    });
  }
});

module.exports = router;
