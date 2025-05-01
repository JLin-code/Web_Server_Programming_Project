const { supabase } = require('../models/supabase');
const { CustomError, statusCodes } = require('../models/errors');

// Controller for secure data operations
const dataController = {
  // Get all activities with pagination
  async getAllActivities(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const page = parseInt(req.query.page) || 0;
      const offset = page * limit;
      
      const { data, error, count } = await supabase
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
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        console.error('Error fetching activities:', error);
        throw new CustomError('Failed to fetch activities', statusCodes.INTERNAL_SERVER_ERROR);
      }
      
      // Transform data for frontend consumption
      const formattedData = data.map(activity => ({
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
      
      res.json({
        success: true,
        items: formattedData,
        total: count,
        page,
        limit
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get activities for a specific user
  async getUserActivities(req, res, next) {
    try {
      const userId = req.params.userId;
      
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
        throw new CustomError('Failed to fetch user activities', statusCodes.INTERNAL_SERVER_ERROR);
      }
      
      // Transform data for frontend consumption
      const formattedData = data.map(activity => ({
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
      
      res.json({
        success: true,
        items: formattedData
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Create a new activity
  async createActivity(req, res, next) {
    try {
      const activityData = req.body;
      
      // Validate required fields
      if (!activityData.user_id || !activityData.content) {
        throw new CustomError('Missing required fields', statusCodes.BAD_REQUEST);
      }
      
      const { data, error } = await supabase
        .from('activities')
        .insert([activityData])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating activity:', error);
        throw new CustomError('Failed to create activity', statusCodes.INTERNAL_SERVER_ERROR);
      }
      
      res.status(201).json({
        success: true,
        activity: data
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Add a comment to an activity
  async addComment(req, res, next) {
    try {
      const { activityId } = req.params;
      const { userId, comment } = req.body;
      
      if (!userId || !comment) {
        throw new CustomError('Missing required fields', statusCodes.BAD_REQUEST);
      }
      
      const { data, error } = await supabase
        .from('activity_comments')
        .insert([{
          activity_id: activityId,
          user_id: userId,
          comment: comment
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding comment:', error);
        throw new CustomError('Failed to add comment', statusCodes.INTERNAL_SERVER_ERROR);
      }
      
      // Update comment count
      await supabase.rpc('increment_comment_count', {
        act_id: activityId
      });
      
      res.status(201).json({
        success: true,
        comment: data
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Like an activity
  async likeActivity(req, res, next) {
    try {
      const { activityId } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        throw new CustomError('Missing user ID', statusCodes.BAD_REQUEST);
      }
      
      const { error } = await supabase
        .from('activity_likes')
        .insert([{
          activity_id: activityId,
          user_id: userId
        }]);
      
      // If it's a unique violation (already liked), handle gracefully
      if (error) {
        if (error.code === '23505') {
          return res.json({ success: true, alreadyLiked: true });
        }
        console.error('Error liking activity:', error);
        throw new CustomError('Failed to like activity', statusCodes.INTERNAL_SERVER_ERROR);
      }
      
      // Update like count
      await supabase.rpc('increment_like_count', {
        act_id: activityId
      });
      
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },
  
  // Get friends for a user
  async getUserFriends(req, res, next) {
    try {
      const { userId } = req.params;
      
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
        throw new CustomError('Failed to fetch friends', statusCodes.INTERNAL_SERVER_ERROR);
      }
      
      // Transform data for frontend consumption
      const formattedData = data.map(friend => ({
        id: friend.friend_id,
        name: `${friend.friend.first_name} ${friend.friend.last_name}`,
        email: friend.friend.email,
        role: friend.friend.role
      }));
      
      res.json({
        success: true,
        items: formattedData
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get friend activities
  async getFriendActivities(req, res, next) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit) || 20;
      
      // Get friend IDs
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', userId);
      
      if (friendsError) {
        console.error('Error fetching friend IDs:', friendsError);
        throw new CustomError('Failed to fetch friends', statusCodes.INTERNAL_SERVER_ERROR);
      }
      
      if (!friendsData || friendsData.length === 0) {
        return res.json({ success: true, items: [] });
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
        throw new CustomError('Failed to fetch friend activities', statusCodes.INTERNAL_SERVER_ERROR);
      }
      
      // Transform data for frontend consumption
      const formattedData = data.map(activity => ({
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
      
      res.json({
        success: true,
        items: formattedData
      });
    } catch (error) {
      next(error);
    }
  },

  // Get statistics for a specific user
  async getUserStatistics(req, res, next) {
    try {
      const { userId } = req.params;
      
      const { data, error } = await supabase
        .rpc('get_user_statistics', { user_id_param: parseInt(userId) });
      
      if (error) {
        console.error('Error fetching user statistics:', error);
        throw new CustomError('Failed to fetch user statistics', statusCodes.INTERNAL_SERVER_ERROR);
      }
      
      res.json({
        success: true,
        statistics: data
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get global platform statistics
  async getGlobalStatistics(req, res, next) {
    try {
      const { data, error } = await supabase
        .rpc('get_global_statistics');
      
      if (error) {
        console.error('Error fetching global statistics:', error);
        throw new CustomError('Failed to fetch global statistics', statusCodes.INTERNAL_SERVER_ERROR);
      }
      
      res.json({
        success: true,
        statistics: data
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = dataController;
