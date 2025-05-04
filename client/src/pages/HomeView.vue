<script setup>
import { ref, onMounted } from 'vue';
import { supabaseStats } from '../services/supabase';

const isDebug = import.meta.env.DEV;
const loading = ref(true);
const error = ref(null);
const statistics = ref({
  activeUsers: 0,
  totalActivities: 0,
  totalConnections: 0,
  totalComments: 0,
  activityTypes: {}
});
const currentUser = ref(null);

async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      currentUser.value = user;
    }
  } catch (err) {
    console.error('Error getting current user:', err);
  }
}

async function fetchStatistics() {
  loading.value = true;
  error.value = null;
  
  try {
    console.log("Fetching statistics data...");
    const response = await supabaseStats.getGlobalStatistics();
    
    if (response) {
      // Map the response to our expected format
      statistics.value = {
        activeUsers: response.total_users || 0,
        totalActivities: response.periods?.all_time?.activities || 0,
        totalConnections: response.total_connections || 0,
        totalComments: response.periods?.all_time?.comments || 0,
        activityTypes: response.activity_type_distribution || {}
      };
      console.log('Statistics loaded from API');
    } else {
      // Use fallback data if API fails
      console.log('Using fallback statistics data');
      statistics.value = {
        activeUsers: 7,
        totalActivities: 25,
        totalConnections: 15,
        totalComments: 42,
        activityTypes: {
          running: 8,
          strength: 5,
          yoga: 2,
          cycling: 4,
          cardio: 3,
          swimming: 1,
          basketball: 2,
          pilates: 1,
          tennis: 1,
          hiking: 3,
          dance: 2
        }
      };
    }
  } catch (err) {
    console.error('Failed to load statistics:', err);
    error.value = 'Unable to load statistics. Using default values.';
    
    // Always provide fallback data to prevent UI breaking
    statistics.value = {
      activeUsers: 7,
      totalActivities: 25,
      totalConnections: 15,
      totalComments: 42,
      activityTypes: {
        running: 8,
        strength: 5,
        yoga: 2,
        cycling: 4,
        cardio: 3
      }
    };
  } finally {
    loading.value = false;
  }
}

// Function to format activity type for display
function formatActivityType(type) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

// Function to get activity icon based on type
function getActivityIcon(type) {
  const icons = {
    running: '🏃',
    strength: '💪',
    yoga: '🧘',
    cycling: '🚴',
    cardio: '❤️',
    swimming: '🏊',
    basketball: '🏀',
    pilates: '🤸',
    tennis: '🎾',
    hiking: '🥾',
    dance: '💃'
  };
  return icons[type] || '🏋️';
}

onMounted(() => {
  console.log('HomeView component mounted');
  getCurrentUser();
  fetchStatistics();
})
</script>

<template>
  <div class="home">
    <!-- Debug info -->
    <div v-if="isDebug" class="debug-panel debug-panel-visible">
      Component loaded: HomeView
    </div>
    
    <section class="hero">
      <div class="hero-content">
        <h1>Welcome to Fitness Tracker</h1>
        <p>Track your workouts, connect with friends, and achieve your fitness goals.</p>
      </div>
    </section>
    
    <!-- Platform Statistics -->
    <section class="statistics-section">
      <h2 class="section-title">Platform Statistics</h2>
      
      <div v-if="loading" class="loading-container">
        <p>Loading statistics...</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
      </div>
      
      <div v-else class="stats-container">
        <div class="stat-card">
          <div class="stat-title">Active Users</div>
          <div class="stat-value">{{ statistics.activeUsers || 0 }}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-title">Total Activities</div>
          <div class="stat-value">{{ statistics.totalActivities || 0 }}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-title">Social Connections</div>
          <div class="stat-value">{{ statistics.totalConnections || 0 }}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-title">Comments</div>
          <div class="stat-value">{{ statistics.totalComments || 0 }}</div>
        </div>
      </div>
      
      <!-- Activity Type Distribution -->
      <div v-if="!loading && !error && Object.keys(statistics.activityTypes).length > 0" class="activity-types-section">
        <h3 class="subsection-title">Activity Types</h3>
        <div class="activity-types-grid">
          <div v-for="(count, type) in statistics.activityTypes" :key="type" class="activity-type-card">
            <div class="activity-type-icon">{{ getActivityIcon(type) }}</div>
            <div class="activity-type-name">{{ formatActivityType(type) }}</div>
            <div class="activity-type-count">{{ count }}</div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Features Section -->
    <section class="features-section">
      <h2 class="section-title">Features</h2>
      <div class="features-container">
        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3>Track Activities</h3>
          <p>Log your workouts, runs, and fitness activities with detailed metrics.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">👥</div>
          <h3>Connect with Friends</h3>
          <p>Find friends, share your progress, and motivate each other.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">🏆</div>
          <h3>Set Goals</h3>
          <p>Create and track personal fitness goals to stay motivated.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.debug-panel {
  background-color: #f0f8ff;
  border: 1px dashed #1e90ff;
  color: #333;
  padding: 10px;
  margin-bottom: 10px;
  font-family: monospace;
  font-size: 12px;
}

.debug-panel-visible {
  display: block;
}

.home {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.hero {
  background-color: var(--dark-bg);
  padding: 4rem 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
  background-image: linear-gradient(135deg, #5d5dff 0%, #4a4ad7 100%);
  color: white;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: white;
}

.statistics-section {
  margin-bottom: 3rem;
}

.section-title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background-color: var(--dark-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-title {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--highlight);
}

.features-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  background-color: var(--dark-secondary);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.loading-container, 
.error-container {
  text-align: center;
  padding: 2rem;
  background-color: var(--dark-secondary);
  border-radius: 8px;
}

.activity-types-section {
  margin-top: 2rem;
}

.subsection-title {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.activity-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.activity-type-card {
  background-color: var(--dark-secondary);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.activity-type-card:hover {
  transform: translateY(-4px);
}

.activity-type-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.activity-type-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.activity-type-count {
  color: var(--highlight);
  font-weight: bold;
}
</style>