<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { authService } from '../services/api';
import { supabase } from '../services/supabase';

interface Activity {
  id: string;
  title: string;
  description?: string;
  type: string;
  date: string;
  duration?: number;
  distance?: number;
  calories?: number;
  created_at: string;
  user?: {
    id: string;
    name: string;
  };
  likes?: number;
  comments?: number;
  image_url?: string;
}

interface UserStatistics {
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
  };
}

// State management
const loading = ref(true);
const error = ref<string | null>(null);
const userStatistics = ref<UserStatistics | null>(null);
const recentWorkouts = ref<Activity[]>([]);
const userId = ref<string | null>(null);
const route = useRoute();

// Calculations for total metrics
const totalWorkoutTime = computed(() => {
  return recentWorkouts.value.reduce((total, workout) => {
    return total + (workout.duration || 0);
  }, 0);
});

const totalCaloriesBurned = computed(() => {
  return recentWorkouts.value.reduce((total, workout) => {
    return total + (workout.calories || 0);
  }, 0);
});

const totalDistance = computed(() => {
  return recentWorkouts.value.reduce((total, workout) => {
    return total + (workout.distance || 0);
  }, 0);
});

// Fetch workout statistics for the user
const fetchWorkoutStats = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Get current user if no userId is specified in the route
    if (!userId.value) {
      const response = await authService.getCurrentUser();
      if (response && response.user) {
        userId.value = response.user.id;
      } else {
        throw new Error('User not authenticated');
      }
    }
    
    // Use Supabase to fetch user statistics
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_user_statistics_with_periods', { 
        user_id_param: userId.value 
      });
    
    if (statsError) {
      console.error("Error fetching user statistics:", statsError);
      throw new Error(`Failed to fetch statistics: ${statsError.message}`);
    }
    
    // Use Supabase to fetch user activities
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select(`
        id, title, description, type, duration, distance, calories, created_at,
        user:user_id (id, first_name, last_name),
        comment_count, like_count, image_url
      `)
      .eq('user_id', userId.value)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (activitiesError) {
      console.error("Error fetching user activities:", activitiesError);
      throw new Error(`Failed to fetch activities: ${activitiesError.message}`);
    }
    
    // Process statistics data
    if (statsData) {
      userStatistics.value = {
        total_activities: statsData.total_activities || 0,
        total_comments: statsData.total_comments || 0,
        total_likes_received: statsData.total_likes_received || 0,
        activity_type_distribution: statsData.activity_type_distribution || {},
        periods: {
          last_week: statsData.periods?.week || { activities: 0, likes: 0 },
          last_month: statsData.periods?.month || { activities: 0, likes: 0 }
        }
      };
    } else {
      // Fallback data if Supabase query returns nothing
      userStatistics.value = {
        total_activities: 0,
        total_comments: 0,
        total_likes_received: 0,
        activity_type_distribution: {},
        periods: {
          last_week: { activities: 0, likes: 0 },
          last_month: { activities: 0, likes: 0 }
        }
      };
    }
    
    // Process activities data
    if (activitiesData && activitiesData.length > 0) {
      recentWorkouts.value = activitiesData.map(activity => ({
        id: activity.id,
        title: activity.title || `Workout on ${new Date(activity.created_at).toLocaleDateString()}`,
        description: activity.description,
        type: activity.type || 'workout',
        duration: activity.duration,
        distance: activity.distance,
        calories: activity.calories,
        date: new Date(activity.created_at).toLocaleDateString(),
        created_at: activity.created_at,
        user: activity.user ? {
          id: activity.user.id,
          name: `${activity.user.first_name} ${activity.user.last_name}`
        } : null,
        likes: activity.like_count || 0,
        comments: activity.comment_count || 0,
        image_url: activity.image_url
      }));
    } else {
      recentWorkouts.value = [];
    }
    
    console.log('Workout stats loaded successfully', {
      stats: userStatistics.value,
      workouts: recentWorkouts.value.length
    });
  } catch (err) {
    console.error('Failed to load workout statistics:', err);
    error.value = err instanceof Error ? err.message : 'Unable to load workout statistics. Please try again later.';
    
    // Set fallback data in case of error
    if (!userStatistics.value) {
      userStatistics.value = {
        total_activities: 0,
        total_comments: 0,
        total_likes_received: 0,
        activity_type_distribution: {},
        periods: {
          last_week: { activities: 0, likes: 0 },
          last_month: { activities: 0, likes: 0 }
        }
      };
    }
  } finally {
    loading.value = false;
  }
};

// Calculate workout distribution by type
const workoutDistribution = computed(() => {
  if (!userStatistics.value?.activity_type_distribution) return {};
  
  return userStatistics.value.activity_type_distribution;
});

