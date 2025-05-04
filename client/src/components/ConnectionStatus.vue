<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { supabase } from '../services/supabase';
import { checkSupabaseConnection } from '../utils/networkDiagnostics';

// Component state
const isVisible = ref(false);
const status = ref('checking');
const message = ref('Checking connection...');
const retryCount = ref(0);
const interval = ref(null);

// Connection check function
async function checkConnection() {
  try {
    console.log('Running connection health check...');
    const result = await checkSupabaseConnection(supabase);
    
    if (result.reachable) {
      status.value = 'connected';
      message.value = `Connected (${result.latency}ms)`;
      isVisible.value = false;
      retryCount.value = 0;
    } else {
      status.value = 'error';
      message.value = result.error || 'Connection issue detected';
      isVisible.value = true;
      retryCount.value++;
    }
  } catch (err) {
    status.value = 'error';
    message.value = err.message || 'Connection check failed';
    isVisible.value = true;
    retryCount.value++;
  }
}

// Attempt to reconnect manually
async function reconnect() {
  status.value = 'checking';
  message.value = 'Reconnecting...';
  
  try {
    // Clear session and try refreshing
    await supabase.auth.refreshSession();
    await checkConnection();
  } catch (err) {
    status.value = 'error';
    message.value = 'Reconnection failed. Please try again.';
  }
}

// Setup connection monitoring
onMounted(() => {
  // Initial check
  checkConnection();
  
  // Set up periodic checks
  interval.value = setInterval(() => {
    if (retryCount.value < 5 || retryCount.value % 10 === 0) {
      checkConnection();
    }
  }, 15000); // Check every 15 seconds
});

// Clean up
onBeforeUnmount(() => {
  if (interval.value) {
    clearInterval(interval.value);
  }
});
</script>

<template>
  <transition name="fade">
    <div v-if="isVisible" class="connection-status" :class="status">
      <div class="message">
        <span v-if="status === 'checking'" class="icon">
          <i class="fas fa-circle-notch fa-spin"></i>
        </span>
        <span v-else-if="status === 'error'" class="icon">
          <i class="fas fa-exclamation-triangle"></i>
        </span>
        <span v-else class="icon">
          <i class="fas fa-check-circle"></i>
        </span>
        {{ message }}
      </div>
      <div class="actions">
        <button v-if="status === 'error'" @click="reconnect" class="button is-small">
          Reconnect
        </button>
        <button @click="isVisible = false" class="button is-small">
          Dismiss
        </button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.connection-status {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 10px 15px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 200px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  z-index: 1000;
  color: white;
}

.connection-status.checking {
  background-color: #3498db;
}

.connection-status.connected {
  background-color: #2ecc71;
}

.connection-status.error {
  background-color: #e74c3c;
}

.message {
  display: flex;
  align-items: center;
}

.icon {
  margin-right: 8px;
}

.actions {
  margin-left: 15px;
}

.button {
  margin-left: 5px;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
