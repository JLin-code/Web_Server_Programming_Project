<template>
  <div class="api-health-checker">
    <h4 class="api-health-title">API Health Status</h4>
    
    <div v-if="loading" class="api-health-loading">
      <div class="spinner"></div>
      <p>Checking API endpoints...</p>
    </div>
    
    <div v-else class="api-health-results">
      <div class="api-health-summary" :class="healthSummaryClass">
        <div class="health-icon">{{ healthIcon }}</div>
        <div class="health-status">
          <p><strong>{{ healthSummary }}</strong></p>
          <p class="health-description">{{ healthDescription }}</p>
        </div>
      </div>
      
      <div v-if="showEndpoints" class="api-health-endpoints">
        <h5>Endpoint Status</h5>
        <ul>
          <li v-for="(endpoint, index) in endpoints" :key="index" 
              :class="{ 'endpoint-ok': endpoint.status === 'ok', 'endpoint-error': endpoint.status === 'error' }">
            <span class="endpoint-path">{{ endpoint.path }}</span>
            <span class="endpoint-status">
              <span v-if="endpoint.status === 'ok'" class="status-badge ok">OK</span>
              <span v-else-if="endpoint.status === 'error'" class="status-badge error">{{ endpoint.code || 'ERROR' }}</span>
              <span v-else class="status-badge unknown">?</span>
            </span>
          </li>
        </ul>
      </div>
    </div>
    
    <div class="api-health-actions">
      <button @click="checkAllEndpoints" :disabled="loading" class="check-api-button">
        {{ loading ? 'Checking...' : 'Check API Health' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ApiHealthChecker',
  props: {
    endpointsToCheck: {
      type: Array,
      default: () => [
        '/api/v1/health',
        '/api/v1/health/ping',
        '/api/v1/auth/current-user', 
        '/api/v1'
      ]
    },
    showEndpoints: {
      type: Boolean,
      default: true
    },
    autoCheck: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      endpoints: [],
      loading: false,
      lastCheck: null
    };
  },
  computed: {
    healthSummary() {
      const totalCount = this.endpoints.length;
      const okCount = this.endpoints.filter(e => e.status === 'ok').length;
      
      if (totalCount === 0) return 'Not Checked';
      if (okCount === totalCount) return 'All Endpoints OK';
      if (okCount === 0) return 'All Endpoints Failed';
      return `${okCount}/${totalCount} Endpoints OK`;
    },
    healthDescription() {
      const totalCount = this.endpoints.length;
      const okCount = this.endpoints.filter(e => e.status === 'ok').length;
      
      if (totalCount === 0) return 'Click the button below to check API health';
      if (okCount === totalCount) return 'All API endpoints are responding correctly';
      if (okCount === 0) return 'All API endpoints are failing. The server may be down.';
      
      if (this.endpoints.find(e => e.path === '/api/v1/health')?.status === 'ok') {
        return 'The API server is running but some endpoints are failing';
      }
      
      return 'Some API endpoints are responding, but there may be issues';
    },
    healthSummaryClass() {
      const totalCount = this.endpoints.length;
      const okCount = this.endpoints.filter(e => e.status === 'ok').length;
      
      if (totalCount === 0) return 'status-unknown';
      if (okCount === totalCount) return 'status-ok';
      if (okCount === 0) return 'status-error';
      return 'status-partial';
    },
    healthIcon() {
      const totalCount = this.endpoints.length;
      const okCount = this.endpoints.filter(e => e.status === 'ok').length;
      
      if (totalCount === 0) return '❓';
      if (okCount === totalCount) return '✅';
      if (okCount === 0) return '❌';
      return '⚠️';
    }
  },
  mounted() {
    if (this.autoCheck) {
      this.checkAllEndpoints();
    }
  },
  methods: {
    async checkAllEndpoints() {
      this.loading = true;
      this.endpoints = [];
      
      try {
        for (const path of this.endpointsToCheck) {
          await this.checkEndpoint(path);
        }
      } finally {
        this.loading = false;
        this.lastCheck = new Date();
        this.$emit('check-complete', {
          summary: this.healthSummary,
          endpoints: this.endpoints,
          timestamp: this.lastCheck
        });
      }
    },
    
    async checkEndpoint(path) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const startTime = Date.now();
        const response = await fetch(path, {
          method: 'HEAD',
          cache: 'no-store',
          signal: controller.signal
        });
        const endTime = Date.now();
        
        clearTimeout(timeoutId);
        
        this.endpoints.push({
          path,
          status: response.ok ? 'ok' : 'error',
          code: response.status,
          latency: endTime - startTime
        });
      } catch (error) {
        this.endpoints.push({
          path,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }
};
</script>

<style scoped>
.api-health-checker {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.api-health-title {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.api-health-loading {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
  margin-right: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.api-health-summary {
  display: flex;
  align-items: center;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 6px;
}

.status-unknown {
  background-color: rgba(128, 128, 128, 0.2);
}

.status-ok {
  background-color: rgba(72, 199, 142, 0.2);
}

.status-error {
  background-color: rgba(255, 56, 96, 0.2);
}

.status-partial {
  background-color: rgba(255, 204, 0, 0.2);
}

.health-icon {
  font-size: 1.5rem;
  margin-right: 1rem;
}

.health-status p {
  margin: 0;
}

.health-description {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 0.25rem;
}

.api-health-endpoints {
  margin-bottom: 1rem;
}

.api-health-endpoints h5 {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.api-health-endpoints ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.api-health-endpoints li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  margin-bottom: 0.25rem;
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: rgba(0, 0, 0, 0.1);
}

.endpoint-ok {
  border-left: 3px solid #48c78e;
}

.endpoint-error {
  border-left: 3px solid #ff3860;
}

.endpoint-path {
  font-family: monospace;
}

.status-badge {
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status-badge.ok {
  background-color: #48c78e;
  color: white;
}

.status-badge.error {
  background-color: #ff3860;
  color: white;
}

.status-badge.unknown {
  background-color: #888;
  color: white;
}

.api-health-actions {
  display: flex;
  justify-content: center;
}

.check-api-button {
  background-color: #485fc7;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.check-api-button:hover:not(:disabled) {
  background-color: #3e56c4;
}

.check-api-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
