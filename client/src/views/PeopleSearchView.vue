<script setup lang="ts">
import { ref } from 'vue';

const page = 'People Search';

const users = ref([
  { 
    firstName: 'John', 
    lastName: 'Doe', 
    email: 'john.doe@example.com', 
    handle: '@johndoe', 
    isFriend: true 
  },
  { 
    firstName: 'Jane', 
    lastName: 'Smith', 
    email: 'jane.smith@example.com', 
    handle: '@janesmith', 
    isFriend: true 
  },
  { 
    firstName: 'Major', 
    lastName: 'Major', 
    email: 'major.major@example.com', 
    handle: '@majormajor', 
    isFriend: true 
  },
  { 
    firstName: 'Laura', 
    lastName: 'Green', 
    email: 'laura.green@example.com', 
    handle: '@lauragreen', 
    isFriend: true 
  },
  { 
    firstName: 'Administrator',
    lastName: 'User',
    email: 'admin@example.com',
    handle: '@admin', 
    isFriend: false
  }
]);


const searchQuery = ref('');


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


function addFriend(user: any) {
  user.isFriend = true;
  console.log(`Added ${user.firstName} as friend`);
}

function removeFriend(user: any) {
  if (confirm(`Are you sure you want to remove ${user.firstName} ${user.lastName} from your friends?`)) {
    user.isFriend = false;
    console.log(`Removed ${user.firstName} from friends`);
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