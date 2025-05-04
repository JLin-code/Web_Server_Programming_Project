import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with environment variables and fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://chuhfxkepvakwgmhiuep.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-key'

console.log('Supabase Client Configuration:')
console.log(`- URL defined: ${!!supabaseUrl}`)
console.log(`- KEY defined: ${!!supabaseAnonKey}`)
console.log(`- URL: ${supabaseUrl}`)
console.log(`- KEY: ${supabaseAnonKey ? '***' + supabaseAnonKey.substring(supabaseAnonKey.length-5) : 'undefined'}`)

// Create a custom Supabase client with error handling
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    },
    global: {
      headers: {
        'x-application-name': 'fitness-tracker-client'
      },
    }
  }
)

// Test connection with better error handling
async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection from client...')
    const startTime = performance.now()
    const { data, error } = await supabase.from('users').select('count').limit(1)
    const duration = performance.now() - startTime
    
    if (error) {
      console.error(`❌ Supabase connection failed (${duration.toFixed(2)}ms):`, error)
      console.error('Please check your .env file and make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly.')
      return false
    }
    
    console.log(`✅ Supabase connection successful (${duration.toFixed(2)}ms):`, data)
    return true
  } catch (err) {
    console.error('❌ Critical Supabase connection error:', err)
    console.error('This could indicate network issues or invalid credentials.')
    return false
  }
}

// Run test immediately
testSupabaseConnection()

