<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { authService } from '../services/api';
import { supabase } from '../services/supabase';
import { mockDataService } from '../services/mockDataService';

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
    profilePicture?: string;
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
const currentUser = ref(null);
const showingSampleData = ref(false);

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

// Calculate workout type distribution from recent workouts
const workoutDistribution = computed(() => {
  const distribution: Record<string, number> = {};
  
  recentWorkouts.value.forEach(workout => {
    const type = workout.type?.toLowerCase() || 'other';
    distribution[type] = (distribution[type] || 0) + 1;
  });
  
  return distribution;
});

// Format duration from minutes to hours and minutes
function formatDuration(minutes: number): string {
  if (!minutes || isNaN(minutes)) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  } else {
    return `${mins}m`;
  }
}

// Get appropriate icon for workout type
function getWorkoutIcon(type: string): string {
  const typeMap: Record<string, string> = {
    'running': '🏃',
    'cycling': '🚴',
    'swimming': '🏊',
    'strength': '💪',
    'yoga': '🧘',
    'pilates': '🤸',
    'basketball': '🏀',
    'tennis': '🎾',
    'hiking': '🥾',
    'dance': '💃',
    'cardio': '❤️',
    'workout': '🏋️',
    'other': '🏅'
  };
  
  return typeMap[type?.toLowerCase()] || '🏅';
}

// Fetch user activities with proper error handling and fallback
const fetchUserActivities = async () => {
  loading.value = true;
  error.value = null;
  
  if (!currentUser.value?.id) {
    console.warn('No user ID available to fetch activities');
    await fetchSampleActivities();
    return;
  }

  try {
    console.log(`Fetching activities for user ${currentUser.value.id}`);
    
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')= new Promise((_, reject) => {
      .select(`t(() => reject(new Error('Request timed out')), 5000);
        *,
        user:user_id (
          id, first_name, last_name, email, role, profile_picture_url
        ),m('activities')
        comments:activity_comments (
          id, user_id, comment, created_at,
          user:user_id (
            id, first_name, last_name, profile_picture_urlpicture_url
          )
        )omments:activity_comments (
      `)  id, user_id, comment, created_at,
      .eq('user_id', currentUser.value.id)
      .order('created_at', { ascending: false });cture_url
          )
    if (activitiesError || !activitiesData || activitiesData.length === 0) {
      console.warn("No activities found or error fetching activities:", activitiesError);
      await fetchSampleActivities();ue.id)
      return;'created_at', { ascending: false });
    }
    // Race between timeout and actual fetch
    console.log(`Found ${activitiesData.length} user activities`);
    processActivities(activitiesData);
  } catch (err) {ise.then(() => ({ data: null, error: new Error('Request timed out') }))
    console.error('Failed to load user activities:', err);
    await fetchSampleActivities();
  } finally {ata: activitiesData, error: activitiesError } = result;
    loading.value = false;
  } if (activitiesError || !activitiesData || activitiesData.length === 0) {
};    console.warn("No activities found or error fetching activities:", activitiesError);
      await fetchSampleActivities();
