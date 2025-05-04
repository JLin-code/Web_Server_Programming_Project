

// Extend the SupabaseClient type with our custom methods
declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    getGlobalStatistics(): Promise<{
      total_users: number;
      total_activities: number;
      total_comments: number;
      periods: {
        all_time?: {
          likes: number;
        }
      };
      activity_type_distribution: Record<string, number>;
    }>;
  }
}
