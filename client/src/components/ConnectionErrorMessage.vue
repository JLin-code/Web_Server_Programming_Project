<template>
  <div class="connection-error-container">
    <div class="connection-error-message" :class="connectionStatusClass">
      <div class="connection-error-icon">
        <i v-if="connectionStatus === 'offline'" class="fas fa-wifi-slash"></i>
        <i v-else-if="connectionStatus === 'limited'" class="fas fa-exclamation-triangle"></i>
        <i v-else-if="connectionStatus === 'error'" class="fas fa-exclamation-circle"></i>
      </div>
      
      <div class="connection-error-content">
        <h3 class="connection-error-title">
          <template v-if="connectionStatus === 'offline'">Offline</template>
          <template v-else-if="connectionStatus === 'limited'">Limited Connectivity</template>
          <template v-else-if="connectionStatus === 'error'">Connection Error</template>
        </h3>
        
        <div class="connection-error-description">
          <p v-if="connectivityMessage">{{ connectivityMessage }}</p>
          <p v-else-if="errorMessage">{{ errorMessage }}</p>
          <p v-else>
            Showing sample data because we couldn't connect to the server.
            This could be due to:
          </p>
          
          <ul v-if="!connectivityMessage && !errorMessage">
            <li>The server is currently offline or restarting</li>
            <li>Your internet connection is unstable</li>
            <li>Database authentication issues</li>
          </ul>
          
          <!-- API issue hint for limited connectivity -->
          <div v-if="connectionStatus === 'limited'" class="api-issue-hint">
            <p><strong>Common API Issues:</strong></p>
            <ul>
              <li>API endpoints may be experiencing errors</li>
              <li>Server might be running but some services are unavailable</li>
              <li>Authentication services may be down</li>
              <li>Database connection issues on the server</li>
            </ul>
            
            <p><em>The application will continue to function with limited capabilities.</em></p>
          </div>
        </div>
        
        <div class="connection-error-actions">
          <button 
            @click="onRetry" 
            class="button retry-button"
            :disabled="isDiagnosticsRunning"
          >
            <i class="fas fa-sync-alt"></i> Retry Connection
          </button>
          
          <button 
            v-if="showDetails && !diagnostics" 
            @click="onRunDiagnostics" 
            class="button diagnostic-button"
            :class="{'is-loading': isDiagnosticsRunning}"
            :disabled="isDiagnosticsRunning"
          >
            <i class="fas fa-stethoscope"></i> Run Diagnostics
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="showDetails && diagnostics" class="connection-diagnostics">
      <h4>Connection Diagnostics:</h4>
      
      <div class="diagnostics-details">
        <div class="diagnostic-item">
          <span class="diagnostic-label">Browser Online:</span>
          <span :class="diagnostics.browserOnline ? 'status-ok' : 'status-error'">
            {{ diagnostics.browserOnline ? 'Yes' : 'No' }}
          </span>
        </div>
        
        <div class="diagnostic-item" v-if="diagnostics.connectionType">
          <span class="diagnostic-label">Connection Type:</span>
          <span>{{ diagnostics.connectionType }}</span>
        </div>
        
        <div class="diagnostic-item">
          <span class="diagnostic-label">Server Reachable:</span>
          <span :class="diagnostics.serverReachable ? 'status-ok' : 'status-error'">
            {{ diagnostics.serverReachable ? 'Yes' : 'No' }}
          </span>
        </div>
        
        <div class="diagnostic-item">
          <span class="diagnostic-label">Internet Connectivity:</span>
          <span :class="diagnostics.internetConnectivity ? 'status-ok' : 'status-error'">
            {{ diagnostics.internetConnectivity ? 'Yes' : 'No' }}
          </span>
        </div>
      </div>
      
      <div v-if="diagnostics.possibleIssues && diagnostics.possibleIssues.length" class="possible-issues">
        <h5>Possible Issues:</h5>
        <p v-for="(issue, index) in diagnostics.possibleIssues" :key="index">
          {{ issue }}
        </p>
      </div>
      
      <div v-if="endpointChecks && endpointChecks.length" class="endpoint-checks">
        <h5>Endpoint Checks:</h5>
        <div class="endpoint-item" v-for="(check, index) in endpointChecks" :key="index">
          <span class="endpoint-url">{{ check.endpoint }}</span>
          <span :class="check.reachable ? 'status-ok' : 'status-error'">
            {{ check.reachable ? 'OK' : (check.status || 'Error') }}
          </span>
          <span v-if="check.latency" class="endpoint-latency">{{ check.latency }}ms</span>
        </div>
      </div>
      
      <!-- Add a section for developers to help troubleshoot API issues -->
      <div v-if="connectionStatus === 'limited'" class="api-troubleshooting">
        <h5>Troubleshooting API Issues:</h5>
        <ul>
          <li>Check server logs for API-specific errors</li>
          <li>Ensure API services are running properly</li>
          <li>Verify API keys and authentication settings</li>
          <li>Check database connections on the server side</li>
          <li>Look for CORS or proxy configuration issues</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConnectionErrorMessage',
  props: {
    connectionStatus: {
      type: String,
      default: 'offline',
      validator: (value) => ['offline', 'limited', 'error', 'online'].includes(value)
    },
    errorMessage: {
      type: String,
      default: ''
    },
    connectivityMessage: {
      type: String,
      default: null
    },
    onRetry: {
      type: Function,
      required: true
    },
    showDetails: {
      type: Boolean,
      default: false
    },
    diagnostics: {
      type: Object,
      default: null
    },
    onRunDiagnostics: {
      type: Function,
      default: () => {}
    },
    isDiagnosticsRunning: {
      type: Boolean,
      default: false
    },
    endpointChecks: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    connectionStatusClass() {
      return {
        'status-offline': this.connectionStatus === 'offline',
        'status-limited': this.connectionStatus === 'limited',
        'status-error': this.connectionStatus === 'error'
      };
    }
  }
};
</script>

