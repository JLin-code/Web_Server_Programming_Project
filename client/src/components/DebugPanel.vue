<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { authService } from '../services/api';

const isOpen = ref(false);
const authStatus = ref('Checking...');
const apiStatus = ref('Checking...');

onMounted(async () => {
  // Check auth status
  try {
    const user = await authService.getCurrentUser();
    authStatus.value = user ? `Logged in as ${user.user.first_name} ${user.user.last_name}` : 'Not logged in';
  } catch (err) {
    authStatus.value = `Auth error: ${err.message}`;
  }
  
  // Check API status
  try {
    const response = await fetch('/api/v1');
    if (response.ok) {
      apiStatus.value = 'Connected';
    } else {
      apiStatus.value = `Error: ${response.status} ${response.statusText}`;
    }
  } catch (err) {
    apiStatus.value = `Connection error: ${err.message}`;
  }
});

const togglePanel = () => {
  isOpen.value = !isOpen.value;
};
</script>

<template>
  <div class="debug-container">
    <button @click="togglePanel" class="debug-toggle">
      Debug
    </button>
    <div v-if="isOpen" class="debug-panel">
      <h3>Debug Information</h3>
      <div class="debug-item">
        <strong>Auth Status:</strong> {{ authStatus }}
      </div>
      <div class="debug-item">
        <strong>API Status:</strong> {{ apiStatus }}
      </div>
      <div class="debug-item">
        <strong>Base URL:</strong> {{ window.location.origin }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.debug-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}

.debug-toggle {
  background: #ff5555;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.debug-panel {
  position: absolute;
  bottom: 40px;
  right: 0;
  width: 300px;
  background: #333;
  color: white;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0,0,0,0.5);
}

.debug-item {
  margin-bottom: 10px;
}
</style>
