import supabase, { supabaseActivities, supabseFriends } from './supabase'
import type { Activity, ActivityComment, ApiResponse } from '../types/models'

export const activitiesService = {
  // Get all activities (feed)
  async getActivities(limit = 20): Promise<ApiResponse<Activity>> {
    try {
      const result = await supabaseActivities.getAll(limit)
      return result
    } catch (error) {
      console.error('Error fetching activities:', error)
      return {
        success: false,
        error: 'Failed to fetch activities',
        items: []
      }
    }
  },
  
  // Get activities for a specific user
  async getUserActivities(userId: string): Promise<ApiResponse<Activity>> {
    try {
      const result = await supabaseActivities.getUserActivities(userId)
      return result
    } catch (error) {
      console.error('Error fetching user activities:', error)
      return {
        success: false,
        error: 'Failed to fetch user activities',
        items: []
      }
    }
  },
  
  // Create a new activity
  async createActivity(activity: Partial<Activity>): Promise<ApiResponse<Activity>> {
    try {
      const data = await supabaseActivities.createActivity(activity)
      return {
        success: true,
        item: data,
        message: 'Activity created successfully'
      }
    } catch (error) {
      console.error('Error creating activity:', error)
      return {
        success: false,
        error: 'Failed to create activity'
      }
    }
  },
  
  // Add comment to an activity
  async addComment(activityId: string, userId: string, comment: string): Promise<ApiResponse<ActivityComment>> {
    try {
      const data = await supabaseActivities.addComment(activityId, userId, comment)
      return {
        success: true,
        item: data,
        message: 'Comment added successfully'
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      return {
        success: false,
        error: 'Failed to add comment'
      }
    }
  },
  
  // Like an activity
  async likeActivity(activityId: string, userId: string): Promise<ApiResponse<any>> {
    try {
      const result = await supabaseActivities.likeActivity(activityId, userId)
      return {
        success: true,
        message: result.alreadyLiked ? 'Already liked' : 'Activity liked successfully'
      }
    } catch (error) {
      console.error('Error liking activity:', error)
      return {
        success: false,
        error: 'Failed to like activity'
      }
    }
  },
  
  // Get friend activities (social feed)
  async getFriendActivities(userId: string, limit = 20): Promise<ApiResponse<Activity>> {
    try {
      const result = await supabseFriends.getFriendActivities(userId, limit)
      return result
    } catch (error) {
      console.error('Error fetching friend activities:', error)
      return {
        success: false,
        error: 'Failed to fetch friend activities',
        items: []
      }
    }
  }
}
