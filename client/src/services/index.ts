// Re-export services from a central location for easier imports
export { authService, userService } from './api';
export { default as api } from './api';
export { friendsService } from './friendsApi';
export { activitiesService } from './activitiesApi';
export { supabase, supabaseUsers, supabaseActivities, supabaseFriends, supabaseStats } from './supabase';
