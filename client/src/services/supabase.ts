import { createClient } from '@supabase/supabase-js';
import type { Activity } from '../types';

// Define types
export interface SupabaseUser {
  email: string;
  id?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  profile_picture_url?: string;
  created_at?: string;
}

export interface SupabaseSession {
  user: SupabaseUser;
}

export interface SupabaseAuthResponse {
  data: {
    session: SupabaseSession | null;
    user: SupabaseUser | null;
  };
  error: SupabaseError | null;
}

export interface SupabaseError {
  message: string;
  details?: unknown;
}

export interface SupabaseQueryResponse<T> {
  data: T | null;
  error: SupabaseError | null;
}

export interface ActivityComment {
  id: string;
  activity_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    profile_picture_url?: string;
  };
}

// Add a new interface for raw comments from Supabase queries
export interface RawComment {
  id: string;
  user_id: string;
  comment: string;
  created_at: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    profile_picture_url?: string;
  } | null;
}

export interface TransformedComment {
  id: string;
  text: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    profilePicture?: string;
  } | null;
}

export interface TransformedUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  profilePicture?: string;
}

export interface ActivityResponse {
  success: boolean;
  items: Activity[];
  error?: string;
}

export interface FriendData {
  friend_id: string;
  friend: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role?: string; 
    profile_picture_url?: string;
  };
}

export interface FriendResponse {
  success: boolean;
  items: {
    id: string;
    name: string;
    email: string;
    role?: string;
    profilePicture?: string;
  }[];
}

// Initialize Supabase client with environment variables and fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://chuhfxkepvakwgmhiuep.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-key';

console.log('Supabase Client Configuration:');
console.log(`- URL defined: ${!!supabaseUrl}`);
console.log(`- KEY defined: ${!!supabaseAnonKey}`);

// Create Supabase client
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
      }
    }
  }
);

// Test connection with better error handling
async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection from client...');
    const startTime = performance.now();
    const { data, error } = await supabase.from('users').select('count').limit(1);
    const duration = performance.now() - startTime;
    
    if (error) {
      console.error(`❌ Supabase connection failed (${duration.toFixed(2)}ms):`, error);
      console.error('Please check your .env file and make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly.');
      return false;
    }
    
    console.log(`✅ Supabase connection successful (${duration.toFixed(2)}ms):`, data);
    return true;
  } catch (err) {
    console.error('❌ Critical Supabase connection error:', err);
    console.error('This could indicate network issues or invalid credentials.');
    return false;
  }
}

// Run test immediately
testSupabaseConnection();

// Users-related methods
export const supabaseUsers = {
  async getAll() {
    console.log('supabaseUsers.getAll() called');
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, role, profile_picture_url, created_at');
      
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      console.log(`supabaseUsers.getAll(): Retrieved ${data?.length || 0} users`);
      
      // Ensure we always return a valid array
      return { 
        items: Array.isArray(data) ? data : [], 
        total: Array.isArray(data) ? data.length : 0 
      };
    } catch (err) {
      console.error('Exception in supabaseUsers.getAll():', err);
      // Return empty data structure instead of throwing
      return { items: [], total: 0 };
    }
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role, profile_picture_url, created_at')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
    
    return data;
  },
  
  async getUserProfile(userId: string) {
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
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
    
    return data;
  },
  
  async update(id: string, userData: Partial<SupabaseUser>) {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }
    
    return data;
  },
  
  async delete(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
    
    return true;
  },
  
  async changeRole(id: string, role: string) {
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error changing user role:', error);
      throw error;
    }
    
    return data;
  }
};

