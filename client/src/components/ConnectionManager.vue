<template>
  <div v-if="show" class="connection-manager" :class="statusClass">
    <div class="connection-icon" :class="statusClass"></div>
    <div class="connection-details">
      <div class="connection-status">{{ statusMessage }}</div>
      <div v-if="showDetails" class="connection-info">{{ detailMessage }}</div>
    </div>
    <div class="connection-actions">
      <button v-if="canRetry" @click="checkConnection" class="retry-btn">
        <span class="retry-icon">↻</span> Retry
      </button>
      <button v-if="showDiagnostics" @click="showDiagnosticsPanel = !showDiagnosticsPanel" class="diagnostics-btn">
        Diagnostics
      </button>
    </div>
    
    <div v-if="showDiagnosticsPanel" class="diagnostics-panel">
      <h4>Connection Diagnostics</h4>
      <pre>{{ diagnosticsInfo }}</pre>
      <div class="endpoint-checks" v-if="endpointChecks.length > 0">
        <h5>Endpoint Checks:</h5>
        <ul>
          <li v-for="(check, index) in endpointChecks" :key="index" :class="{'endpoint-ok': check.available, 'endpoint-error': !check.available}">
            {{ check.endpoint }}: {{ check.available ? 'Available' : 'Error ' + (check.statusCode || check.error) }}
          </li>
        </ul>
      </div>
      <button @click="runFullDiagnostics" class="diagnostics-run-btn">Run Full Diagnostics</button>
      <button @click="showDiagnosticsPanel = false" class="close-btn">Close</button>
    </div>
  </div>
</template>

<script>
import { checkServerHealth, diagnoseServerConnection, checkApiEndpoint, fallbackHealthCheck } from '@/utils/serverHealth';

export default {
  name: 'ConnectionManager',
  props: {
    showByDefault: {
      type: Boolean,
      default: false
    },
    checkIntervalSeconds: {
      type: Number,
      default: 30
    },
    criticalEndpoints: {
      type: Array,
      default: () => ['/api/v1/auth/current-user', '/api/v1/health']
    }
  },
  data() {
    return {
      status: 'unknown',  // unknown, online, offline, error, limited
      show: this.showByDefault,
      lastCheck: null,
      error: null,
      checkInterval: null,
      diagnostics: null,
      showDiagnosticsPanel: false,
      endpointChecks: [],
      isChecking: false
    };
  },
  computed: {
    statusClass() {
      return {
        'status-online': this.status === 'online',
        'status-offline': this.status === 'offline',
        'status-error': this.status === 'error',
        'status-limited': this.status === 'limited',
        'status-unknown': this.status === 'unknown'
      };
    },
    statusMessage() {
      switch(this.status) {
        case 'online': return 'Connected to server';
        case 'offline': return 'Connection lost';
        case 'error': return 'Server error';
        case 'limited': return 'Limited connectivity';
        default: return 'Checking connection...';
      }
    },
    detailMessage() {
      if (this.error) {
        return `Error: ${this.error}`;
      }
      if (this.status === 'limited') {
        return 'Some API features may be unavailable';
      }
      if (this.lastCheck) {
        return `Last checked: ${new Date(this.lastCheck).toLocaleTimeString()}`;
      }
      return '';
    },
    showDetails() {
      return this.error || this.status === 'limited' || this.lastCheck;
    },
    canRetry() {
      return this.status !== 'online' && !this.isChecking;
    },
    showDiagnostics() {
      return this.status !== 'online';
    },
    diagnosticsInfo() {
      if (!this.diagnostics) return 'No diagnostic info available';
      return JSON.stringify(this.diagnostics, null, 2);
    }
  },
  mounted() {
    // Initial check
    this.checkConnection();
    
    // Register event listeners
    window.addEventListener('online', this.handleOnlineEvent);
    window.addEventListener('offline', this.handleOfflineEvent);
    
    // Set up automatic checking
    this.checkInterval = setInterval(
      this.checkConnection, 
      this.checkIntervalSeconds * 1000
    );
  },
  beforeUnmount() {
    // Clean up
    window.removeEventListener('online', this.handleOnlineEvent);
    window.removeEventListener('offline', this.handleOfflineEvent);
    clearInterval(this.checkInterval);
  },
  methods: {
    async checkConnection() {
      // Avoid multiple simultaneous checks
      if (this.isChecking) return;
      this.isChecking = true;
      
      try {
        // Check server health
        const health = await checkServerHealth();
        this.lastCheck = new Date();
        
        if (health.online) {
          this.status = 'online';
          this.error = null;
          // Auto-hide after 5 seconds if everything is OK
          if (this.show && !this.showByDefault) {
            setTimeout(() => {
              this.show = false;
            }, 5000);
          }
        } else if (health.serverError) {
          this.status = 'error';
          this.error = health.error;
          this.show = true;
          // Try fallback methods
          await this.tryFallbackMethods();
        } else {
          this.status = 'offline';
          this.error = health.error;
          this.show = true;
          // Try fallback methods
          await this.tryFallbackMethods();
        }
      } catch (e) {
        this.status = 'offline';
        this.error = e.message;
        this.show = true;
      } finally {
        this.isChecking = false;
      }
    },
    
    async tryFallbackMethods() {
      try {
        const fallback = await fallbackHealthCheck();
        if (fallback.online) {
          if (fallback.limited) {
            this.status = 'limited';
          } else {
            // API is reachable through alternative means
            this.status = 'limited';
          }
        }
      } catch (error) {
        console.error('Fallback health check failed:', error);
      }
    },
    
    async runFullDiagnostics() {
      this.diagnostics = {
        status: 'Running diagnostics...',
        timestamp: new Date().toISOString()
      };
      
      try {
        // Run connection diagnostics
        const diagnosticInfo = await diagnoseServerConnection();
        this.diagnostics = diagnosticInfo;
        
        // Check critical endpoints
        this.endpointChecks = [];
        for (const endpoint of this.criticalEndpoints) {
          const check = await checkApiEndpoint(endpoint);
          this.endpointChecks.push({
            endpoint,
            ...check
          });
        }
      } catch (error) {
        this.diagnostics.error = error.message;
      }
    },
    
    handleOnlineEvent() {
      if (this.status !== 'online') {
        this.checkConnection();
      }
    },
    
    handleOfflineEvent() {
      this.status = 'offline';
      this.error = 'Browser is offline';
      this.show = true;
    }
  }
};
</script>

