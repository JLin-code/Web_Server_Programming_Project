<script setup lang="ts">
import { ref, onMounted } from 'vue';

const page = 'My Activity';
const activities = ref<any[]>([]);
const loading = ref(true);
const error = ref('');

// User account info (this would come from authentication in a real app)
const user = {
  name: 'John Doe',
  preferences: ['running', 'weightlifting', 'yoga'],
  level: 'intermediate'
};

// Helper functions for generating random activities
const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const generateRandomDate = (daysBack = 30): string => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date.toISOString();
};

const generateWorkout = (id: number): any => {
  const workoutTypes = ['Running', 'Weightlifting', 'Yoga', 'Swimming', 'Cycling', 'HIIT'];
  const type = getRandomElement(user.preferences) || getRandomElement(workoutTypes);
  
  const metrics: Record<string, string | number> = {};
  
  if (type === 'Running' || type === 'Cycling') {
    const distance = Math.floor(Math.random() * 10) + 2;
    const minutes = Math.floor(Math.random() * 40) + 15;
    const calories = Math.floor(minutes * 8 + distance * 20);
    
    metrics.distance = `${distance}km`;
    metrics.time = `${minutes}min`;
    metrics.calories = calories.toString();
    
    return {
      id,
      type: 'workout',
      title: `${type} Session`,
      description: `Completed ${distance}km in ${minutes} minutes`,
      date: generateRandomDate(),
      metrics
    };
  } else if (type === 'Weightlifting') {
    const weight = Math.floor(Math.random() * 50) + 40;
    const sets = Math.floor(Math.random() * 5) + 3;
    const reps = Math.floor(Math.random() * 8) + 5;
    
    metrics.weight = `${weight}kg`;
    metrics.sets = sets;
    metrics.reps = reps;
    
    return {
      id,
      type: 'workout',
      title: 'Weight Training',
      description: `Completed ${sets} sets of ${reps} reps`,
      date: generateRandomDate(),
      metrics
    };
  } else {
    const minutes = Math.floor(Math.random() * 40) + 20;
    metrics.duration = `${minutes}min`;
    metrics.intensity = getRandomElement(['Low', 'Medium', 'High']);
    
    return {
      id,
      type: 'workout',
      title: `${type} Session`,
      description: `${minutes} minute ${type.toLowerCase()} workout`,
      date: generateRandomDate(),
      metrics
    };
  }
};

const generateAchievement = (id: number): any => {
  const achievements = [
    'New Personal Best',
    'Streak Milestone',
    'Distance Record',
    'Weight Record',
    'Consistency Award'
  ];
  
  const title = getRandomElement(achievements);
  
  const descriptions = {
    'New Personal Best': `Beat your previous record for ${getRandomElement(user.preferences)}`,
    'Streak Milestone': `Completed ${Math.floor(Math.random() * 10) + 5} workouts in a row`,
    'Distance Record': `Set a new distance record of ${Math.floor(Math.random() * 15) + 5}km`,
    'Weight Record': `New weight record: ${Math.floor(Math.random() * 50) + 50}kg`,
    'Consistency Award': `Worked out ${Math.floor(Math.random() * 4) + 3} times this week`
  };
  
  const metrics: Record<string, string | number> = {};
  if (title === 'New Personal Best') {
    metrics.improvement = `${Math.floor(Math.random() * 20) + 5}%`;
  } else if (title === 'Streak Milestone') {
    metrics.days = Math.floor(Math.random() * 10) + 5;
  } else if (title === 'Distance Record') {
    metrics.distance = `${Math.floor(Math.random() * 15) + 5}km`;
  } else if (title === 'Weight Record') {
    metrics.weight = `${Math.floor(Math.random() * 50) + 50}kg`;
  } else {
    metrics.workouts = Math.floor(Math.random() * 4) + 3;
  }
  
  return {
    id,
    type: 'achievement',
    title,
    description: descriptions[title as keyof typeof descriptions],
    date: generateRandomDate(14),
    metrics
  };
};

