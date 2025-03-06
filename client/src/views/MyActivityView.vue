<script setup lang="ts">
import { ref } from 'vue'

// Placeholder data for user activities
const activities = ref([
  { 
    id: 1, 
    type: 'Running', 
    date: '2023-10-15', 
    duration: 45, 
    distance: 5.2,
    calories: 420
  },
  { 
    id: 2, 
    type: 'Cycling', 
    date: '2023-10-13', 
    duration: 60, 
    distance: 15,
    calories: 550
  },
  { 
    id: 3, 
    type: 'Swimming', 
    date: '2023-10-10', 
    duration: 30, 
    distance: 1.5,
    calories: 350
  }
])

// Function to add a new activity
function addActivity() {
  // Implementation will go here
  console.log('Add activity clicked')
}
</script>

<template>
  <div class="my-activity-container">
    <h1>My Activities</h1>
    
    <div class="actions">
      <button class="add-activity" @click="addActivity">
        <i class="fas fa-plus"></i> Add Activity
      </button>
    </div>
    
    <div class="activities-list">
      <div v-for="activity in activities" :key="activity.id" class="card activity-card">
        <div class="activity-header">
          <h3>
            <i class="fas" 
               :class="{
                 'fa-running': activity.type === 'Running',
                 'fa-biking': activity.type === 'Cycling',
                 'fa-swimming': activity.type === 'Swimming'
               }"></i>
            {{ activity.type }}
          </h3>
          <span class="date">{{ activity.date }}</span>
        </div>
        
        <div class="activity-details">
          <div class="detail">
            <i class="fas fa-clock"></i>
            <span>{{ activity.duration }} min</span>
          </div>
          <div class="detail">
            <i class="fas fa-route"></i>
            <span>{{ activity.distance }} km</span>
          </div>
          <div class="detail">
            <i class="fas fa-fire"></i>
            <span>{{ activity.calories }} kcal</span>
          </div>
        </div>
        
        <div class="activity-actions">
          <button class="edit-btn">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-btn">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.my-activity-container {
  max-width: 800px;
  margin: 0 auto;
}

.actions {
  margin: 1.5rem 0;
  display: flex;
  justify-content: flex-end;
}

.add-activity {
  background-color: var(--highlight);
}

.add-activity:hover {
  opacity: 0.9;
}

.activities-list {
  display: grid;
  gap: 1rem;
}

.activity-card {
  padding: 1.5rem;
  transition: transform 0.2s ease;
}

.activity-card:hover {
  transform: translateY(-3px);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.date {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.activity-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
}

.activity-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.edit-btn, .delete-btn {
  padding: 0.5rem;
  border-radius: 4px;
  background-color: transparent;
  color: var(--text-secondary);
}

.edit-btn:hover {
  color: var(--accent-color);
  background-color: rgba(93, 93, 255, 0.1);
}

.delete-btn:hover {
  color: #ff5252;
  background-color: rgba(255, 82, 82, 0.1);
}

@media (max-width: 600px) {
  .activity-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
