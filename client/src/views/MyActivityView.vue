<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { userStore } from '@/stores/userStore';
import { activityStore } from '@/stores/activityStore';

const page = 'My Activity';

// Computed property to filter activities based on current user's name
const filteredActivities = computed(() => {
  const currentUser = userStore.currentUser();
  return activityStore.activities.value.filter(activity => activity.user.name === currentUser);
});

onMounted(async () => {
  try {
    if (activityStore.activities.value.length === 0) {
      activityStore.initializeActivities();
    }
  } catch (err) {
    activityStore.error.value = 'Failed to load your activities';
    console.error(err);
  }
});
</script>

<template>
  <main>
    <h1 class="title">{{ page }}</h1>
    
    <div class="activities-container">
      <div v-if="activityStore.loading.value" class="loading">
        <p>Loading your activities...</p>
      </div>
      
      <div v-else-if="activityStore.error.value" class="error">
        <p>{{ activityStore.error.value }}</p>
      </div>
      
      <div v-else-if="filteredActivities.length === 0" class="empty-state">
        <p>No activities found for {{ userStore.currentUser() }}.</p>
      </div>
      
      <div v-else class="activities-list">
        <div v-for="activity in filteredActivities" :key="activity.id" class="activity-card card">
          <div class="user-info">
            <img :src="activity.user.avatar" :alt="activity.user.name" class="user-avatar">
            <div>
              <h3 class="user-name">
                {{ activity.user.name }}
              </h3>
              <span class="activity-date">{{ activityStore.formatDate(activity.date) }}</span>
            </div>
          </div>
          
          <div class="activity-content">
            <h4 class="activity-title">{{ activity.title }}</h4>
            <p class="activity-description">{{ activity.description }}</p>
            
            <div v-if="activity.image" class="activity-image-container">
              <img :src="activity.image" :alt="activity.title" class="activity-image">
            </div>
            
            <div class="activity-metrics">
              <div v-for="(value, key) in activity.metrics" :key="key" class="metric">
                <span class="metric-value">{{ value }}</span>
                <span class="metric-label">{{ key }}</span>
              </div>
            </div>
          </div>
          
          <div class="activity-engagement">
            <div class="engagement-stats">
              <span>{{ activity.likes }} likes</span>
              <span>{{ activity.comments }} comments</span>
            </div>
            
            <div class="engagement-actions">
              <button class="engagement-btn" @click="activityStore.likeActivity(activity.id)">
                👍 Like
              </button>
              <button class="engagement-btn">
                💬 Comment
              </button>
              <button class="btn-small">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.title {
  margin-bottom: 2rem;
}

.activities-container {
  max-width: 800px;
  margin: 0 auto;
}

.loading, .error, .empty-state {
  text-align: center;
  padding: 2rem;
}

.empty-state {
  background-color: var(--dark-bg);
  border-radius: 8px;
  padding: 3rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
}

.activity-card {
  margin-bottom: 1.5rem;
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 1rem;
  object-fit: cover;
}

.user-name {
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
}

.activity-date {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.activity-content {
  margin-bottom: 1.5rem;
}

.activity-title {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-size: 1.4rem;
  font-weight: 600; 
}

.activity-description {
  margin-bottom: 1rem;
}

.activity-metrics {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0.5rem;
}

.metric-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--highlight);
}

.metric-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-transform: capitalize;
}

.activity-image-container {
  margin: 1rem 0;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.activity-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.activity-image:hover {
  transform: scale(1.02);
}

.activity-engagement {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
}

.engagement-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.engagement-actions {
  display: flex;
  gap: 1rem;
}

.engagement-btn {
  background-color: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.engagement-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  background-color: var(--accent-color);
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.btn-small:hover {
  background-color: var(--highlight);
}
</style>