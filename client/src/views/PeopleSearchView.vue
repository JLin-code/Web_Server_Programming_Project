<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { userService, friendService } from '../services/api';

const page = 'People Search';

// Users state
const users = ref([]);
const loading = ref(true);
const error = ref('');
const searchQuery = ref('');
const currentUserId = ref(null);

onMounted(async () => {
  try {
    loading.value = true;
    
    // Get current user
    const userResponse = await userService.getCurrentUser();
    if (userResponse && userResponse.user) {
      currentUserId.value = userResponse.user.id;
    }
    
    // Get all users
    const response = await userService.getAll();
    
    // Get friends
    const friendsResponse = await friendService.getFriends(currentUserId.value);
    const friendIds = new Set(friendsResponse.items.map((friend: any) => friend.id));
    
    // Mark friends in the user list
    users.value = response.items.map((user: any) => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      handle: user.handle || `@${user.first_name.toLowerCase()}`,
      isFriend: friendIds.has(user.id)
    }));
    
  } catch (err) {
    error.value = 'Failed to load users';
    console.error(err);
  } finally {
    loading.value = false;
  }
});

function filteredUsers() {
  if (!searchQuery.value) {
    return users.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(user => 
    user.firstName.toLowerCase().includes(query) || 
    user.lastName.toLowerCase().includes(query) || 
    user.email.toLowerCase().includes(query) || 
    user.handle.toLowerCase().includes(query)
  );
}

async function addFriend(user: any) {
  try {
    if (!currentUserId.value) return;
    
    await friendService.addFriend(currentUserId.value, user.id);
    user.isFriend = true;
    console.log(`Added ${user.firstName} as friend`);
  } catch (err) {
    console.error(`Failed to add ${user.firstName} as friend:`, err);
  }
}

async function removeFriend(user: any) {
  if (!currentUserId.value) return;
  
  if (confirm(`Are you sure you want to remove ${user.firstName} ${user.lastName} from your friends?`)) {
    try {
      await friendService.removeFriend(currentUserId.value, user.id);
      user.isFriend = false;
      console.log(`Removed ${user.firstName} from friends`);
    } catch (err) {
      console.error(`Failed to remove ${user.firstName} from friends:`, err);
    }
  }
}
</script>

<template>
  <main class="container section">
    <h1 class="title">{{ page }}</h1>
    
    <!-- Search bar -->
    <div class="field">
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
    
    <div class="table-container">
      <table class="table is-fullwidth is-striped is-hoverable">
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Handle</th>
            <th>Friend Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in filteredUsers()" :key="index">
            <td>{{ user.firstName }}</td>
            <td>{{ user.lastName }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.handle }}</td>
            <td>
              <span class="tag" :class="user.isFriend ? 'is-success' : 'is-danger'">
                {{ user.isFriend ? 'Friend' : 'Not Friend' }}
              </span>
            </td>
            <td>
              <div class="buttons">
                <button 
                  v-if="!user.isFriend" 
                  class="button is-small is-primary" 
                  @click="addFriend(user)"
                >
                  <span class="icon">
                    <i class="fas fa-user-plus"></i>
                  </span>
                  <span>Add Friend</span>
                </button>
                <button 
                  v-else 
                  class="button is-small is-danger" 
                  @click="removeFriend(user)"
                >
                  <span class="icon">
                    <i class="fas fa-user-minus"></i>
                  </span>
                  <span>Remove</span>
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

.field {
  max-width: 500px;
  margin: 0 auto 2rem auto;
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
  width: 90px;
  display: inline-flex;
  justify-content: center;
}

.tag.is-success {
  background-color: #48c774;
  color: #fff;
  border: 1px solid #3ab364;
}

.tag.is-danger {
  background-color: #f14668;
  color: #fff;
  border: 1px solid #e02c50;
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