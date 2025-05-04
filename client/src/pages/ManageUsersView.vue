<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { supabaseUsers } from '../services/supabase';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  handle: string;
  role: string;
  isAdmin: boolean;
  profilePicture?: string;
};

const page = ref('Manage Users');
const users = ref<User[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Form for editing user
const isEditing = ref(false);
const editingUser = ref<User | null>(null);
const userForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  role: 'user'
});

// For modal
const isModalActive = ref(false);

const authStore = useAuthStore();

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
    
    users.value = response.items.map(user => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      handle: `@${user.first_name?.toLowerCase() || 'user'}`,
      role: user.role,
      isAdmin: user.role === 'admin',
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
  console.log('ManageUsersView mounted - loading users immediately');
  loadUsers();
});

function openEditModal(user: User) {
  editingUser.value = user;
  userForm.value.firstName = user.firstName;
  userForm.value.lastName = user.lastName;
  userForm.value.email = user.email;
  userForm.value.role = user.role;
  isEditing.value = true;
  isModalActive.value = true;
}

async function saveUser() {
  if (!editingUser.value) return;
  
  try {
    loading.value = true;
    const updatedUserData = {
      first_name: userForm.value.firstName,
      last_name: userForm.value.lastName,
      email: userForm.value.email,
      role: userForm.value.role
    };
    
    await supabaseUsers.update(editingUser.value.id, updatedUserData);
    
    // Update local data
    const index = users.value.findIndex(u => u.id === editingUser.value?.id);
    if (index !== -1) {
      users.value[index].firstName = userForm.value.firstName;
      users.value[index].lastName = userForm.value.lastName;
      users.value[index].email = userForm.value.email;
      users.value[index].role = userForm.value.role;
      users.value[index].isAdmin = userForm.value.role === 'admin';
      users.value[index].handle = `@${userForm.value.firstName.toLowerCase()}`;
    }
    
    closeModal();
  } catch (err) {
    console.error('Failed to update user:', err);
    error.value = 'Failed to update user. Please try again.';
  } finally {
    loading.value = false;
  }
}

function closeModal() {
  isModalActive.value = false;
  isEditing.value = false;
  editingUser.value = null;
}

async function deleteUser(user: User) {
  if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
    try {
      loading.value = true;
      await supabaseUsers.delete(user.id);
      users.value = users.value.filter(u => u.id !== user.id);
    } catch (err) {
      console.error(`Failed to delete user:`, err);
      error.value = 'Failed to delete user. Please try again.';
    } finally {
      loading.value = false;
    }
  }
}

async function toggleAdminStatus(user: User) {
  try {
    loading.value = true;
    const newRole = user.isAdmin ? 'user' : 'admin';
    await supabaseUsers.changeRole(user.id, newRole);
    
    // Update local state
    const index = users.value.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users.value[index].role = newRole;
      users.value[index].isAdmin = newRole === 'admin';
    }
  } catch (err) {
    console.error(`Failed to change role for user:`, err);
    error.value = 'Failed to change user role. Please try again.';
  } finally {
    loading.value = false;
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
    
    <div v-else-if="users.length === 0" class="notification is-warning has-text-centered">
      <p>No users found in the system.</p>
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
            <th>Admin</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in users" :key="index">
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
              <span class="tag" :class="user.isAdmin ? 'is-success' : 'is-warning'">
                {{ user.isAdmin ? 'Yes' : 'No' }}
              </span>
            </td>
            <td>
              <div class="buttons">
                <button class="button is-small is-info" @click="openEditModal(user)">
                  <span class="icon">
                    <i class="fas fa-edit"></i>
                  </span>
                  <span>Edit</span>
                </button>
                <button 
                  class="button is-small" 
                  :class="user.isAdmin ? 'is-warning' : 'is-success'"
                  @click="toggleAdminStatus(user)"
                >
                  <span class="icon">
                    <i class="fas" :class="user.isAdmin ? 'fa-user-minus' : 'fa-user-shield'"></i>
                  </span>
                  <span>{{ user.isAdmin ? 'Remove Admin' : 'Make Admin' }}</span>
                </button>
                <button class="button is-small is-danger" @click="deleteUser(user)">
                  <span class="icon">
                    <i class="fas fa-trash-alt"></i>
                  </span>
                  <span>Delete</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Edit User Modal -->
    <div class="modal" :class="{ 'is-active': isModalActive }">
      <div class="modal-background" @click="closeModal"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Edit User</p>
          <button class="delete" aria-label="close" @click="closeModal"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">First Name</label>
            <div class="control">
              <input class="input" type="text" v-model="userForm.firstName">
            </div>
          </div>
          
          <div class="field">
            <label class="label">Last Name</label>
            <div class="control">
              <input class="input" type="text" v-model="userForm.lastName">
            </div>
          </div>
          
          <div class="field">
            <label class="label">Email</label>
            <div class="control">
              <input class="input" type="email" v-model="userForm.email">
            </div>
          </div>
          
          <div class="field">
            <label class="label">Role</label>
            <div class="control">
              <div class="select">
                <select v-model="userForm.role">
                  <option value="user">Regular User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-success" @click="saveUser">Save changes</button>
          <button class="button" @click="closeModal">Cancel</button>
        </footer>
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