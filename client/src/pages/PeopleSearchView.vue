<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { supabaseUsers } from '../services/supabase';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  handle: string;
  isFriend: boolean;  // Changed from isAdmin to isFriend
  profilePicture?: string;
};

const page = ref('People Search');  // Changed page title
const searchQuery = ref('');  // Added for search functionality
const users = ref<User[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const authStore = useAuthStore();

// Filtered users based on search query
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(user => {
    return user.firstName.toLowerCase().includes(query) || 
           user.lastName.toLowerCase().includes(query) || 
           user.email.toLowerCase().includes(query) || 
           (user.handle && user.handle.toLowerCase().includes(query));
  });
});

// Load users function
async function loadUsers() {
  console.log('Starting to load users');
  loading.value = true;
  error.value = null;
  
  try {
    console.log('Calling supabaseUsers.getAll()');
    const response = await supabaseUsers.getAll();
    console.log('Users data received:', response);
    
    if (!response || !response.items) {
      console.error('Invalid response format:', response);
      error.value = 'Received invalid data format from server';
      loading.value = false;
      return;
    }
    
    // Assume all users are friends for this version
    users.value = response.items.map(user => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      handle: `@${user.first_name?.toLowerCase() || 'user'}`,
      isFriend: true,  // Default to true as requested
      profilePicture: user.profile_picture_url
    }));
    
    console.log(`Processed ${users.value.length} users`);
  } catch (err) {
    console.error('Error loading users:', err);
    error.value = `Failed to load users: ${err instanceof Error ? err.message : 'Unknown error'}`;
  } finally {
    loading.value = false;
    console.log('User loading complete, loading=false');
  }
}

// Load users immediately when component mounts
onMounted(() => {
  console.log('PeopleSearchView mounted - loading users immediately');
  loadUsers();
});

// Add friend function
async function addFriend(user: User) {
  try {
    // Here you would normally call an API to add a friend
    console.log(`Adding friend: ${user.firstName} ${user.lastName}`);
    
    // Update local state
    const index = users.value.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users.value[index].isFriend = true;
    }
  } catch (err) {
    console.error(`Failed to add friend:`, err);
    error.value = 'Failed to add friend. Please try again.';
  }
}

// Remove friend function
async function removeFriend(user: User) {
  try {
    // Here you would normally call an API to remove a friend
    console.log(`Removing friend: ${user.firstName} ${user.lastName}`);
    
    // Update local state
    const index = users.value.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users.value[index].isFriend = false;
    }
  } catch (err) {
    console.error(`Failed to remove friend:`, err);
    error.value = 'Failed to remove friend. Please try again.';
  }
}

function forceLoadUsers() {
  console.log('Force loading users');
  loadUsers();
}
</script>

<template>
  <main>
    <h1 class="title">{{ page }}</h1>
    
    <!-- Search bar -->
    <div class="field mb-5">
      <div class="control has-icons-left">
        <input 
          class="input" 
          type="text" 
          placeholder="Search by name, email, or handle" 
          v-model="searchQuery"
        >
        <span class="icon is-small is-left">
          <i class="fas fa-search"></i>
        </span>
      </div>
    </div>
    
    <!-- Show when loading users -->
    <div v-if="loading" class="has-text-centered my-5">
      <span class="icon is-large">
        <i class="fas fa-spinner fa-pulse"></i>
      </span>
      <p>Loading users...</p>
    </div>
    
    <div v-else-if="error" class="notification is-danger">
      <p>{{ error }}</p>
      <button class="button is-info mt-3" @click="forceLoadUsers">Try Again</button>
    </div>
    
    <div v-else-if="filteredUsers.length === 0" class="notification is-warning has-text-centered">
      <p>No users found matching your search.</p>
      <button class="button is-info mt-3" @click="forceLoadUsers">Refresh</button>
    </div>
    
    <div v-else class="table-container">
      <table class="table is-fullwidth is-striped is-hoverable">
        <thead>
          <tr>
            <th>Profile</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Handle</th>
            <th>Friend</th> <!-- Changed from Admin to Friend -->
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in filteredUsers" :key="index">
            <td>
              <div class="user-avatar-small">
                <img v-if="user.profilePicture" :src="user.profilePicture" :alt="user.firstName">
                <i v-else class="fas fa-user"></i>
              </div>
            </td>
            <td>{{ user.firstName }}</td>
            <td>{{ user.lastName }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.handle }}</td>
            <td>
              <span class="tag" :class="user.isFriend ? 'is-success' : 'is-warning'">
                {{ user.isFriend ? 'Yes' : 'No' }}
              </span>
            </td>
            <td>
              <div class="buttons">
                <button 
                  v-if="!user.isFriend" 
                  class="button is-small is-success" 
                  @click="addFriend(user)"
                >
                  <span class="icon">
                    <i class="fas fa-user-plus"></i>
                  </span>
                  <span>Add Friend</span>
                </button>
                <button 
                  v-else 
                  class="button is-small is-warning" 
                  @click="removeFriend(user)"
                >
                  <span class="icon">
                    <i class="fas fa-user-minus"></i>
                  </span>
                  <span>Unfriend</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<style scoped>
.title {
  margin-bottom: 2rem;
  text-align: center;
  color: #ffffff;
}

.table-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  margin: 0 auto;
  max-width: 1200px;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table th, .table td {
  border-right: 1px solid #dbdbdb;
  padding: 0.75em 1em;
}

.table th:last-child, .table td:last-child {
  border-right: none;
}

.table th {
  background-color: #3273dc;
  color: white;
  font-weight: bold;
  border-bottom: 2px solid #1c60c7;
}

.table tr {
  border-bottom: 1px solid #dbdbdb;
}

.table tr:last-child {
  border-bottom: none;
}

.buttons {
  justify-content: center;
}

.button {
  margin: 0 0.25rem;
  display: inline-flex;
  align-items: center;
}

.button .icon {
  margin-right: 0.25rem;
}

.tag {
  font-weight: bold;
  width: 45px;
  display: inline-flex;
  justify-content: center;
}

.tag.is-warning {
  background-color: #ffdd57;
  color: rgba(0, 0, 0, 0.7);
  border: 1px solid #ffcc00;
}

.tag.is-success {
  background-color: #48c774;
  color: #fff;
  border: 1px solid #3ab364;
}

.user-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e0e0e0;
  color: #555;
  font-size: 1.2rem;
}

.user-avatar-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media screen and (max-width: 768px) {
  .table-container {
    overflow-x: auto;
  }
  
  .buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .button {
    margin-bottom: 0.5rem;
  }
}
</style>