// Format duration in minutes to hours and minutes
const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

// Get icon for workout type
const getWorkoutIcon = (type: string) => {
  const icons: Record<string, string> = {
    running: '🏃',
    cycling: '🚴',
    swimming: '🏊',
    yoga: '🧘',
    strength: '💪',
    cardio: '❤️',
    basketball: '🏀',
    tennis: '🎾',
    pilates: '🤸',
    hiking: '🥾',
    dance: '💃'
  };
  return icons[type.toLowerCase()] || '🏋️';
};

onMounted(() => {
  // Check if there's a user ID in the route params
  const routeUserId = route.params.userId as string;
  if (routeUserId) {
    userId.value = routeUserId;
  }
  
  fetchWorkoutStats();
});
</script>

<template>
  <div class="workout-stats-page">
    <h1 class="page-title">Workout Statistics</h1>
    
    <div v-if="loading" class="loading-container">
      <p>Loading workout statistics...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
    </div>
    
    <div v-else class="stats-container">
      <!-- Workout Summary Section -->
      <section class="summary-section">
        <h2 class="section-title">Workout Summary</h2>
        
        <div class="summary-stats">
          <div class="stat-card">
            <div class="stat-title">Total Workouts</div>
            <div class="stat-value">{{ userStatistics?.total_activities || 0 }}</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-title">Total Time</div>
            <div class="stat-value">{{ formatDuration(totalWorkoutTime) }}</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-title">Calories Burned</div>
            <div class="stat-value">{{ totalCaloriesBurned.toLocaleString() }} cal</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-title">Distance</div>
            <div class="stat-value">{{ totalDistance.toFixed(1) }} km</div>
          </div>
        </div>
      </section>
      
      <!-- Workout Types Distribution -->
      <section class="workout-types-section">
        <h2 class="section-title">Workout Types</h2>
        
        <div class="workout-types-grid">
          <div v-for="(count, type) in workoutDistribution" :key="type" class="workout-type-card">
            <div class="workout-type-icon">{{ getWorkoutIcon(type) }}</div>
            <div class="workout-type-name">{{ type.charAt(0).toUpperCase() + type.slice(1) }}</div>
            <div class="workout-type-count">{{ count }}</div>
          </div>
        </div>
      </section>
      
      <!-- Recent Workouts -->
      <section class="recent-workouts-section">
        <h2 class="section-title">Recent Workouts</h2>
        
        <div v-if="recentWorkouts.length === 0" class="empty-state">
          <p>No recent workouts found</p>
        </div>
        
        <div v-else class="recent-workouts-list">
          <div v-for="workout in recentWorkouts" :key="workout.id" class="workout-card">
            <div class="workout-header">
              <div class="workout-type">{{ getWorkoutIcon(workout.type) }} {{ workout.type }}</div>
              <div class="workout-date">{{ new Date(workout.created_at).toLocaleDateString() }}</div>
            </div>
            
            <h3 class="workout-title">{{ workout.title }}</h3>
            <p class="workout-description">{{ workout.description || 'No description provided' }}</p>
            
            <div class="workout-metrics">
              <div class="metric" v-if="workout.duration">
                <span class="metric-label">Duration:</span>
                <span class="metric-value">{{ formatDuration(workout.duration) }}</span>
              </div>
              
              <div class="metric" v-if="workout.distance">
                <span class="metric-label">Distance:</span>
                <span class="metric-value">{{ workout.distance }} km</span>
              </div>
              
              <div class="metric" v-if="workout.calories">
                <span class="metric-label">Calories:</span>
                <span class="metric-value">{{ workout.calories }} cal</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.workout-stats-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.page-title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  color: var(--text-primary);
}

.loading-container,
.error-container {
  text-align: center;
  padding: 2rem;
  background-color: var(--dark-secondary);
  border-radius: 8px;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.summary-section,
.workout-types-section,
.recent-workouts-section {
  margin-bottom: 3rem;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background-color: var(--dark-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-title {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--highlight);
}

.workout-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.workout-type-card {
  background-color: var(--dark-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  transition: transform 0.2s ease;
}

.workout-type-card:hover {
  transform: translateY(-4px);
}

.workout-type-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.workout-type-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.workout-type-count {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--highlight);
}

.recent-workouts-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.workout-card {
  background-color: var(--dark-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.workout-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.workout-type {
  font-weight: 600;
  color: var(--highlight);
}

.workout-date {
  color: var(--text-secondary);
}

.workout-title {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.workout-description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.workout-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
}

.metric {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.metric-value {
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  background-color: var(--dark-secondary);
  border-radius: 8px;
  color: var(--text-secondary);
}
</style>