const generateGoal = (id: number): any => {
  const goalTypes = [
    'Weekly Goal Completed',
    'Monthly Challenge Progress',
    'Personal Target'
  ];
  
  const title = getRandomElement(goalTypes);
  const completion = Math.floor(Math.random() * 40) + 60; // 60% to 100%
  const metrics: Record<string, string | number> = { completion: `${completion}%` };
  
  let description = '';
  if (title === 'Weekly Goal Completed') {
    const target = Math.floor(Math.random() * 3) + 3;
    description = `Hit your target of ${target} ${getRandomElement(user.preferences)} workouts this week`;
    metrics.target = target;
    metrics.achieved = completion === 100 ? target : Math.floor(target * completion / 100);
  } else if (title === 'Monthly Challenge Progress') {
    description = `Progress in your ${getRandomElement(user.preferences)} challenge`;
    metrics.daysLeft = Math.floor(Math.random() * 15) + 1;
  } else {
    description = `Progress towards your ${getRandomElement(['weight', 'endurance', 'flexibility', 'strength'])} goal`;
    metrics.remainingDays = Math.floor(Math.random() * 10) + 1;
  }
  
  return {
    id,
    type: 'goal',
    title,
    description,
    date: generateRandomDate(10),
    metrics
  };
};

// Generate random activities based on user account
onMounted(async () => {
  try {
    // Simulating API call - replace with actual API
    // e.g. const response = await fetch('/api/activities/my');
    // const data = await response.json();
    
    setTimeout(() => {
      const numberOfActivities = Math.floor(Math.random() * 4) + 3; // Generate 3-6 activities
      const generatedActivities = [];
      
      for (let i = 1; i <= numberOfActivities; i++) {
        const activityType = getRandomElement(['workout', 'achievement', 'goal']);
        
        if (activityType === 'workout') {
          generatedActivities.push(generateWorkout(i));
        } else if (activityType === 'achievement') {
          generatedActivities.push(generateAchievement(i));
        } else {
          generatedActivities.push(generateGoal(i));
        }
      }
      
      // Sort by date (newest first)
      generatedActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      activities.value = generatedActivities;
      loading.value = false;
    }, 500);
  } catch (err) {
    error.value = 'Failed to load activities';
    loading.value = false;
    console.error(err);
  }
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<template>
  <main>
    <h1 class="title">{{ page }}</h1>
    
    <div class="activities-container">
      <div v-if="loading" class="loading">
        <p>Loading your activities...</p>
      </div>
      
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
      </div>
      
      <div v-else-if="activities.length === 0" class="empty-state">
        <p>You haven't recorded any activities yet.</p>
        <button class="btn">Record New Activity</button>
      </div>
      
      <div v-else class="activities-list">
        <div v-for="activity in activities" :key="activity.id" class="activity-card card">
          <div class="activity-header">
            <h3>{{ activity.title }}</h3>
            <span class="activity-date">{{ formatDate(activity.date) }}</span>
          </div>
          
          <p class="activity-description">{{ activity.description }}</p>
          
          <div class="activity-metrics">
            <div v-for="(value, key) in activity.metrics" :key="key" class="metric">
              <span class="metric-value">{{ value }}</span>
              <span class="metric-label">{{ key }}</span>
            </div>
          </div>
          
          <div class="activity-actions">
            <button class="btn-small">Edit</button>
            <button class="btn-small btn-secondary">Share</button>
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
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.activity-date {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.activity-description {
  margin-bottom: 1rem;
}

.activity-metrics {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--highlight);
}

.metric-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-transform: capitalize;
}

.activity-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.btn-secondary {
  background-color: transparent;
  border: 1px solid var(--accent-color);
  color: var(--accent-color);
}

.btn-secondary:hover {
  background-color: rgba(93, 93, 255, 0.1);
}
</style>