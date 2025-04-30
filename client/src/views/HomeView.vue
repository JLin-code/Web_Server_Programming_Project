<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { authService } from '../services/api';

// Define type for time periods
type TimePeriod = 'day' | 'week' | 'month' | 'allTime';

// Page title
const page = ref('Fitness Tracker');
const username = ref('Guest');

// Mock tracking data - replace with API call when available
const trackingData = reactive({
  day: { steps: '8,421', calories: '1,234', distance: '5.2km' },
  week: { steps: '52,340', calories: '8,742', distance: '32.1km' },
  month: { steps: '248,750', calories: '36,240', distance: '154.3km' },
  allTime: { steps: '1,042,360', calories: '146,320', distance: '682.7km' }
});

// Active tab state with proper typing
const activeTab = ref<TimePeriod>('day');

onMounted(async () => {
  try {
    const response = await authService.getCurrentUser();
    if (response && response.user) {
      username.value = `${response.user.first_name} ${response.user.last_name}`;
    }
  } catch (error) {
    console.error('Failed to get current user:', error);
  }
});

// Function to change active tab with proper typing
function setActiveTab(tab: TimePeriod) {
  activeTab.value = tab;
}
</script>

<template>
  <main>
    <h1 class="title">{{ username }}'s {{ page }}</h1>
    
    <!-- Period selector tabs -->
    <div class="period-tabs">
      <button 
        @click="setActiveTab('day')" 
        :class="{ active: activeTab === 'day' }">Today</button>
      <button 
        @click="setActiveTab('week')" 
        :class="{ active: activeTab === 'week' }">This Week</button>
      <button 
        @click="setActiveTab('month')" 
        :class="{ active: activeTab === 'month' }">This Month</button>
      <button 
        @click="setActiveTab('allTime')" 
        :class="{ active: activeTab === 'allTime' }">All Time</button>
    </div>

    <!-- Stats cards -->
    <div class="stats-container">
      <div class="stat-card">
        <div class="stat-title">Distance</div>
        <div class="stat-value">{{ trackingData[activeTab].distance }}</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-title">Steps</div>
        <div class="stat-value">{{ trackingData[activeTab].steps }}</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-title">Calories Burned</div>
        <div class="stat-value">{{ trackingData[activeTab].calories }}</div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.title {
  margin-bottom: 2rem;
  text-align: center;
  color: #ffffff;
}

.period-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.period-tabs button {
  padding: 0.75rem 1.5rem;
  border: 1px solid #ccc;
  background: #2c3e50;
  color: white;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
  font-size: 1.1rem;
  font-weight: 500;
}

.period-tabs button.active {
  background: #42b983;
  color: white;
  border-color: #42b983;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(66, 185, 131, 0.3);
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  width: 95%;
  max-width: 1200px;
  margin: 0 auto;
}

.stat-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  padding: 2rem;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.stat-title {
  font-size: 1.2rem;
  color: #42b983;
  margin-bottom: 1rem;
  font-weight: bold;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
}

@media (min-width: 768px) {
  .stats-container {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .stat-card {
    min-height: 200px;
  }
}

main {
  width: 100%;
  padding: 2rem 1rem;
  box-sizing: border-box;
}
</style>