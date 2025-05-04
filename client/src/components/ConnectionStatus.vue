<template>
  <div v-if="!isConnected || !isApiOnline" class="connection-status" :class="statusClass">
    <div class="status-indicator"></div>
    <span class="status-text">{{ statusText }}</span>
    <button v-if="showRetry" @click="checkConnections" class="retry-btn">
      <span class="retry-icon">↻</span> Retry
    </button>
  </div>
</template>

<script>
import { healthService } from '@/services/api';

export default {
  name: 'ConnectionStatus',
  data() {
    return {
      isConnected: navigator.onLine,
      isApiOnline: true,
      isChecking: false,
      showRetry: false
    };
  },
  computed: {
    statusClass() {
      if (!this.isConnected) return 'offline';
      return this.isApiOnline ? 'online' : 'api-offline';
    },
    statusText() {
      if (this.isChecking) return 'Checking connection...';
      if (!this.isConnected) return 'You are offline';
      return this.isApiOnline ? 'Connected' : 'API server is unavailable';
    }
  },
  mounted() {
    window.addEventListener('online', this.updateConnectionStatus);
    window.addEventListener('offline', this.updateConnectionStatus);
    
    // Initial check
    this.checkConnections();
    
    // Regular check every 30 seconds
    this.healthInterval = setInterval(this.checkConnections, 30000);
  },
  beforeUnmount() {
    window.removeEventListener('online', this.updateConnectionStatus);
    window.removeEventListener('offline', this.updateConnectionStatus);
    clearInterval(this.healthInterval);
  },
  methods: {
    updateConnectionStatus() {
      this.isConnected = navigator.onLine;
      if (this.isConnected) {
        this.checkApiHealth();
      } else {
        this.isApiOnline = false;
        this.showRetry = true;
      }
    },
    async checkConnections() {
      this.isChecking = true;
      this.showRetry = false;
      this.isConnected = navigator.onLine;
      
      if (this.isConnected) {
        await this.checkApiHealth();
      }
      
      this.isChecking = false;
      this.showRetry = !this.isConnected || !this.isApiOnline;
    },
    async checkApiHealth() {
      try {
        const health = await healthService.checkApiHealth();
        this.isApiOnline = health.online;
      } catch (error) {
        console.error('Error checking API health:', error);
        this.isApiOnline = false;
      }
    }
  }
};
</script>

<style scoped>
.connection-status {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 4px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  margin-bottom: 10px;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
}

.offline .status-indicator {
  background-color: #dc3545;
}

.api-offline .status-indicator {
  background-color: #ffc107;
}

.online .status-indicator {
  background-color: #28a745;
}

.status-text {
  flex: 1;
}

.retry-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.retry-btn:hover {
  background-color: #5a6268;
}

.retry-icon {
  margin-right: 4px;
  font-size: 14px;
}
</style>
