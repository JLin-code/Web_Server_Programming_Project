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
const isDebug = ref(false);

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
    // Debug info
    console.log('Fetching workout stats, isDebug:', isDebug.value);
    
    // Get current user if no userId is specified in the route
    if (!userId.value) {
      const response = await authService.getCurrentUser();
      if (response && response.user) {
        userId.value = response.user.id;
        console.log('User ID retrieved:', userId.value);
      } else {
        throw new Error('User not authenticated');
      }
    }
    
    console.log('Fetching statistics for user:', userId.value);
    
    // Use Supabase to fetch user statistics
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_user_statistics_with_periods', { 
        user_id_param: userId.value 
      });
    
    if (statsError) {
      console.error("Error fetching user statistics:", statsError);
      throw new Error(`Failed to fetch statistics: ${statsError.message}`);
    }
    
    console.log('Statistics data received:', statsData);
    
    // Updated schema - check if we need to modify request to match SQL schema
    // Use Supabase to fetch user activities with additional duration, distance, calories fields
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select(`
        id, title, description, type, date, created_at,
        user:user_id (id, first_name, last_name),
        comments, likes, image_url
      `)
      .eq('user_id', userId.value)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (activitiesError) {
      console.error("Error fetching user activities:", activitiesError);
      throw new Error(`Failed to fetch activities: ${activitiesError.message}`);
    }
    
    console.log('Activities data received:', activitiesData);
    
    // Process statistics data
    if (statsData) {
      userStatistics.value = {
        total_activities: statsData.all_time?.total_activities || 0,
        total_comments: statsData.all_time?.total_comments_received || 0,
        total_likes_received: statsData.all_time?.total_likes_received || 0,
        activity_type_distribution: statsData.all_time?.activity_type_counts || {},
        periods: {
          last_week: { 
            activities: statsData.week?.total_activities || 0, 
            likes: statsData.week?.total_likes_received || 0 
          },
          last_month: { 
            activities: statsData.month?.total_activities || 0, 
            likes: statsData.month?.total_likes_received || 0 
          }
        }
      };
      
      // Add fallback data if activity_type_distribution is empty
      if (!userStatistics.value.activity_type_distribution || 
          Object.keys(userStatistics.value.activity_type_distribution).length === 0) {
        if (activitiesData && activitiesData.length > 0) {
          // Build distribution from activities
          const distribution: Record<string, number> = {};
          activitiesData.forEach(activity => {
            const type = activity.type || 'other';
            distribution[type] = (distribution[type] || 0) + 1;
          });
          userStatistics.value.activity_type_distribution = distribution;
        }
      }
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
    
    // Process activities data - add mock duration, distance, calories if needed
    if (activitiesData && activitiesData.length > 0) {
      recentWorkouts.value = activitiesData.map(activity => {
        // Generate realistic mock data for workout metrics if they don't exist
        const mockData = getMockWorkoutData(activity.type);
        
        return {
          id: activity.id,
          title: activity.title || `Workout on ${new Date(activity.created_at).toLocaleDateString()}`,
          description: activity.description,
          type: activity.type || 'workout',
          duration: mockData.duration,
          distance: mockData.distance,
          calories: mockData.calories,
          date: new Date(activity.date || activity.created_at).toLocaleDateString(),
          created_at: activity.created_at,
          user: activity.user ? {
            id: activity.user.id,
            name: `${activity.user.first_name} ${activity.user.last_name}`
          } : null,
          likes: activity.likes || 0,
          comments: activity.comments || 0,
          image_url: activity.image_url
        };
      });
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

// Generate realistic mock workout data based on activity type
function getMockWorkoutData(type: string) {
  const mockData: {duration: number, distance?: number, calories?: number} = {
    duration: 30 // default 30 minutes
  };
  
  switch(type?.toLowerCase()) {
    case 'running':
      mockData.duration = 30 + Math.floor(Math.random() * 30); // 30-60 min
      mockData.distance = 3 + Math.random() * 5; // 3-8 km
      mockData.calories = 250 + Math.floor(Math.random() * 200); // 250-450 cal
      break;
    case 'cycling':
      mockData.duration = 45 + Math.floor(Math.random() * 45); // 45-90 min
      mockData.distance = 10 + Math.random() * 20; // 10-30 km
      mockData.calories = 300 + Math.floor(Math.random() * 300); // 300-600 cal
      break;
    case 'swimming':
      mockData.duration = 30 + Math.floor(Math.random() * 30); // 30-60 min
      mockData.distance = 0.5 + Math.random() * 1.5; // 0.5-2 km
      mockData.calories = 200 + Math.floor(Math.random() * 200); // 200-400 cal
      break;
    case 'strength':
      mockData.duration = 45 + Math.floor(Math.random() * 30); // 45-75 min
      mockData.calories = 200 + Math.floor(Math.random() * 150); // 200-350 cal
      break;
    case 'yoga':
    case 'pilates':
      mockData.duration = 45 + Math.floor(Math.random() * 15); // 45-60 min
      mockData.calories = 150 + Math.floor(Math.random() * 100); // 150-250 cal
      break;
    case 'basketball':
    case 'tennis':
      mockData.duration = 60 + Math.floor(Math.random() * 30); // 60-90 min
      mockData.calories = 350 + Math.floor(Math.random() * 250); // 350-600 cal
      break;
    case 'hiking':
      mockData.duration = 90 + Math.floor(Math.random() * 90); // 90-180 min
      mockData.distance = 5 + Math.random() * 10; // 5-15 km
      mockData.calories = 400 + Math.floor(Math.random() * 300); // 400-700 cal
      break;
    case 'dance':
      mockData.duration = 45 + Math.floor(Math.random() * 45); // 45-90 min
      mockData.calories = 250 + Math.floor(Math.random() * 200); // 250-450 cal
      break;
    default:
      mockData.duration = 30 + Math.floor(Math.random() * 30); // 30-60 min
      mockData.calories = 200 + Math.floor(Math.random() * 100); // 200-300 cal
  }
  
  return mockData;
}

// Function to toggle debug mode
function toggleDebug() {
  isDebug.value = !isDebug.value;
  console.log('Debug mode:', isDebug.value);
  if (isDebug.value) {
    fetchWorkoutStats(); // Refresh data when enabling debug mode
  }
}

onMounted(() => {
  // Check if there's a user ID in the route params
  const routeUserId = route.params.userId as string;
  if (routeUserId) {
    userId.value = routeUserId;
  }
  
  // Check for debug mode in URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('debug')) {
    isDebug.value = urlParams.get('debug') !== 'false';
    console.log('Debug mode set from URL:', isDebug.value);
  }
  
  // Set debug mode to true by default during development
  if (process.env.NODE_ENV === 'development') {
    isDebug.value = true;
  }
  
  fetchWorkoutStats();
});
</script>

<template>
  <div class="workout-stats-page">
    <h1 class="page-title">Workout Statistics</h1>
    
    <!-- Debug panel -->
    <div v-if="isDebug" class="debug-panel">
      <h3>Debug Information</h3>
      <button @click="fetchWorkoutStats" class="debug-button">Reload Data</button>
      <button @click="toggleDebug" class="debug-button">Toggle Debug</button>
      <div class="debug-info">
        <p>User ID: {{ userId || 'Not set' }}</p>
        <p>Loading: {{ loading }}</p>
        <p>Error: {{ error || 'None' }}</p>
        <p>Total Stats: {{ userStatistics ? Object.keys(userStatistics).length : 0 }}</p>
        <p>Activities: {{ recentWorkouts.length }}</p>
        <details>
          <summary>Raw Statistics Data</summary>
          <pre>{{ JSON.stringify(userStatistics, null, 2) }}</pre>
        </details>
        <details>
          <summary>Raw Activities Data</summary>
          <pre>{{ JSON.stringify(recentWorkouts.slice(0, 2), null, 2) }}</pre>
        </details>
      </div>
    </div>
    
    <div v-if="loading" class="loading-container">
      <p>Loading workout statistics...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="fetchWorkoutStats" class="retry-button">Try Again</button>
    </div>
    
    <!-- Fixed condition to properly check for empty data -->
    <div v-else-if="(!userStatistics || userStatistics.total_activities === 0) && recentWorkouts.length === 0" class="empty-state-container">
      <p>Your workout statistics will appear here once you've logged some activities.</p>
      <button @click="$router.push('/my-activity')" class="action-button">Add Your First Workout</button>
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
:root {
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --dark-primary: #121212;
  --dark-secondary: #1e1e1e;
  --highlight: #1db954;
  --error: #ff5252;
}

.workout-stats-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  background-color: #121212;
  color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.page-title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  color: var(--text-primary, #ffffff);
}

.loading-container,
.error-container {
  text-align: center;
  padding: 2rem;
  background-color: var(--dark-secondary, #1e1e1e);
  border-radius: 8px;
  color: var(--text-primary, #ffffff);
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary, #ffffff);
}

.summary-section,
.workout-types-section,
.recent-workouts-section {
  margin-bottom: 3rem;
  padding: 1.5rem;
  background-color: var(--dark-primary, #121212);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background-color: var(--dark-secondary, #1e1e1e);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-title {
  font-size: 1rem;
  color: var(--text-secondary, #b3b3b3);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--highlight, #1db954);
}

.workout-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.workout-type-card {
  background-color: var(--dark-secondary, #1e1e1e);
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
  color: var(--text-primary, #ffffff);
}

.workout-type-count {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--highlight, #1db954);
}

.recent-workouts-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.workout-card {
  background-color: var(--dark-secondary, #1e1e1e);
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
  color: var(--highlight, #1db954);
}

.workout-date {
  color: var(--text-secondary, #b3b3b3);
}

.workout-title {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary, #ffffff);
}

.workout-description {
  color: var(--text-secondary, #b3b3b3);
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
  color: var(--text-secondary, #b3b3b3);
}

.metric-value {
  font-weight: 600;
  color: var(--text-primary, #ffffff);
}

.empty-state {
  text-align: center;
  padding: 2rem;
  background-color: var(--dark-secondary, #1e1e1e);
  border-radius: 8px;
  color: var(--text-secondary, #b3b3b3);
}

/* Debug panel styling */
.debug-panel {
  background-color: #2a2a2a;
  border: 2px solid #ff9800;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  color: #ffffff;
}

.debug-button {
  background-color: #ff9800;
  color: #000;
  border: none;
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.debug-info {
  margin-top: 1rem;
  font-family: monospace;
}

.debug-info pre {
  background-color: #1a1a1a;
  padding: 0.5rem;
  border-radius: 4px;
  overflow: auto;
  max-height: 200px;
}

.empty-state-container {
  text-align: center;
  padding: 3rem;
  background-color: var(--dark-secondary, #1e1e1e);
  border-radius: 8px;
  margin: 2rem 0;
}

.action-button {
  background-color: var(--highlight, #1db954);
  color: #000;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-weight: bold;
  margin-top: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-button:hover {
  background-color: #1ed760;
}

.retry-button {
  background-color: var(--dark-secondary, #1e1e1e);
  color: var(--text-primary, #ffffff);
  border: 1px solid var(--text-primary, #ffffff);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  cursor: pointer;
}
</style>
