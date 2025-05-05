<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const pageTitle = 'My Profile';
const loading = ref(false);

onMounted(() => {
  console.log('Profile page loaded');
});
</script>

<template>
  <main>
    <div class="container">
      <h1 class="title">{{ pageTitle }}</h1>
      
      <div v-if="authStore.user" class="profile-container">
        <div class="card">
          <div class="card-content">
            <div class="content">
              <h2 class="subtitle">User Information</h2>
              <div class="field">
                <label class="label">Name</label>
                <div class="control">
                  <p>{{ authStore.fullName }}</p>
                </div>
              </div>
              
              <div class="field">
                <label class="label">Email</label>
                <div class="control">
                  <p>{{ authStore.user.email }}</p>
                </div>
              </div>
              
              <div class="field">
                <label class="label">Role</label>
                <div class="control">
                  <p>{{ authStore.user.role || 'User' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="notification is-warning">
        Please log in to view your profile.
      </div>
    </div>
  </main>
</template>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 0 auto;
}

.card {
  margin-top: 2rem;
}
</style>