<style scoped>
.connection-error-container {
  margin-bottom: 2rem;
  border-radius: 8px;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.connection-error-message {
  display: flex;
  padding: 1.5rem;
}

.connection-error-message.status-offline {
  background-color: rgba(255, 59, 48, 0.15);
}

.connection-error-message.status-limited {
  background-color: rgba(255, 204, 0, 0.15);
}

.connection-error-message.status-error {
  background-color: rgba(255, 149, 0, 0.15);
}

.connection-error-icon {
  font-size: 2rem;
  margin-right: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
}

.status-offline .connection-error-icon {
  color: #ff3b30;
}

.status-limited .connection-error-icon {
  color: #ffcc00;
}

.status-error .connection-error-icon {
  color: #ff9500;
}

.connection-error-content {
  flex: 1;
}

.connection-error-title {
  font-size: 1.2rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.connection-error-description {
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.connection-error-description ul {
  margin-top: 0.75rem;
  margin-left: 1.5rem;
  list-style-type: disc;
}

.connection-error-description li {
  margin-bottom: 0.25rem;
}

.connection-error-actions {
  display: flex;
  gap: 1rem;
}

.button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border: none;
}

.button i {
  margin-right: 0.5rem;
}

.retry-button {
  background-color: var(--accent-color);
  color: white;
}

.retry-button:hover {
  background-color: var(--highlight);
}

.diagnostic-button {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.diagnostic-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button.is-loading {
  position: relative;
  color: transparent !important;
}

.button.is-loading::after {
  content: "";
  position: absolute;
  width: 1em;
  height: 1em;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-left-color: currentColor;
  border-radius: 50%;
  animation: spinAround 0.5s infinite linear;
}

@keyframes spinAround {
  from { transform: rotate(0deg); }
  to { transform: rotate(359deg); }
}

.connection-diagnostics {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(0, 0, 0, 0.1);
}

.connection-diagnostics h4 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.diagnostics-details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.diagnostic-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.diagnostic-label {
  font-weight: 500;
}

.status-ok {
  color: #4cd964;
}

.status-error {
  color: #ff3b30;
}

.possible-issues {
  margin-bottom: 1.5rem;
}

.possible-issues h5 {
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.possible-issues p {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 0.75rem;
  border-radius: 4px;
}

.endpoint-checks h5 {
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.endpoint-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.endpoint-url {
  flex: 1;
  font-family: monospace;
}

.endpoint-latency {
  margin-left: 1rem;
  font-size: 0.85rem;
  opacity: 0.8;
}

.api-issue-hint {
  background-color: rgba(255, 255, 255, 0.05);
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
  border-left: 3px solid #ffcc00;
}

.api-issue-hint p {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.api-issue-hint ul {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
}

.api-issue-hint li {
  margin-bottom: 0.25rem;
}

.api-issue-hint em {
  font-style: italic;
  opacity: 0.8;
}

.api-troubleshooting {
  background-color: rgba(72, 199, 142, 0.1);
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  border-left: 3px solid #48c78e;
}

.api-troubleshooting h5 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #48c78e;
}

.api-troubleshooting ul {
  margin: 0;
  padding-left: 1.5rem;
}

.api-troubleshooting li {
  margin-bottom: 0.25rem;
  font-family: monospace;
  font-size: 0.9rem;
}
</style>
