<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { userService } from '../services'; // Updated import path
import { friendsService as friendService } from '../services/friendsApi';
import { supabaseUsers } from '../services/supabase';

const page = 'People Search';

// Users state
interface User {
  id: string; 
  firstName: string; 
  lastName: string; 
  email: string; 
  handle: string;
  profilePicture?: string;
  isFriend: boolean; 
}

const users = ref<User[]>([]);
const loading = ref(true);
const error = ref('');
const searchQuery = ref('');
const currentUserId = ref<string | null>(null);

onMounted(async () => {
  try {
    loading.value = true;
    
    // Get current user
    const userResponse = await userService.getUserById('current');
    if (userResponse && userResponse.user) {
      currentUserId.value = userResponse.user.id;
    }
    
    // Get all users - first try Supabase direct
    let userList;
    try {
      const { data } = await supabaseUsers.getAll();
      userList = data?.map(user => ({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        profile_picture_url: user.profile_picture_url,
        handle: user.handle || `@${user.first_name.toLowerCase()}`,
        role: user.role || 'user'
      }));
    } catch (error) {
      console.error('Failed to fetch users from Supabase:', error);
      // Fall back to API
      const response = await userService.getUsers();
      userList = response.items;
    }
    
    // Get friends
    let friendIds = new Set<string>();
    if (currentUserId.value !== null) {
      const friendsResponse = await friendService.getFriends(currentUserId.value.toString());
      friendIds = new Set(friendsResponse.items.map((friend: { id: string }) => friend.id));
    }
    
    // Mark friends in the user list
    users.value = userList.map((user: any) => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      profilePicture: user.profile_picture_url,
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

// Add friend function
async function addFriend(user: User) {
  if (!currentUserId.value) {
    console.error("Current user not authenticated");
    return;
  }
  
  try {
    await friendService.addFriend(currentUserId.value.toString(), user.id.toString());
    user.isFriend = true;
    console.log(`Added ${user.firstName} as friend`);
  } catch (err) {
    console.error(`Failed to add ${user.firstName} as friend:`, err);
  }
}

// Remove friend function
async function removeFriend(user: User) {
  if (!currentUserId.value) {
    console.error("Current user not authenticated");
    return;
  }
  
  try {
    await friendService.removeFriend(currentUserId.value.toString(), user.id.toString());
    user.isFriend = false;
    console.log(`Removed ${user.firstName} from friends`);
  } catch (err) {
    console.error(`Failed to remove ${user.firstName} from friends:`, err);
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
            <th>Profile</th>
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