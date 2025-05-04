<template>
  <div class="stats-container">
    <h1 class="title is-1">Platform Statistics</h1>
    
    <div v-if="loading" class="has-text-centered">
      <p class="subtitle">Loading statistics...</p>
      <progress class="progress is-primary" max="100"></progress>
    </div>
    
    <div v-else-if="error" class="notification is-danger">
      <p>Error loading statistics: {{ error.message }}</p>
      <button class="button is-primary mt-3" @click="load">Try Again</button>
    </div>
    
    <div v-else class="stats-content">
      <!-- Summary Cards -->
      <div class="columns is-multiline">
        <div class="column is-3">
          <div class="card">
            <div class="card-content has-text-centered">
              <p class="heading">Total Users</p>
              <p class="title">{{ data.total_users || 0 }}</p>
            </div>
          </div>
        </div>
        
        <div class="column is-3">
          <div class="card">
            <div class="card-content has-text-centered">
              <p class="heading">Total Activities</p>
              <p class="title">{{ data.total_activities || 0 }}</p>
            </div>
          </div>
        </div>
        
        <div class="column is-3">
          <div class="card">
            <div class="card-content has-text-centered">
              <p class="heading">Total Comments</p>
              <p class="title">{{ data.total_comments || 0 }}</p>
            </div>
          </div>
        </div>
        
        <div class="column is-3">
          <div class="card">
            <div class="card-content has-text-centered">
              <p class="heading">Total Likes</p>
              <p class="title">{{ data.periods?.all_time?.likes || 0 }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Activity Type Distribution -->
      <div class="activity-distribution box mt-5">
        <h2 class="title is-3">Activity Type Distribution</h2>
        
        <div v-if="!Object.keys(data.activity_type_distribution || {}).length" 
             class="notification is-info">
          <p>No activity data available yet.</p>
        </div>
        
        <div v-else class="columns is-multiline">
          <div v-for="(count, type) in data.activity_type_distribution" 
               :key="type" 
               class="column is-3">
            <div class="card">
              <div class="card-content has-text-centered">
                <p class="heading">{{ capitalizeFirstLetter(type) }}</p>
                <p class="title">{{ count }}</p>
                <p class="subtitle is-6">
                  {{ getActivityPercentage(count) }}% of total
                </p>
                
                <progress 
                  class="progress" 
                  :class="getColorForActivityType(type)"
                  :value="count" 
                  :max="data.total_activities">
                </progress>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Period Comparison -->
      <div class="period-comparison box mt-5">
        <h2 class="title is-3">Activity by Period</h2>
        
        <div class="columns">
          <div class="column">
            <h3 class="title is-5">This Week</h3>
            <div class="card">
              <div class="card-content">
                <p><strong>Activities:</strong> {{ data.periods?.this_week?.activities || 0 }}</p>
                <p><strong>Comments:</strong> {{ data.periods?.this_week?.comments || 0 }}</p>
                <p><strong>Likes:</strong> {{ data.periods?.this_week?.likes || 0 }}</p>
              </div>
            </div>
          </div>
          
          <div class="column">
            <h3 class="title is-5">This Month</h3>
            <div class="card">
              <div class="card-content">
                <p><strong>Activities:</strong> {{ data.periods?.this_month?.activities || 0 }}</p>
                <p><strong>Comments:</strong> {{ data.periods?.this_month?.comments || 0 }}</p>
                <p><strong>Likes:</strong> {{ data.periods?.this_month?.likes || 0 }}</p>
              </div>
            </div>
          </div>
          
          <div class="column">
            <h3 class="title is-5">All Time</h3>
            <div class="card">
              <div class="card-content">
                <p><strong>Activities:</strong> {{ data.periods?.all_time?.activities || 0 }}</p>
                <p><strong>Comments:</strong> {{ data.periods?.all_time?.comments || 0 }}</p>
                <p><strong>Likes:</strong> {{ data.periods?.all_time?.likes || 0 }}</p>
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
import { useGlobalStatistics } from '../utils/supabaseHelpers';

// Fetch global statistics
const { data, loading, error, load } = useGlobalStatistics();

// Helper functions for UI
function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getActivityPercentage(count) {
  if (!data.value?.total_activities || data.value.total_activities === 0) return 0;
  return ((count / data.value.total_activities) * 100).toFixed(1);
}

function getColorForActivityType(type) {
  const colorMap = {
    'running': 'is-success',
    'cycling': 'is-info',
    'swimming': 'is-primary',
    'weight_training': 'is-danger',
    'hiking': 'is-warning'
  };
  
  return colorMap[type] || 'is-info';
}

onMounted(() => {
  load();
});
</script>

<style scoped>
.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.stats-content {
  margin-top: 2rem;
}

.card {
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}
</style>