// Activity methods for social posts
export const supabaseActivities = {
  async getAll(limit = 20): Promise<ActivityResponse> {
    try {
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
        .limit(limit);
      
      if (error) {
        console.error('Error fetching activities:', error);
        throw error;
      }
      
      // Transform data for frontend consumption
      interface RawActivity {
        id: string;
        user_id: string;
        title: string;
        content: string;
        created_at: string;
        type?: string;
        image_url?: string;
        like_count?: number;
        comment_count?: number;
        user: {
          id: string; 
          first_name: string;
          last_name: string;
          email: string;
          role?: string;
          profile_picture_url?: string;
        } | null;
        comments: RawComment[];
      }
      
      interface TransformedActivity {
        [key: string]: unknown;
        user: {
          id: string;
          name: string;
          email: string;
          role?: string;
          profilePicture?: string;
        } | null;
        comments: {
          id: string;
          text: string;
          created_at: string;
          user: {
            id: string;
            name: string;
            profilePicture?: string;
          } | null;
        }[];
      }

      return {
        success: true,
        items: (data as RawActivity[]).map(activity => {
          const transformedActivity: TransformedActivity = {
            ...activity,
            user: activity.user ? {
              id: activity.user.id,
              name: `${activity.user.first_name} ${activity.user.last_name}`,
              email: activity.user.email,
              role: activity.user.role,
              profilePicture: activity.user.profile_picture_url
            } : null,
            comments: activity.comments ? activity.comments.map((comment: RawComment) => ({
              id: comment.id,
              text: comment.comment,
              created_at: comment.created_at,
              user: comment.user ? {
                id: comment.user.id,
                name: `${comment.user.first_name} ${comment.user.last_name}`,
                profilePicture: comment.user.profile_picture_url
              } : null
            })) : []
          };
          return transformedActivity as unknown as Activity;
        })
      };
    } catch (err) {
      console.error('Error in supabaseActivities.getAll():', err);
      return { success: false, items: [], error: err instanceof Error ? err.message : String(err) };
    }
  },
  
  async getUserActivities(userId: string): Promise<ActivityResponse> {
    try {
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
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user activities:', error);
        throw error;
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
          comments: activity.comments ? activity.comments.map((comment: RawComment) => ({
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
      };
    } catch (err) {
      console.error('Error in supabaseActivities.getUserActivities():', err);
      return { success: false, items: [], error: err instanceof Error ? err.message : String(err) };
    }
  },
  
  async createActivity(activityData: Partial<Activity>) {
    const { data, error } = await supabase
      .from('activities')
      .insert([activityData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
    
    return data;
  },
  
  async addComment(activityId: string, userId: string, comment: string) {
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
      throw error;
    }
    
    // Update comment count on the activity
    await this.incrementCommentCount(activityId);
    
    return data;
  },
  
  async incrementCommentCount(activityId: string) {
    const { error } = await supabase.rpc('increment_comment_count', {
      act_id: activityId
    });
    
    if (error) {
      console.error('Error incrementing comment count:', error);
      // Non-blocking, just log the error
    }
  },
  
  async likeActivity(activityId: string, userId: string) {
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
  
  async incrementLikeCount(activityId: string) {
    const { error } = await supabase.rpc('increment_like_count', {
      act_id: activityId
    });
    
    if (error) {
      console.error('Error incrementing like count:', error);
      // Non-blocking, just log the error
    }
  }
};

// Friends-related methods
export const supabaseFriends = {
  async getFriends(userId: string): Promise<FriendResponse> {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        friend_id,
        friend:friend_id (
          id, first_name, last_name, email, role, profile_picture_url
        )
      `)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching friends:', error);
      throw error;
    }
    
    // Transform data for frontend consumption
    return {
      success: true,
      items: (data as FriendData[]).map(friend => ({
        id: friend.friend_id,
        name: `${friend.friend.first_name} ${friend.friend.last_name}`,
        email: friend.friend.email,
        role: friend.friend.role,
        profilePicture: friend.friend.profile_picture_url
      }))
    };
  },
  
  async addFriend(userId: string, friendId: string) {
    // First check if friendship already exists
    const { data: existingFriend, error: checkError } = await supabase
      .from('friends')
      .select('id')
      .eq('user_id', userId)
      .eq('friend_id', friendId);
    
    if (checkError) {
      console.error('Error checking existing friendship:', checkError);
      throw checkError;
    }
    
    // If friendship already exists, return early
    if (existingFriend && existingFriend.length > 0) {
      return { success: true, alreadyFriends: true };
    }
    
    // Add new friendship
    const { error } = await supabase
      .from('friends')
      .insert([{ user_id: userId, friend_id: friendId }]);
    
    if (error) {
      console.error('Error adding friend:', error);
      throw error;
    }
    
    return { success: true };
  },
  
  async removeFriend(userId: string, friendId: string) {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('user_id', userId)
      .eq('friend_id', friendId);
    
    if (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
    
    return { success: true };
  },
  
  async getFriendActivities(userId: string, limit = 20): Promise<ActivityResponse> {
    try {
      // Get friend IDs
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', userId);
      
      if (friendsError) {
        console.error('Error fetching friend IDs:', friendsError);
        throw friendsError;
      }
      
      if (!friendsData || friendsData.length === 0) {
        return { success: true, items: [] };
      }
      
      const friendIds = friendsData.map(f => f.friend_id);
      
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
        .limit(limit);
      
      if (error) {
        console.error('Error fetching friend activities:', error);
        throw error;
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
          comments: activity.comments ? activity.comments.map((comment: RawComment) => ({
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
      };
    } catch (err) {
      console.error('Error in supabaseFriends.getFriendActivities():', err);
      return { success: false, items: [], error: err instanceof Error ? err.message : String(err) };
    }
  }
};

// Statistics methods
export const supabaseStats = {
  async getUserStatistics(userId: string) {
    console.log("Fetching user statistics for:", userId);
    try {
      // Use the RPC function from our SQL script
      const { data, error } = await supabase
        .rpc('get_user_statistics_with_periods', { user_id_param: userId });
      
      if (error) {
        console.error('Error fetching user statistics:', error);
        throw error;
      }
      
      // Transform data to match expected format or return default values
      return data || {
        user: {},
        today: { total_activities: 0, total_likes_received: 0, total_comments_received: 0 },
        week: { total_activities: 0, total_likes_received: 0, total_comments_received: 0 },
        month: { total_activities: 0, total_likes_received: 0, total_comments_received: 0 },
        all_time: { total_activities: 0, total_likes_received: 0, total_comments_received: 0, activity_type_counts: {} }
      };
    } catch (err) {
      console.error('Critical error fetching user statistics:', err);
      // Return fallback data
      return {
        user: {},
        today: { total_activities: 0, total_likes_received: 0, total_comments_received: 0 },
        week: { total_activities: 0, total_likes_received: 0, total_comments_received: 0 },
        month: { total_activities: 0, total_likes_received: 0, total_comments_received: 0 },
        all_time: { total_activities: 0, total_likes_received: 0, total_comments_received: 0, activity_type_counts: {} }
      };
    }
  },
  
  async getGlobalStatistics() {
    console.log("Fetching global statistics");
    try {
      // Use the RPC function from our SQL script
      const { data, error } = await supabase
        .rpc('get_global_statistics_with_periods');
      
      if (error) {
        console.error('Error fetching global statistics:', error);
        throw error;
      }
      
      console.log("Global stats received:", data);
      
      // Transform to expected format or return fallback data
      return data || {
        total_users: 0,
        periods: {
          today: { activities: 0, comments: 0, likes: 0 },
          week: { activities: 0, comments: 0, likes: 0 },
          month: { activities: 0, comments: 0, likes: 0 },
          all_time: { activities: 0, comments: 0, likes: 0 }
        },
        activity_type_distribution: {}
      };
    } catch (err) {
      console.error('Critical error fetching global statistics:', err);
      // Return fallback data
      return {
        total_users: 0,
        periods: {
          today: { activities: 0, comments: 0, likes: 0 },
          week: { activities: 0, comments: 0, likes: 0 },
          month: { activities: 0, comments: 0, likes: 0 },
          all_time: { activities: 0, comments: 0, likes: 0 }
        },
        activity_type_distribution: {}
      };
    }
  }
};

// Create enhanced client with stats methods attached
const enhancedSupabase = {
  ...supabase,
  getUserStatistics: function(userId: string) {
    return supabaseStats.getUserStatistics(userId);
  },
  getGlobalStatistics: function() {
    return supabaseStats.getGlobalStatistics();
  }
};

// Export the enhanced client as default
export default enhancedSupabase;
