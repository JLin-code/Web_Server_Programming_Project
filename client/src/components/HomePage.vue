<template>
  <div class="home-container">
    <h1 class="title is-1">Welcome to Fitness Tracker</h1>
    
    <div v-if="loading" class="has-text-centered">
      <p class="subtitle">Loading activities...</p>
      <progress class="progress is-primary" max="100"></progress>
    </div>
    
    <div v-else-if="error" class="notification is-danger">
      <p>Error loading activities: {{ error.message }}</p>
      <button class="button is-primary mt-3" @click="load">Try Again</button>
    </div>
    
    <div v-else class="activities-feed">
      <h2 class="subtitle is-3">Recent Activities</h2>
      
      <div v-if="data.length === 0" class="notification is-info">
        <p>No activities yet. Be the first to post!</p>
      </div>
      
      <div v-else class="activities-list">
        <div v-for="activity in data" :key="activity.id" class="card mb-4">
          <div class="card-content">
            <div class="media">
              <div class="media-left">
                <figure class="image is-48x48">
                  <img :src="activity.user?.profilePicture || 'https://bulma.io/images/placeholders/96x96.png'" 
                       alt="Profile" class="is-rounded">
                </figure>
              </div>
              <div class="media-content">
                <p class="title is-4">{{ activity.user?.name || 'Unknown User' }}</p>
                <p class="subtitle is-6">{{ formatDate(activity.created_at) }}</p>
              </div>
            </div>

            <div class="content">
              <p class="activity-type">
                <span class="tag is-primary">{{ activity.type }}</span>
              </p>
              <p>{{ activity.description }}</p>
              
              <div v-if="activity.duration" class="mt-2">
                <strong>Duration:</strong> {{ formatDuration(activity.duration) }}
              </div>
              
              <div v-if="activity.distance" class="mt-2">
                <strong>Distance:</strong> {{ activity.distance }} km
              </div>
            </div>
            
            <div class="comments-section mt-4">
              <h4 class="subtitle is-5">Comments ({{ activity.comments?.length || 0 }})</h4>
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
</template>

<script setup>
import { onMounted } from 'vue';
import { useActivities } from '../utils/supabaseHelpers';

// Fetch activities data with our helper
const { data, loading, error, load } = useActivities(10);

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
  // Reload data when component is mounted
  load();
});
</script>

<style scoped>
.home-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.activities-feed {
  margin-top: 2rem;
}

.comment {
  border-radius: 4px;
}
</style>
