<script setup lang="ts">
import { ref } from 'vue';

const page = ref('Manage Users');

// Mock user data for the table
const users = ref([
  { 
    firstName: 'Admin', 
    lastName: 'User', 
    email: 'admin@example.com', 
    handle: '@admin', 
    isAdmin: true 
  },
  { 
    firstName: 'John', 
    lastName: 'Doe', 
    email: 'john.doe@example.com', 
    handle: '@johndoe', 
    isAdmin: false 
  },
  { 
    firstName: 'Jane', 
    lastName: 'Smith', 
    email: 'jane.smith@example.com', 
    handle: '@janesmith', 
    isAdmin: false 
  },
  { 
    firstName: 'Major', 
    lastName: 'Major', 
    email: 'major.major@example.com', 
    handle: '@majormajor', 
    isAdmin: false 
  },
  { 
    firstName: 'Laura', 
    lastName: 'Green', 
    email: 'laura.green@example.com', 
    handle: '@lauragreen', 
    isAdmin: false 
  }
]);

// Placeholder functions for the buttons
function editUser(user: any) {
  console.log('Edit user:', user);
  alert(`Editing user: ${user.firstName} ${user.lastName}`);
}

function deleteUser(user: any) {
  console.log('Delete user:', user);
  if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
    console.log('User deleted (mock)');
  }
}
</script>

<template>
  <main>
    <h1 class="title">{{ page }}</h1>
    
    <div class="table-container">
      <table class="table is-fullwidth is-striped is-hoverable">
        <thead>
          <tr>
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
                <button class="button is-small is-info" @click="editUser(user)">
                  <span class="icon">
                    <i class="fas fa-edit"></i>
                  </span>
                  <span>Edit</span>
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