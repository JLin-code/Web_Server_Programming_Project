// Define types for application data model

export interface User {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role?: string;
  profilePicture?: string;
  profile_picture_url?: string;
  created_at?: string;
}

export interface Activity {
  id: string;
  user_id: string;
  user?: User;
  title: string;
  description?: string;
  type: string;
  date?: string;
  created_at: string;
  likes?: number;
  comments?: unknown[] | number;
  image_url?: string;
}

export interface Comment {
  id: string;
  text: string;
  created_at: string;
  user?: User;
}

export interface Friend {
  id: string;
  name: string;
  email?: string;
  profilePicture?: string;
}

export interface StatisticsPeriod {
  total_activities: number;
  total_likes_received: number;
  total_comments_received: number;
  activity_type_counts?: Record<string, number>;
}

export interface UserStatistics {
  user: Partial<User>;
  today: StatisticsPeriod;
  week: StatisticsPeriod;
  month: StatisticsPeriod;
  all_time: StatisticsPeriod;
}

export interface GlobalStatistics {
  total_users: number;
  periods: {
    today: { activities: number, comments: number, likes: number };
    week: { activities: number, comments: number, likes: number };
    month: { activities: number, comments: number, likes: number };
    all_time: { activities: number, comments: number, likes: number };
  };
  activity_type_distribution: Record<string, number>;
}
