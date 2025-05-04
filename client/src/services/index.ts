// Import both real Supabase services and mock services for fallback
import { userService as mockUserService, activitiesService as mockActivitiesService, friendsService as mockFriendsService, statsService as mockStatsService } from './mockApi';
import { supabaseUsers, supabaseActivities, supabaseFriends, supabaseStats } from './supabase';

// Always attempt to use real Supabase data first, fall back to mock if needed
export const userService = supabaseUsers || mockUserService;
export const activitiesService = supabaseActivities || mockActivitiesService;
export const friendsService = supabaseFriends || mockFriendsService;
export const statsService = supabaseStats || mockStatsService;

export { default as api } from './api';

// Create enhanced Supabase for backward compatibility
const enhancedSupabaseClient = {
  getUserStatistics: statsService.getUserStatistics,
  getGlobalStatistics: statsService.getGlobalStatistics
};

// Export for compatibility with existing code
export const supabase = enhancedSupabaseClient;
export const enhancedSupabase = enhancedSupabaseClient;
export const supabaseUsersService = userService;
export default enhancedSupabaseClient;
