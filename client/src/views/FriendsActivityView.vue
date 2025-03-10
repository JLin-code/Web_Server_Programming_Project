<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { userStore } from '@/stores/userStore';

const page = 'Friends Activity';
const activities = ref<any[]>([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    setTimeout(() => {
      activities.value = [
        { 
          id: 1, 
          user: {
            id: 102,
            name: userStore.currentUser(),
            avatar: 'https://i.pravatar.cc/150?img=5'
          },
          type: 'workout', 
          title: 'Morning Run', 
          description: 'Started the day with a refreshing 5K run',
          date: '2023-11-12T07:30:00',
          metrics: { distance: '5km', time: '28min', pace: '5:36/km' },
          likes: 8,
          comments: 2,
          image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        { 
          id: 2, 
          user: {
            id: 102,
            name: userStore.currentUser(),
            avatar: 'https://i.pravatar.cc/150?img=5'
          },
          type: 'goal', 
          title: 'Monthly Fitness Goal', 
          description: 'On track to complete my monthly fitness goal!',
          date: '2023-11-10T12:45:00',
          metrics: { completion: '75%', daysLeft: 8 },
          likes: 12,
          comments: 3,
          image: null
        },
        { 
          id: 3, 
          user: {
            id: 102,
            name: userStore.currentUser(),
            avatar: 'https://i.pravatar.cc/150?img=5'
          },
          type: 'achievement', 
          title: 'New Personal Record', 
          description: 'Set a new personal record for push-ups today!',
          date: '2023-11-08T18:20:00',
          metrics: { count: '52 reps', improvement: '+5 from last record' },
          likes: 15,
          comments: 5,
          image: 'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        }
      ];
      loading.value = false;
    }, 500);
  } catch (err) {
    error.value = 'Failed to load your activities';
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

const likeActivity = (id: number) => {
  const activity = activities.value.find(a => a.id === id);
  if (activity) {
    activity.likes++;
  }
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
          <div class="user-info">
            <img :src="activity.user.avatar" :alt="activity.user.name" class="user-avatar">
            <div>
              <h3 class="user-name">
                {{ activity.user.name }}
              </h3>
              <span class="activity-date">{{ formatDate(activity.date) }}</span>
            </div>
          </div>
          
          <div class="activity-content">
            <h4 class="activity-title">{{ activity.title }}</h4>
            <p class="activity-description">{{ activity.description }}</p>
            
            <!-- Activity Image -->
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
              <button class="engagement-btn" @click="likeActivity(activity.id)">
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