// User methods using Supabase
export const supabaseUsers = {
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role, profile_picture_url, created_at')
    
    if (error) {
      console.error('Error fetching users:', error)
      throw error
    }
    
    return { items: data, total: data.length }
  },
  
  async getById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role, profile_picture_url, created_at')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching user:', error)
      throw error
    }
    
    return data
  },
  
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, 
        first_name, 
        last_name, 
        email, 
        role,
        profile_picture_url, 
        created_at
      `)
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
    
    return data
  }
}

// Activity methods for social posts
export const supabaseActivities = {
  async getAll(limit = 20) {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        user:user_id (
          id, first_name, last_name, email, role, profile_picture_url
        ),
        comments:activity_comments (
          id, user_id, comment, created_at,
          user:user_id (
            id, first_name, last_name, profile_picture_url
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching activities:', error)
      throw error
    }
    
    // Transform data for frontend consumption
    return {
      success: true,
      items: data.map(activity => ({
        ...activity,
        user: activity.user ? {
          id: activity.user.id,
          name: `${activity.user.first_name} ${activity.user.last_name}`,
          email: activity.user.email,
          role: activity.user.role,
          profilePicture: activity.user.profile_picture_url
        } : null,
        comments: activity.comments ? activity.comments.map(comment => ({
          id: comment.id,
          text: comment.comment,
          created_at: comment.created_at,
          user: comment.user ? {
            id: comment.user.id,
            name: `${comment.user.first_name} ${comment.user.last_name}`,
            profilePicture: comment.user.profile_picture_url
          } : null
        })) : []
      }))
    }
  },
  
  async getUserActivities(userId) {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        user:user_id (
          id, first_name, last_name, email, role, profile_picture_url
        ),
        comments:activity_comments (
          id, user_id, comment, created_at,
          user:user_id (
            id, first_name, last_name, profile_picture_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching user activities:', error)
      throw error
    }
    
    // Transform data for frontend consumption
    return {
      success: true,
      items: data.map(activity => ({
        ...activity,
        user: activity.user ? {
          id: activity.user.id,
          name: `${activity.user.first_name} ${activity.user.last_name}`,
          email: activity.user.email,
          role: activity.user.role,
          profilePicture: activity.user.profile_picture_url
        } : null,
        comments: activity.comments ? activity.comments.map(comment => ({
          id: comment.id,
          text: comment.comment,
          created_at: comment.created_at,
          user: comment.user ? {
            id: comment.user.id,
            name: `${comment.user.first_name} ${comment.user.last_name}`,
            profilePicture: comment.user.profile_picture_url
          } : null
        })) : []
      }))
    }
  },
  
  async createActivity(activityData) {
    const { data, error } = await supabase
      .from('activities')
      .insert([activityData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating activity:', error)
      throw error
    }
    
    return data
  },
  
  async addComment(activityId, userId, comment) {
    const { data, error } = await supabase
      .from('activity_comments')
      .insert([{
        activity_id: activityId,
        user_id: userId,
        comment: comment
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error adding comment:', error)
      throw error
    }
    
    // Update comment count on the activity
    await this.incrementCommentCount(activityId)
    
    return data
  },
  
  async incrementCommentCount(activityId) {
    const { error } = await supabase.rpc('increment_comment_count', {
      act_id: activityId
    })
    
    if (error) {
      console.error('Error incrementing comment count:', error)
      // Non-blocking, just log the error
    }
  },
  
  async likeActivity(activityId, userId) {
    try {
      await supabase
        .from('activity_likes')
        .insert([
          { activity_id: activityId, user_id: userId }
        ]);
      
      await supabase.rpc('increment_like_count', { act_id: activityId });
      
      return { success: true };
    } catch (error) {
      console.error('Error liking activity:', error);
      throw error;
    }
  },
  
  async incrementLikeCount(activityId) {
    const { error } = await supabase.rpc('increment_like_count', {
      act_id: activityId
    })
    
    if (error) {
      console.error('Error incrementing like count:', error)
      // Non-blocking, just log the error
    }
  }
}

// Friends-related methods
export const supabaseFriends = {
  async getFriends(userId) {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        friend_id,
        friend:friend_id (
          id, first_name, last_name, email, role, profile_picture_url
        )
      `)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error fetching friends:', error)
      throw error
    }
    
    // Transform data for frontend consumption
    return {
      success: true,
      items: data.map(friend => ({
        id: friend.friend_id,
        name: `${friend.friend.first_name} ${friend.friend.last_name}`,
        email: friend.friend.email,
        role: friend.friend.role,
        profilePicture: friend.friend.profile_picture_url
      }))
    }
  },
  
  async addFriend(userId, friendId) {
    // First check if already friends
    const { data: existing, error: checkError } = await supabase
      .from('friends')
      .select('id')
      .eq('user_id', userId)
      .eq('friend_id', friendId)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking friendship:', checkError)
      throw checkError
    }
    
    if (existing) {
      return { alreadyFriends: true }
    }
    
    // Add friend
    const { error } = await supabase
      .from('friends')
      .insert([{
        user_id: userId,
        friend_id: friendId
      }])
      .select()
    
    if (error) {
      console.error('Error adding friend:', error)
      throw error
    }
    
    return { success: true }
  },
  
  async removeFriend(userId, friendId) {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('user_id', userId)
      .eq('friend_id', friendId)
    
    if (error) {
      console.error('Error removing friend:', error)
      throw error
    }
    
    return { success: true }
  },
  
  async getFriendActivities(userId, limit = 20) {
    // Get friend IDs
    const { data: friendsData, error: friendsError } = await supabase
      .from('friends')
      .select('friend_id')
      .eq('user_id', userId)
    
    if (friendsError) {
      console.error('Error fetching friend IDs:', friendsError)
      throw friendsError
    }
    
    if (!friendsData || friendsData.length === 0) {
      return { success: true, items: [] }
    }
    
    const friendIds = friendsData.map(f => f.friend_id)
    
    // Get activities from friends
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        user:user_id (
          id, first_name, last_name, email, role, profile_picture_url
        ),
        comments:activity_comments (
          id, user_id, comment, created_at,
          user:user_id (
            id, first_name, last_name, profile_picture_url
          )
        )
      `)
      .in('user_id', friendIds)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching friend activities:', error)
      throw error
    }
    
    // Transform data for frontend consumption
    return {
      success: true,
      items: data.map(activity => ({
        ...activity,
        user: activity.user ? {
          id: activity.user.id,
          name: `${activity.user.first_name} ${activity.user.last_name}`,
          email: activity.user.email,
          role: activity.user.role,
          profilePicture: activity.user.profile_picture_url
        } : null,
        comments: activity.comments ? activity.comments.map(comment => ({
          id: comment.id,
          text: comment.comment,
          created_at: comment.created_at,
          user: comment.user ? {
            id: comment.user.id,
            name: `${comment.user.first_name} ${comment.user.last_name}`,
            profilePicture: comment.user.profile_picture_url
          } : null
        })) : []
      }))
    }
  }
}

// Statistics methods
export const supabaseStats = {
  async getUserStatistics(userId) {
    const { data, error } = await supabase
      .rpc('get_user_statistics_with_periods', { user_id_param: userId })
    
    if (error) {
      console.error('Error fetching user statistics:', error)
      throw error
    }
    
    return data
  },
  
  async getGlobalStatistics() {
    const { data, error } = await supabase
      .rpc('get_global_statistics_with_periods')
    
    if (error) {
      console.error('Error fetching global statistics:', error)
      throw error
    }
    
    return data
  }
}

// Create a type-safe enhanced client with getGlobalStatistics
/** @type {import('@supabase/supabase-js').SupabaseClient & {getGlobalStatistics: () => Promise<any>}} */
const enhancedSupabase = {
  ...supabase,
  getGlobalStatistics: supabaseStats.getGlobalStatistics
}

// Replace the default export with our enhanced version
export default enhancedSupabase
