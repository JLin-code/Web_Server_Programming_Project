<template>
  <div class="profile-container">
    <div class="profile-header columns">
      <div class="column is-narrow">
        <figure class="image is-128x128">
          <img class="is-rounded" 
               :src="profileData?.profile_picture_url || 'https://bulma.io/images/placeholders/128x128.png'" 
               alt="Profile picture">
        </figure>
      </div>
      
      <div class="column">
        <div v-if="profileLoading" class="is-loading-container">
          <progress class="progress is-primary" max="100"></progress>
        </div>
        
        <div v-else-if="profileError" class="notification is-danger">
          <p>Error loading profile: {{ profileError.message }}</p>
          <button class="button is-primary mt-3" @click="loadProfile">Try Again</button>
        </div>
        
        <div v-else>
          <h1 class="title is-1">{{ fullName }}</h1>
          <p class="subtitle is-4">{{ profileData?.email }}</p>
          <p class="tag is-info">{{ profileData?.role || 'User' }}</p>
          <p class="subtitle is-6">Member since {{ memberSince }}</p>
        </div>
      </div>
    </div>
    
    <!-- User Statistics -->
    <div class="statistics-section box mt-5">
      <h3 class="title is-3">Activity Statistics</h3>
      
      <div v-if="statsLoading" class="has-text-centered">
        <progress class="progress is-primary" max="100"></progress>
      </div>
      
      <div v-else-if="statsError" class="notification is-warning">
        <p>Could not load statistics: {{ statsError.message }}</p>
        <button class="button is-primary mt-3" @click="loadStats">Reload Statistics</button>
      </div>
      
      <div v-else class="columns is-multiline">
        <div class="column is-4">
          <div class="has-text-centered stat-box">
            <p class="heading">Total Activities</p>
            <p class="title">{{ statsData?.total_activities || 0 }}</p>
          </div>
        </div>
        
        <div class="column is-4">
          <div class="has-text-centered stat-box">
            <p class="heading">Total Comments</p>
            <p class="title">{{ statsData?.total_comments || 0 }}</p>
          </div>
        </div>
        
        <div class="column is-4">
          <div class="has-text-centered stat-box">
            <p class="heading">Likes Received</p>
            <p class="title">{{ statsData?.total_likes_received || 0 }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- User Activities -->
    <div class="activities-section mt-5">
      <h3 class="title is-3">Recent Activities</h3>
      
      <div v-if="activitiesLoading" class="has-text-centered">
        <progress class="progress is-primary" max="100"></progress>
      </div>
      
      <div v-else-if="activitiesError" class="notification is-danger">
        <p>Error loading activities: {{ activitiesError.message }}</p>
        <button class="button is-primary mt-3" @click="loadActivities">Try Again</button>
      </div>
      
      <div v-else-if="activitiesData.length === 0" class="notification is-info">
        <p>No activities yet. Go start tracking!</p>
      </div>
      
      <div v-else class="activities-list">
        <div v-for="activity in activitiesData" :key="activity.id" class="card mb-4">
          <div class="card-content">
            <p class="title is-4">
              <span class="tag is-primary mr-2">{{ activity.type }}</span>
              {{ activity.description }}
            </p>
            <p class="subtitle is-6">{{ formatDate(activity.created_at) }}</p>
            
            <div class="content">
              <div v-if="activity.duration" class="mt-2">
                <strong>Duration:</strong> {{ formatDuration(activity.duration) }}
              </div>
              
              <div v-if="activity.distance" class="mt-2">
                <strong>Distance:</strong> {{ activity.distance }} km
              </div>
              
              <div v-if="activity.comments?.length > 0" class="comments-section mt-4">
                <h4 class="subtitle is-5">Comments ({{ activity.comments.length }})</h4>
                <div v-for="comment in activity.comments" :key="comment.id" 
                     class="comment p-2 mb-2 has-background-light">
                  <strong>{{ comment.user?.name || 'Unknown User' }}</strong>: {{ comment.text }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUserProfile, useUserActivities, useUserStatistics } from '../utils/supabaseHelpers';

const route = useRoute();
const userId = computed(() => route.params.id || 'current');

// Fetch user profile data
const { 
  data: profileData, 
  loading: profileLoading, 
  error: profileError,
  load: loadProfile 
} = useUserProfile(userId.value);

// Fetch user activities
const { 
  data: activitiesData, 
  loading: activitiesLoading, 
  error: activitiesError,
  load: loadActivities 
} = useUserActivities(userId.value);

// Fetch user statistics
const { 
  data: statsData, 
  loading: statsLoading, 
  error: statsError,
  load: loadStats 
} = useUserStatistics(userId.value);

// Computed properties
const fullName = computed(() => {
  if (!profileData.value) return 'Loading...';
  return `${profileData.value.first_name} ${profileData.value.last_name}`;
});

const memberSince = computed(() => {
  if (!profileData.value?.created_at) return '';
  return new Date(profileData.value.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Format date for readability
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format activity duration
function formatDuration(minutes) {
  if (!minutes) return '';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins} min`;
}

onMounted(() => {
  loadProfile();
  loadActivities();
  loadStats();
});
</script>

<style scoped>
.profile-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-header {
  background-color: #f5f5f5;
  padding: 2rem;
  border-radius: 8px;
}

.stat-box {
  background-color: white;
  padding: 1.5rem;
  border-radius: 4px;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1);
}

.is-loading-container {
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.comment {
  border-radius: 4px;
}
</style>
