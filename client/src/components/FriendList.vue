<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { friendService, userService } from '../services/api';

// State
const friends = ref<any[]>([]);
const loading = ref(true);
const error = ref('');
const searchQuery = ref('');

// Get user's friends
const loadFriends = async () => {
  loading.value = true;
  try {
    const response = await friendService.getFriends();
    friends.value = response.items || [];
  } catch (err: any) {
    console.error('Failed to load friends:', err);
    error.value = err.message || 'Failed to load friends';
  } finally {
    loading.value = false;
  }
};

// Filtered friends based on search
const filteredFriends = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return friends.value;
  
  return friends.value.filter(friend => 
    friend.first_name.toLowerCase().includes(query) || 
    friend.last_name.toLowerCase().includes(query) || 
    friend.handle.toLowerCase().includes(query) ||
    friend.email.toLowerCase().includes(query)
  );
});

// Remove a friend
const removeFriend = async (friendId: string | number) => {
  if (!confirm('Are you sure you want to remove this friend?')) return;
  
  try {
    await friendService.removeFriend(friendId);
    // Update the list after removing
    friends.value = friends.value.filter(friend => friend.id !== friendId);
  } catch (err: any) {
    console.error('Failed to remove friend:', err);
    error.value = err.message || 'Failed to remove friend';
  }
};

// Initialize component
onMounted(() => {
  loadFriends();
});
</script>

<template>
  <div class="friend-list">
    <h2 class="title">My Friends</h2>
    
    <div class="search-bar">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search friends..."
        class="search-input"
      />
    </div>
    
    <div v-if="loading" class="loading">
      <p>Loading friends...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="friends.length === 0" class="empty-state">
      <p>You don't have any friends yet.</p>
      <p>Go to the People Search page to find friends!</p>
    </div>
    
    <div v-else class="friends-container">
      <div v-for="friend in filteredFriends" :key="friend.id" class="friend-card">
        <img
          :src="friend.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.first_name + ' ' + friend.last_name)}`"
          :alt="friend.first_name + ' ' + friend.last_name"
          class="friend-avatar"
        />
        
        <div class="friend-info">
          <h3 class="friend-name">{{ friend.first_name }} {{ friend.last_name }}</h3>
          <p class="friend-handle">{{ friend.handle }}</p>
        </div>
        
        <button @click="removeFriend(friend.id)" class="remove-button">
          <span class="icon">
            <i class="fas fa-user-minus"></i>
          </span>
          <span>Remove</span>
        </button>
      </div>
    </div>
    
    <div v-if="filteredFriends.length === 0 && friends.length > 0" class="no-results">
      <p>No friends match your search.</p>
    </div>
  </div>
</template>

<style scoped>
.friend-list {
  max-width: 800px;
  margin: 0 auto;
}

.title {
  margin-bottom: 1.5rem;
}

.search-bar {
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 10px 15px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
}

.loading, .error, .empty-state, .no-results {
  text-align: center;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.error {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.friends-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.friend-card {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.friend-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.friend-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 15px;
}

.friend-info {
  flex-grow: 1;
}

.friend-name {
  font-size: 1.1rem;
  margin: 0 0 4px;
}

.friend-handle {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.remove-button {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-button:hover {
  background-color: #ff7875;
}

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
