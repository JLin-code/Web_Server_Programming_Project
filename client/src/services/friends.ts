import { supabseFriends } from './supabase'
import type { Friend, ApiResponse } from '../types/models'

export const friendsService = {
  // Get all friends for a user
  async getFriends(userId: string): Promise<ApiResponse<Friend>> {
    try {
      const result = await supabseFriends.getFriends(userId)
      return result
    } catch (error) {
      console.error('Error fetching friends:', error)
      return {
        success: false,
        error: 'Failed to fetch friends',
        items: []
      }
    }
  },
  
  // Add a friend
  async addFriend(userId: string, friendId: string): Promise<ApiResponse<any>> {
    try {
      const result = await supabseFriends.addFriend(userId, friendId)
      return {
        success: true,
        message: result.alreadyFriends ? 'Already friends' : 'Friend added successfully'
      }
    } catch (error) {
      console.error('Error adding friend:', error)
      return {
        success: false,
        error: 'Failed to add friend'
      }
    }
  },
  
  // Remove a friend
  async removeFriend(userId: string, friendId: string): Promise<ApiResponse<any>> {
    try {
      await supabseFriends.removeFriend(userId, friendId)
      return {
        success: true,
        message: 'Friend removed successfully'
      }
    } catch (error) {
      console.error('Error removing friend:', error)
      return {
        success: false,
        error: 'Failed to remove friend'
      }
    }
  }
}
