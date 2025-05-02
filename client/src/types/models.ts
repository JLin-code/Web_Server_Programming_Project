// User model
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  created_at?: string;
}

// Activity model
export interface Activity {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: string;
  metrics: Record<string, number | string | boolean>;
  likes: number;
  comments: number;
  image?: string;
  created_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role?: string;
    avatar?: string; // Added avatar property to fix TypeScript error
  };
  comments_list?: ActivityComment[];
}

// Comment model
export interface ActivityComment {
  id: string;
  activity_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  user?: {
    id: string;
    name: string;
  };
}

// Friend model
export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status?: string;
  created_at?: string;
  friend?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
}

// Like model
export interface ActivityLike {
  id: string;
  activity_id: string;
  user_id: string;
  created_at?: string;
}

// API response interfaces
export interface ApiResponse<T> {
  success: boolean;
  items?: T[];
  item?: T;
  message?: string;
  error?: string;
  count?: number;
  total?: number;
}
