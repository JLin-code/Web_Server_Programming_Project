import { supabase } from '../services'; // Updated to use consolidated services
import { ref } from 'vue';

/**
 * Helper function to load data from Supabase with reactive state management
 * @param {Function} fetchFunction - Function that returns a Supabase query promise
 * @param {Object} options - Configuration options
 * @returns {Object} Reactive state and load function
 */
export function useSupabaseData(fetchFunction, options = {}) {
  const data = ref(options.initialData || null);
  const loading = ref(false);
  const error = ref(null);

  const load = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await fetchFunction();
      data.value = options.transformData ? options.transformData(result) : result;
    } catch (err) {
      console.error('Supabase data loading error:', err);
      error.value = err;
      
      // Use fallback data if provided
      if (options.fallbackData) {
        data.value = options.fallbackData;
      }
    } finally {
      loading.value = false;
    }
  };

  // Load immediately if requested
  if (options.loadImmediately !== false) {
    load();
  }

  return { data, loading, error, load };
}

/**
 * Helper function to fetch user profile data
 * @param {String} userId - User ID to fetch
 * @returns {Object} Reactive state and load function
 */
export function useUserProfile(userId) {
  return useSupabaseData(
    () => supabase.from('users')
      .select('id, first_name, last_name, email, role, profile_picture_url, created_at')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (error) throw error;
        return data;
      }),
    {
      fallbackData: { 
        id: userId,
        first_name: 'Unknown',
        last_name: 'User',
        profile_picture_url: null
      }
    }
  );
}

/**
 * Helper function to fetch activities data
 * @param {Number} limit - Maximum number of activities to fetch
 * @returns {Object} Reactive state and load function
 */
export function useActivities(limit = 20) {
  return useSupabaseData(
    () => supabase.from('activities')
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
      .then(({ data, error }) => {
        if (error) throw error;
        
        // Transform data for frontend consumption
        return data.map(activity => ({
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
        }));
      }),
    {
      fallbackData: []
    }
  );
}

/**
 * Helper function to fetch user-specific activities
 * @param {String} userId - User ID to fetch activities for
 * @returns {Object} Reactive state and load function
 */
export function useUserActivities(userId) {
  return useSupabaseData(
    () => supabase.from('activities')
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
      .then(({ data, error }) => {
        if (error) throw error;
        
        // Transform data for frontend consumption
        return data.map(activity => ({
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
        }));
      }),
    {
      fallbackData: []
    }
  );
}

/**
 * Helper function to fetch user statistics
 * @param {String} userId - User ID to fetch statistics for
 * @returns {Object} Reactive state and load function
 */
export function useUserStatistics(userId) {
  return useSupabaseData(
    () => supabase.rpc('get_user_statistics_with_periods', { user_id_param: userId })
      .then(({ data, error }) => {
        if (error) throw error;
        return data;
      }),
    {
      fallbackData: {
        total_activities: 0,
        total_comments: 0,
        total_likes_received: 0,
        activity_type_distribution: {},
        periods: {}
      }
    }
  );
}

/**
 * Helper function to fetch global statistics
 * @returns {Object} Reactive state and load function
 */
export function useGlobalStatistics() {
  return useSupabaseData(
    () => supabase.rpc('get_global_statistics_with_periods')
      .then(({ data, error }) => {
        if (error) throw error;
        return data;
      }),
    {
      fallbackData: {
        total_users: 0,
        total_activities: 0,
        total_comments: 0,
        activity_type_distribution: {},
        periods: { all_time: { likes: 0 } }
      }
    }
  );
}
