<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { userStore } from '@/stores/userStore';

const page = 'Friend Activity';
const activities = ref<any[]>([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    // Simulate API call with timeout
    setTimeout(() => {
      // Create activities that match with the users from the navbar
      activities.value = [
        { 
          id: 1, 
          user: {
            id: 101,
            name: 'Jane Smith',
            avatar: 'https://i.pravatar.cc/150?img=1'
          },
          type: 'workout', 
          title: 'Evening Yoga', 
          description: 'Relaxing evening yoga session',
          date: '2023-11-10T19:30:00',
          metrics: { duration: '45min', type: 'Vinyasa' },
          likes: 12,
          comments: 3,
          image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        { 
          id: 2, 
          user: {
            id: 102,
            name: 'John Doe',
            avatar: 'https://i.pravatar.cc/150?img=5'
          },
          type: 'achievement', 
          title: 'Marathon Completed!', 
          description: 'Finished my first full marathon',
          date: '2023-11-09T11:20:00',
          metrics: { distance: '42.2km', time: '4h 15min' },
          likes: 45,
          comments: 8,
          image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        { 
          id: 3, 
          user: {
            id: 103,
            name: 'Major Major',
            avatar: 'https://i.pravatar.cc/150?img=3'
          },
          type: 'workout', 
          title: 'Weight Training', 
          description: 'Hit a new PR on deadlift today',
          date: '2023-11-08T16:45:00',
          metrics: { weight: '120kg', sets: 3, reps: 5 },
          likes: 18,
          comments: 4,
          image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        { 
          id: 4, 
          user: {
            id: 104,
            name: 'Laura Green',
            avatar: 'https://i.pravatar.cc/150?img=9'
          },
          type: 'goal', 
          title: 'New Challenge', 
          description: 'Starting a 30-day HIIT challenge',
          date: '2023-11-07T08:15:00',
          metrics: { duration: '30 days', difficulty: 'Intermediate' },
          likes: 8,
          comments: 2,
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        { 
          id: 5, 
          user: {
            id: 100,
            name: 'Admin',
            avatar: 'https://i.pravatar.cc/150?img=12'
          },
          type: 'achievement', 
          title: 'New Personal Record', 
          description: 'Just set a new personal best on my 10K time!',
          date: '2023-11-06T07:30:00',
          metrics: { distance: '10km', time: '42:30', pace: '4:15/km' },
          likes: 24,
          comments: 6,
          image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        }
      ];
      loading.value = false;
    }, 500);
  } catch (err) {
    error.value = 'Failed to load friend activities';
    loading.value = false;
    console.error(err);
  }
});

// Function to check if the current user is the author of an activity
const isOwnActivity = (userName: string) => {
  return userStore.currentUser() === userName;
};

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
        <p>Loading friend activities...</p>
      </div>
      
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
      </div>
      
      <div v-else-if="activities.length === 0" class="empty-state">
        <p>No friend activities to display. Add friends to see their activities here.</p>
        <button class="btn">Find Friends</button>
      </div>
      
      <div v-else class="activities-list">
        <div v-for="activity in activities" :key="activity.id" class="activity-card card">
          <div class="user-info">
            <img :src="activity.user.avatar" :alt="activity.user.name" class="user-avatar">
            <div>
              <h3 class="user-name">
                {{ activity.user.name }}
                <span v-if="isOwnActivity(activity.user.name)" class="own-activity-badge">(You)</span>
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
}

.activity-description {
  margin-bottom: 1rem;
}

.activity-metrics {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 6px;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
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

.own-activity-badge {
  font-size: 0.8rem;
  color: var(--highlight);
  margin-left: 0.5rem;
  font-weight: normal;
}
</style>