// Define types for application data model

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role?: string;
  profile_picture_url?: string;
  created_at?: string;
  last_sign_in?: string;
}

export interface UserDisplay {
  id: string;
  name: string;
  email: string;
  role?: string;
  profilePicture?: string;
}

export interface Activity {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: string;
  date: string;
  image_url?: string;
  likes: number;
  comments: number;
  created_at: string;
  updated_at?: string;
  // Populated fields
  user?: UserDisplay;
  commentsList?: Comment[];
}

export interface Comment {
  id: string;
  activity_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  // Populated fields
  user?: UserDisplay;
}

export interface Like {
  id: string;
  activity_id: string;
  user_id: string;
  created_at: string;
}

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  // Populated fields
  friend?: UserDisplay;
}

export interface Statistics {
  total_users?: number;
  total_activities?: number;
  total_comments?: number;
  total_likes?: number;
  most_popular_activity_type?: string;
  activity_type_distribution?: Record<string, number>;
  average_likes_per_activity?: number;
  average_comments_per_activity?: number;
  most_active_user?: {
    id: string;
    name: string;
    count: number;
  };
}

export interface Period {
  activities: number;
  comments: number;
  likes: number;
}

export interface PeriodStatistics {
  today: Period;
  week: Period;
  month: Period;
  all_time: Period;
}