<style scoped>
.connection-manager {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1000;
  max-width: 400px;
  transition: all 0.3s ease;
}

.connection-icon {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-online .connection-icon {
  background-color: #4CAF50;
  box-shadow: 0 0 8px #4CAF50;
}

.status-offline .connection-icon {
  background-color: #F44336;
  box-shadow: 0 0 8px #F44336;
}

.status-error .connection-icon {
  background-color: #FF9800;
  box-shadow: 0 0 8px #FF9800;
}

.status-limited .connection-icon {
  background-color: #FFC107;
  box-shadow: 0 0 8px #FFC107;
}

.status-unknown .connection-icon {
  background-color: #9E9E9E;
}

.connection-details {
  flex: 1;
  min-width: 0;
  font-size: 14px;
}

.connection-status {
  font-weight: 500;
}

.connection-info {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.connection-actions {
  display: flex;
  gap: 8px;
}

.retry-btn, .diagnostics-btn, .close-btn, .diagnostics-run-btn {
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover, .diagnostics-btn:hover, .close-btn:hover, .diagnostics-run-btn:hover {
  background-color: #f0f0f0;
}

.retry-icon {
  display: inline-block;
  margin-right: 3px;
}

.diagnostics-panel {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  padding: 16px;
  width: 350px;
  max-height: 400px;
  overflow-y: auto;
}

.diagnostics-panel h4 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 16px;
}

.diagnostics-panel pre {
  font-size: 11px;
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
  margin: 8px 0;
}

.endpoint-checks {
  margin-top: 12px;
}

.endpoint-checks h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
}

.endpoint-checks ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.endpoint-checks li {
  padding: 4px;
  margin-bottom: 4px;
  border-radius: 3px;
  font-size: 12px;
}

.endpoint-ok {
  background-color: rgba(76, 175, 80, 0.1);
}

.endpoint-error {
  background-color: rgba(244, 67, 54, 0.1);
}

.close-btn {
  margin-left: 8px;
}
</style>