// Fallback: Use sample mock activities filtered to only show "my" activities
const fetchSampleActivities = async () => {
  showingSampleData.value = true;
  console.log("Loading sample activities (API is unavailable)"););
    processActivities(activitiesData);
  try {ch (err) {
    let allMockActivities = mockDataService.getDefaultActivities();
    await fetchSampleActivities();
    // If no mock activities are returned or the function doesn't exist
    if (!allMockActivities || !Array.isArray(allMockActivities) || allMockActivities.length === 0) {
      console.log("Creating fallback mock activities");
      
      // Generate some mock activities
      allMockActivities = [k activities filtered to only show "my" activities
        {chSampleActivities = async () => {
          id: 'mock-001', = true;
          title: 'Morning Run',ctivities (API is unavailable)");
          description: 'Quick 5K run around the park',
          type: 'running',
          created_at: new Date().toISOString(),DefaultActivities();
          image_url: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600',
          likes: 5,ctivities are returned or the function doesn't exist
          comments: 2,ties || !Array.isArray(allMockActivities) || allMockActivities.length === 0) {
          user: {("Creating fallback mock activities");
            id: 'mock-user-001',
            name: 'Demo User',tivities
            profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg'
          }
        },id: 'mock-001',
        { title: 'Morning Run',
          id: 'mock-002',uick 5K run around the park',
          title: 'Gym Workout',
          description: 'Leg day at the gym',(),
          type: 'strength',://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600',
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',
          likes: 3,
          comments: 1,user-001',
          user: { 'Demo User',
            id: 'mock-user-001',ps://randomuser.me/api/portraits/men/3.jpg'
            name: 'Demo User',
            profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg'
          }
        },id: 'mock-002',
        { title: 'Gym Workout',
          id: 'mock-003',eg day at the gym',
          title: 'Yoga Class',
          description: 'Relaxing yoga session',00000).toISOString(), // 1 day ago
          type: 'yoga',ttps://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          image_url: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600',
          likes: 7,
          comments: 3,user-001',
          user: { 'Demo User',
            id: 'mock-user-001',ps://randomuser.me/api/portraits/men/3.jpg'
            name: 'Demo User',
            profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg'
          }
        } id: 'mock-003',
      ];  title: 'Yoga Class',
    }     description: 'Relaxing yoga session',
          type: 'yoga',
    // Filter to only show activities from the current user or the default mock user
    const mockUserId = currentUser.value?.id || 'mock-user-001';14086-f385e2e2ad1b?w=600',
    const filteredActivities = allMockActivities.filter(activity => {
      return activity.user && (activity.user.id === mockUserId || activity.user.id === 'mock-user-001');
    });   user: {
            id: 'mock-user-001',
    processActivities(filteredActivities);
    console.log(`Loaded ${filteredActivities.length} sample activities`);g'
  } catch (err) {
    console.error('Error creating sample activities:', err);
    recentWorkouts.value = [];
    error.value = 'Unable to load activities. Please try again later.';
  } finally {
    loading.value = false; activities from the current user or the default mock user
  } const mockUserId = currentUser.value?.id || 'mock-user-001';
};  const filteredActivities = allMockActivities.filter(activity => {
      return activity.user && (activity.user.id === mockUserId || activity.user.id === 'mock-user-001');
// Process activities data into the correct format
const processActivities = (activitiesData) => {
  if (!activitiesData || !Array.isArray(activitiesData)) {
    console.error("Invalid activities data:", activitiesData);tivities`);
    recentWorkouts.value = [];
    return;.error('Error creating sample activities:', err);
  } recentWorkouts.value = [];
    error.value = 'Unable to load activities. Please try again later.';
  console.log(`Processing ${activitiesData.length} activities`);
    loading.value = false;
  // Calculate statistics
  const activityTypeDistribution: Record<string, number> = {};
  let totalLikes = 0;
  let totalComments = 0;ta into the correct format
  nst processActivities = (activitiesData) => {
  activitiesData.forEach(activity => {y(activitiesData)) {
    // Count activity typesactivities data:", activitiesData);
    const type = (activity.type || 'other').toLowerCase();
    activityTypeDistribution[type] = (activityTypeDistribution[type] || 0) + 1;
    
    // Sum likes and comments
    totalLikes += activity.likes || 0;Data.length} activities`);
    totalComments += Array.isArray(activity.comments) ? activity.comments.length : (activity.comments || 0);
  });Calculate statistics
  const activityTypeDistribution: Record<string, number> = {};
  // Update user statistics
  userStatistics.value = {
    total_activities: activitiesData.length,
    total_comments: totalComments,=> {
    total_likes_received: totalLikes,
    activity_type_distribution: activityTypeDistribution);
  };activityTypeDistribution[type] = (activityTypeDistribution[type] || 0) + 1;
    
  // Transform activities for display
  recentWorkouts.value = activitiesData.map(activity => {
    // Generate realistic mock data for workout metrics if they don't existength : (activity.comments || 0);
    const mockData = getMockWorkoutData(activity.type);
    
    return {user statistics
      id: activity.id, = {
      title: activity.title || `Workout on ${new Date(activity.created_at).toLocaleDateString()}`,
      description: activity.description,
      type: activity.type || 'workout',
      duration: activity.duration || mockData.duration,n
      distance: activity.distance || mockData.distance,
      calories: activity.calories || mockData.calories,
      date: new Date(activity.date || activity.created_at).toLocaleDateString(),
      created_at: activity.created_at,a.map(activity => {
      user: activity.user ? {k data for workout metrics if they don't exist
        id: activity.user.id,orkoutData(activity.type);
        name: activity.user.name || `${activity.user.first_name || ''} ${activity.user.last_name || ''}`.trim(),
        profilePicture: activity.user.profilePicture || activity.user.profile_picture_url
      } : null,ity.id,
      likes: activity.likes || 0,orkout on ${new Date(activity.created_at).toLocaleDateString()}`,
      comments: Array.isArray(activity.comments) ? activity.comments.length : (activity.comments || 0),
      image_url: activity.image_urlut',
    };duration: activity.duration || mockData.duration,
  }); distance: activity.distance || mockData.distance,
      calories: activity.calories || mockData.calories,
  console.log("Processed activities:", recentWorkouts.value);LocaleDateString(),
};    created_at: activity.created_at,
      user: activity.user ? {
// Get current user with proper error handling
const getCurrentUser = async () => {`${activity.user.first_name || ''} ${activity.user.last_name || ''}`.trim(),
  try { profilePicture: activity.user.profilePicture || activity.user.profile_picture_url
    console.log('Attempting to get current user in WorkoutStatsPage');
    const response = await authService.getCurrentUser().catch(err => {
      console.error('Error in getCurrentUser call:', err);y.comments.length : (activity.comments || 0),
      return null;ctivity.image_url
    });
    ;
    if (response && response.user) {
      console.log('User found:', response.user.id);ts.value);
      currentUser.value = response.user;
      // Once we have the user, get activities
      await fetchUserActivities();ror handling
    } else {rentUser = async () => {
      console.warn('No user returned from getCurrentUser');
      nsole.log('Attempting to get current user in WorkoutStatsPage');
      // Try fallback approach - check if user exists in localStorage{
      const localUser = localStorage.getItem('currentUser');
      if (localUser) {
        try {
          const parsedUser = JSON.parse(localUser);
          if (parsedUser && parsedUser.id) {
            console.log('Using localStorage user:', parsedUser.id);
            currentUser.value = parsedUser;
            await fetchUserActivities();vities
            return;erActivities();
          }{
        } catch (parseErr) {returned from getCurrentUser');
          console.error('Error parsing localStorage user:', parseErr);
        }Try fallback approach - check if user exists in localStorage
      }onst localUser = localStorage.getItem('currentUser');
      if (localUser) {
      // If still no user, show sample data
      await fetchSampleActivities();rse(localUser);
    }     if (parsedUser && parsedUser.id) {
  } catch (err) {le.log('Using localStorage user:', parsedUser.id);
    console.error('Failed to get current user:', err);
    await fetchSampleActivities();ies();
  }         return;
};        }
        } catch (parseErr) {
// Generate realistic mock workout data based on activity typerseErr);
function getMockWorkoutData(type: string) {
  const mockData: {duration: number, distance?: number, calories?: number} = {
    duration: 30 // default 30 minutes
  };  // If still no user, show sample data
      await fetchSampleActivities();
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
      break;: 30 // default 30 minutes
    case 'swimming':
      mockData.duration = 30 + Math.floor(Math.random() * 30); // 30-60 min
      mockData.distance = 0.5 + Math.random() * 1.5; // 0.5-2 km
      mockData.calories = 200 + Math.floor(Math.random() * 200); // 200-400 cal
      break;ta.duration = 30 + Math.floor(Math.random() * 30); // 30-60 min
    case 'strength':nce = 3 + Math.random() * 5; // 3-8 km
      mockData.duration = 45 + Math.floor(Math.random() * 30); // 45-75 min cal
      mockData.calories = 200 + Math.floor(Math.random() * 150); // 200-350 cal
      break;cling':
    case 'yoga':uration = 45 + Math.floor(Math.random() * 45); // 45-90 min
    case 'pilates':ance = 10 + Math.random() * 20; // 10-30 km
      mockData.duration = 45 + Math.floor(Math.random() * 15); // 45-60 min cal
      mockData.calories = 150 + Math.floor(Math.random() * 100); // 150-250 cal
      break;imming':
    case 'basketball':n = 30 + Math.floor(Math.random() * 30); // 30-60 min
    case 'tennis':tance = 0.5 + Math.random() * 1.5; // 0.5-2 km
      mockData.duration = 60 + Math.floor(Math.random() * 30); // 60-90 min cal
      mockData.calories = 350 + Math.floor(Math.random() * 250); // 350-600 cal
      break;rength':
    case 'hiking':ation = 45 + Math.floor(Math.random() * 30); // 45-75 min
      mockData.duration = 90 + Math.floor(Math.random() * 90); // 90-180 mincal
      mockData.distance = 5 + Math.random() * 10; // 5-15 km
      mockData.calories = 400 + Math.floor(Math.random() * 300); // 400-700 cal
      break;lates':
    case 'dance':ration = 45 + Math.floor(Math.random() * 15); // 45-60 min
      mockData.duration = 45 + Math.floor(Math.random() * 45); // 45-90 min cal
      mockData.calories = 250 + Math.floor(Math.random() * 200); // 250-450 cal
      break;sketball':
    default:nnis':
      mockData.duration = 30 + Math.floor(Math.random() * 30); // 30-60 min
      mockData.calories = 200 + Math.floor(Math.random() * 100); // 200-300 cal
  }   break;
    case 'hiking':
  return mockData;ation = 90 + Math.floor(Math.random() * 90); // 90-180 min
}     mockData.distance = 5 + Math.random() * 10; // 5-15 km
      mockData.calories = 400 + Math.floor(Math.random() * 300); // 400-700 cal
// Function to toggle debug mode
function toggleDebug() {
  isDebug.value = !isDebug.value;th.floor(Math.random() * 45); // 45-90 min
  console.log('Debug mode:', isDebug.value);ath.random() * 200); // 250-450 cal
  if (isDebug.value) {
    fetchUserActivities(); // Refresh data when enabling debug mode
  }   mockData.duration = 30 + Math.floor(Math.random() * 30); // 30-60 min
}     mockData.calories = 200 + Math.floor(Math.random() * 100); // 200-300 cal
  }
onMounted(() => {
  console.log("WorkoutStatsPage mounted");
  getCurrentUser();
});
</script>helper to add additional troubleshooting
function debugInfo() {
<template>ebug.value) return {};
  <div class="workout-stats-page">
    <h1 class="page-title">My Workout Statistics</h1>
    currentUser: currentUser.value,
    <div v-if="showingSampleData" class="notification is-warning">
      <p><strong>Note:</strong> Showing sample data because we couldn't connect to the server.</p>
      <p class="is-size-7 mt-2">This could be due to server issues or network connectivity problems.</p>kStatus: navigator.onLine ? 'Online' : 'Offline',
    </div>activities: recentWorkouts.value.length,
    
    <!-- Debug panel when debug mode is enabled -->
    <div v-if="isDebug" class="debug-panel">
      <button @click="toggleDebug" class="debug-button">Hide Debug Info</button>
      <button @click="fetchUserActivities" class="debug-button">Refresh Data</button>
      
      <div class="debug-info">
        <pre>{{ JSON.stringify(debugInfo(), null, 2) }}</pre>
      </div>log('Debug mode:', isDebug.value);
    </div> (isDebug.value) {
    g mode
    <div v-if="loading" class="loading-container">
      <p>Loading your workout data...</p>
      <progress class="progress is-primary" max="100"></progress>
    </div>() => {
    nsole.log("WorkoutStatsPage mounted");
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <div class="buttons mt-3">
        <button @click="fetchUserActivities" class="retry-button">Try Again</button>
        <button @click="toggleDebug" class="debug-button">Show Debug Info</button>e>
      </div>
    </div>kout Statistics</h1>
    
    <!-- Fixed condition to properly check for empty data -->
    <div v-else-if="(!userStatistics || userStatistics.total_activities === 0) && recentWorkouts.length === 0" class="empty-state-container">>Note:</strong> Showing sample data because we couldn't connect to the server.</p>
      <p>Your workout statistics will appear here once you've logged some activities.</p>
      <div class="buttons mt-3 is-centered">
        <button @click="$router.push('/my-activity')" class="action-button">Add Your First Workout</button>
        <button @click="toggleDebug" class="debug-button">Show Debug Info</button>
      </div>class="progress is-primary" max="100"></progress>
    </div>
    
    <div v-else class="stats-container">
      <!-- Workout Summary Section -->
      <section class="summary-section">lick="fetchUserActivities" class="retry-button">Try Again</button>
        <h2 class="section-title">Workout Summary</h2>
        
        <div class="summary-stats">ty data -->
          <div class="stat-card"> 0) && recentWorkouts.length === 0" class="empty-state-container">
            <div class="stat-title">Total Workouts</div>rkout statistics will appear here once you've logged some activities.</p>
            <div class="stat-value">{{ userStatistics?.total_activities || 0 }}</div>@click="$router.push('/my-activity')" class="action-button">Add Your First Workout</button>
          </div>
          
          <div class="stat-card">
            <div class="stat-title">Total Time</div>
            <div class="stat-value">{{ formatDuration(totalWorkoutTime) }}</div>
          </div><h2 class="section-title">Workout Summary</h2>
          
          <div class="stat-card">
            <div class="stat-title">Calories Burned</div>
            <div class="stat-value">{{ totalCaloriesBurned.toLocaleString() }} cal</div>
          </div>activities || 0 }}</div>
          
          <div class="stat-card">
            <div class="stat-title">Distance</div>lass="stat-card">
            <div class="stat-value">{{ totalDistance.toFixed(1) }} km</div>      <div class="stat-title">Total Time</div>
          </div>alue">{{ formatDuration(totalWorkoutTime) }}</div>
        </div>
      </section>
        <div class="stat-card">
      <!-- Workout Types Distribution -->iv>
      <section class="workout-types-section">riesBurned.toLocaleString() }} cal</div>
        <h2 class="section-title">Workout Types</h2>
        
        <div class="workout-types-grid">  <div class="stat-card">
          <div v-for="(count, type) in workoutDistribution" :key="type" class="workout-type-card">
            <div class="workout-type-icon">{{ getWorkoutIcon(type) }}</div>alDistance.toFixed(1) }} km</div>
            <div class="workout-type-name">{{ type.charAt(0).toUpperCase() + type.slice(1) }}</div>
            <div class="workout-type-count">{{ count }}</div>
          </div>section>
        </div>
      </section>
      ion">
      <!-- Recent Workouts -->
      <section class="recent-workouts-section">
        <h2 class="section-title">Recent Workouts</h2>="workout-types-grid">
        iv v-for="(count, type) in workoutDistribution" :key="type" class="workout-type-card">
        <div v-if="loading" class="loading-container">ype) }}</div>
          <p>Loading your recent workouts...</p>
          <progress class="progress is-primary" max="100"></progress><div class="workout-type-count">{{ count }}</div>
        </div>
        
        <div v-else-if="recentWorkouts.length === 0" class="empty-state">
          <p>No workouts recorded yet.</p>
          <p>Start adding your activities to see them here!</p>rkouts -->
        </div> class="recent-workouts-section">
        
        <div v-else class="recent-workouts-list">
          <div v-for="workout in recentWorkouts" :key="workout.id" class="workout-card">
            <div class="workout-header"> your recent workouts...</p>
              <div class="workout-type">{{ getWorkoutIcon(workout.type) }} {{ workout.type }}</div>gress class="progress is-primary" max="100"></progress>
              <div class="workout-date">{{ new Date(workout.created_at).toLocaleDateString() }}</div>
            </div>
            
            <h3 class="workout-title">{{ workout.title }}</h3>outs recorded yet.</p>
            <p class="workout-description">{{ workout.description || 'No description provided' }}</p> adding your activities to see them here!</p>
            
            <div class="workout-metrics">
              <div class="metric" v-if="workout.duration">lse class="recent-workouts-list">
                <span class="metric-label">Duration:</span><div v-for="workout in recentWorkouts" :key="workout.id" class="workout-card">
                <span class="metric-value">{{ formatDuration(workout.duration) }}</span>    <div class="workout-header">
              </div>   <div class="workout-type">{{ getWorkoutIcon(workout.type) }} {{ workout.type }}</div>
                            <div class="workout-date">{{ new Date(workout.created_at).toLocaleDateString() }}</div>
              <div class="metric" v-if="workout.distance">div>
                <span class="metric-label">Distance:</span>     
                <span class="metric-value">{{ workout.distance }} km</span>kout-title">{{ workout.title }}</h3>
              </div>t-description">{{ workout.description || 'No description provided' }}</p>
              
              <div class="metric" v-if="workout.calories">out-metrics">
                <span class="metric-label">Calories:</span>s="metric" v-if="workout.duration">
                <span class="metric-value">{{ workout.calories }} cal</span>an class="metric-label">Duration:</span>
              </div>               <span class="metric-value">{{ formatDuration(workout.duration) }}</span>
            </div>              </div>
          </div>
        </div>lass="metric" v-if="workout.distance">
      </section>span class="metric-label">Distance:</span>
    </div><span class="metric-value">{{ workout.distance }} km</span>
  </div>
</template>
ass="metric" v-if="workout.calories">
<style scoped>alories:</span>
:root {               <span class="metric-value">{{ workout.calories }} cal</span>
  --text-primary: #ffffff;              </div>
  --text-secondary: #b3b3b3;/div>
  --dark-primary: #121212;
  --dark-secondary: #1e1e1e;
  --highlight: #1db954;
  --error: #ff5252;
} </div>
</template>
.workout-stats-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;: #ffffff;
  background-color: #121212;
  color: #ffffff;1212;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); --highlight: #1db954;
}  --error: #ff5252;

.page-title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem; margin: 0 auto;
  color: var(--text-primary, #ffffff);  padding: 1rem;
}r: #121212;

.loading-container,
.error-container {px rgba(0, 0, 0, 0.2);
  text-align: center;
  padding: 2rem;
  background-color: var(--dark-secondary, #1e1e1e);
  border-radius: 8px;
  color: var(--text-primary, #ffffff); margin-bottom: 2rem;
}  font-size: 2.5rem;
ext-primary, #ffffff);
.section-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;tainer,
  color: var(--text-primary, #ffffff);error-container {
}  text-align: center;
rem;
.summary-section,
.workout-types-section,
.recent-workouts-section {t-primary, #ffffff);
  margin-bottom: 3rem;
  padding: 1.5rem;
  background-color: var(--dark-primary, #121212);section-title {
  border-radius: 8px;  font-size: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);om: 1.5rem;
}t-primary, #ffffff);

.summary-stats {
  display: grid;summary-section,
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));.workout-types-section,
  gap: 1rem;uts-section {
}rem;

.stat-card {ary, #121212);
  background-color: var(--dark-secondary, #1e1e1e); border-radius: 8px;
  border-radius: 8px;  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}rid;
 grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
.stat-title {  gap: 1rem;
  font-size: 1rem;
  color: var(--text-secondary, #b3b3b3);
  margin-bottom: 0.5rem;
}: var(--dark-secondary, #1e1e1e);

.stat-value {
  font-size: 2rem; text-align: center;
  font-weight: bold;  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  color: var(--highlight, #1db954);
}
stat-title {
.workout-types-grid {  font-size: 1rem;
  display: grid;secondary, #b3b3b3);
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));.5rem;
  gap: 1rem;
}
.stat-value {
.workout-type-card {
  background-color: var(--dark-secondary, #1e1e1e);;
  border-radius: 8px; #1db954);
  padding: 1.5rem;
  text-align: center;
  transition: transform 0.2s ease;.workout-types-grid {
}
ns: repeat(auto-fill, minmax(150px, 1fr));
.workout-type-card:hover {
  transform: translateY(-4px);
}
.workout-type-card {
.workout-type-icon {(--dark-secondary, #1e1e1e);
  font-size: 2rem; 8px;
  margin-bottom: 0.5rem;
}: center;
 transition: transform 0.2s ease;
.workout-type-name {}
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--text-primary, #ffffff);eY(-4px);
}

.workout-type-count {workout-type-icon {
  font-size: 1.25rem;  font-size: 2rem;
  font-weight: bold;0.5rem;
  color: var(--highlight, #1db954);
}

.recent-workouts-list { font-weight: 600;
  display: grid;  margin-bottom: 0.25rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));text-primary, #ffffff);
  gap: 1rem;
}
workout-type-count {
.workout-card {  font-size: 1.25rem;
  background-color: var(--dark-secondary, #1e1e1e);bold;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}-list {

.workout-header { repeat(auto-fit, minmax(300px, 1fr));
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}
, #1e1e1e);
.workout-type {
  font-weight: 600;
  color: var(--highlight, #1db954); box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}}

.workout-date {{
  color: var(--text-secondary, #b3b3b3);
}ent: space-between;

.workout-title {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;.workout-type {
  color: var(--text-primary, #ffffff);ight: 600;
}ighlight, #1db954);

.workout-description {
  color: var(--text-secondary, #b3b3b3);.workout-date {
  margin-bottom: 1rem;text-secondary, #b3b3b3);
  font-size: 0.9rem;
}
workout-title {
.workout-metrics {  font-size: 1.25rem;
  display: grid;: 0.5rem;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));-primary, #ffffff);
  gap: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;.workout-description {
}-text-secondary, #b3b3b3);
;
.metric {rem;
  display: flex;
  flex-direction: column;
}
 display: grid;
.metric-label {  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  font-size: 0.8rem;
  color: var(--text-secondary, #b3b3b3);1px solid rgba(255, 255, 255, 0.1);
}

.metric-value {
  font-weight: 600;
  color: var(--text-primary, #ffffff);
} column;

.empty-state {
  text-align: center;
  padding: 2rem;
  background-color: var(--dark-secondary, #1e1e1e);-text-secondary, #b3b3b3);
  border-radius: 8px;
  color: var(--text-secondary, #b3b3b3);
}

/* Debug panel styling */rimary, #ffffff);
.debug-panel {
  background-color: #2a2a2a;
  border: 2px solid #ff9800;.empty-state {
  border-radius: 4px; center;
  padding: 1rem;
  margin-bottom: 1.5rem;-dark-secondary, #1e1e1e);
  color: #ffffff; border-radius: 8px;
}  color: var(--text-secondary, #b3b3b3);

.debug-button {
  background-color: #ff9800;ling */
  color: #000;
  border: none;r: #2a2a2a;
  padding: 0.5rem 1rem;#ff9800;
  margin-right: 0.5rem; border-radius: 4px;
  margin-bottom: 0.5rem;  padding: 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.debug-info {
  margin-top: 1rem;r: #ff9800;
  font-family: monospace; color: #000;
}  border: none;
m 1rem;
.debug-info pre {
  background-color: #1a1a1a;m: 0.5rem;
  padding: 0.5rem;: 4px;
  border-radius: 4px;
  overflow: auto;
  max-height: 200px;
}
;
.empty-state-container {
  text-align: center;
  padding: 3rem;
  background-color: var(--dark-secondary, #1e1e1e);
  border-radius: 8px;
  margin: 2rem 0; padding: 0.5rem;
}  border-radius: 4px;
o;
.action-button {
  background-color: var(--highlight, #1db954);
  color: #000;
  border: none;{
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-weight: bold;: var(--dark-secondary, #1e1e1e);
  margin-top: 1rem; border-radius: 8px;
  cursor: pointer;: 2rem 0;
  transition: background-color 0.2s;}

















</style>}  cursor: pointer;  margin-top: 1rem;  border-radius: 4px;  padding: 0.5rem 1rem;  border: 1px solid var(--text-primary, #ffffff);  color: var(--text-primary, #ffffff);  background-color: var(--dark-secondary, #1e1e1e);.retry-button {}  background-color: #1ed760;.action-button:hover {}
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
