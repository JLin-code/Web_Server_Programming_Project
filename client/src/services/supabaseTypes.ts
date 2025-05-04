import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Type definition for global statistics returned from Supabase
 */
export interface GlobalStatistics {
  total_users: number;
  total_activities: number;
  total_comments: number;
  periods?: {
    all_time?: {
      likes: number;
    }
  };
  activity_type_distribution: Record<string, number>;
}

/**
 * Type definition for user statistics returned from Supabase
 */
export interface UserStatistics {
  total_activities: number;
  total_comments: number;
  total_likes_received: number;
  activity_type_distribution: Record<string, number>;
  periods?: {
    last_week?: {
      activities: number;
      likes: number;
    };
    last_month?: {
      activities: number;
      likes: number;
    };
  }
}

/**
 * Type definition for enhanced Supabase client with statistics methods
 */
export interface EnhancedSupabaseClient extends SupabaseClient {
  getGlobalStatistics(): Promise<GlobalStatistics>;
  getUserStatistics(userId: string): Promise<UserStatistics>;
}

/**
 * Type definition for Supabase stats service
 */
export interface SupabaseStatsService {
  getGlobalStatistics(): Promise<GlobalStatistics>;
  getUserStatistics(userId: string): Promise<UserStatistics>;
}

/**
 * Type definition for Supabase users service
 */
export interface SupabaseUsersService {
  getAll(): Promise<{ items: unknown[], total: number }>;
  getById(id: string): Promise<User | null>;
  getUserProfile(userId: string): Promise<UserProfile>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  profilePicture?: string;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role?: string;
  profile_picture_url?: string;
  created_at?: string;
}

/**
 * Activity comment representation
 */
export interface ActivityComment {
  id: string;
  activity_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  user?: User;
}

/**
 * Activity data representation
 */
export interface Activity {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: string;
  date: string;
  duration?: number;
  distance?: number;
  calories?: number;
  image_url?: string;
  likes: number;
  comments: number;
  created_at: string;
  user?: User;
  comments_list?: ActivityComment[];
}

/**
 * Data for creating a new activity
 */
export interface ActivityData {
  user_id: string;
  title: string;
  description?: string;
  type: string;
  date?: string;
  duration?: number;
  distance?: number;
  calories?: number;
  image_url?: string;
}

/**
 * Type definition for Supabase activities service
 */
export interface SupabaseActivitiesService {
  getAll(limit?: number): Promise<{ success: boolean, items: Activity[] }>;
  getUserActivities(userId: string): Promise<{ success: boolean, items: Activity[] }>;
  createActivity(activityData: ActivityData): Promise<Activity>;
  addComment(activityId: string, userId: string, comment: string): Promise<ActivityComment>;
  incrementCommentCount(activityId: string): Promise<void>;
  likeActivity(activityId: string, userId: string): Promise<{ success: boolean }>;
  incrementLikeCount(activityId: string): Promise<void>;
}
