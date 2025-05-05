<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../utils/supabaseClient';
import { supabaseActivities } from '../services/supabase';
import { authService } from '../services/api';
import { mockDataService } from '../services/mockDataService';
import { checkServerHealth, diagnoseServerConnection } from '../utils/serverHealth';
import ConnectionErrorMessage from '../components/ConnectionErrorMessage.vue';
import type { Activity, User } from '../types';

const page = 'My Activity';
const currentUser = ref<User | null>(null);
const activities = ref<Activity[]>([]);
const loading = ref(true);
const error = ref('');
const authRetries = ref(0);
const MAX_AUTH_RETRIES = 2;
const showingSampleData = ref(false);

// Add debug mode to help troubleshoot
const isDebugMode = ref(false);
const debugInfo = ref({
  connectionStatus: 'Unknown',
  databaseAccessible: false,
  lastError: '',
  activities: [],
  userIds: []
});
const diagnosticsRunning = ref(false);
const connectionDiagnostics = ref<any>(null);
const endpointChecks = ref<any[]>([]);

// Add more detailed API diagnostics information
const apiDiagnostics = ref({
  lastTestedEndpoint: '',
  lastStatus: 0,
  failedEndpoints: [] as string[],
  successfulEndpoints: [] as string[],
  lastError: '',
  retryAttempts: 0,
  lastRetryTimestamp: null as Date | null
});

const toggleDebug = () => {
  isDebugMode.value = !isDebugMode.value;
  console.log('Debug mode:', isDebugMode.value);
  if (isDebugMode.value) {
    checkDatabaseConnection();
  }
};

// Enhanced diagnostic info for connection error message
const connectionStatus = computed(() => {
  if (!currentUser.value?.id && showingSampleData.value) {
    // Check if we have diagnostics that indicate partial connectivity
    if (connectionDiagnostics.value?.serverReachable) {
      return 'limited'; // Server is reachable but API endpoints are failing
    }
    return 'offline';
  }
  if (debugInfo.value.lastError) {
    return 'error';
  }
  if (debugInfo.value.databaseAccessible) {
    return 'online';
  }
  return 'limited';
});

// Generate appropriate connectivity message based on diagnostics
const getConnectivityMessage = () => {
  if (!connectionDiagnostics.value) return null;
  
  // If server is reachable but we're still showing sample data
  if (connectionDiagnostics.value.serverReachable && showingSampleData.value) {
    if (apiDiagnostics.value.failedEndpoints.length > 0) {
      return `The server is reachable, but API endpoints are failing (${apiDiagnostics.value.failedEndpoints.length} failed). The application is running in limited mode.`;
    }
    return "The server is reachable, but API endpoints are failing. The application is running in limited mode.";
  }
  
  // If browser is offline
  if (!connectionDiagnostics.value.browserOnline) {
    return "Your device appears to be offline. Please check your internet connection.";
  }
  
  // If server is completely unreachable
  if (!connectionDiagnostics.value.serverReachable && connectionDiagnostics.value.internetConnectivity) {
    return "The server appears to be offline or unreachable. Please try again later.";
  }
  
  return null;
};

// Check specific API endpoint health
const checkApiEndpoint = async (endpoint: string): Promise<boolean> => {
  try {
    apiDiagnostics.value.lastTestedEndpoint = endpoint;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(endpoint, {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    apiDiagnostics.value.lastStatus = response.status;
    
    if (response.ok) {
      if (!apiDiagnostics.value.successfulEndpoints.includes(endpoint)) {
        apiDiagnostics.value.successfulEndpoints.push(endpoint);
      }
      return true;
    } else {
      if (!apiDiagnostics.value.failedEndpoints.includes(endpoint)) {
        apiDiagnostics.value.failedEndpoints.push(endpoint);
      }
      return false;
    }
  } catch (error) {
    apiDiagnostics.value.lastStatus = 0;
    apiDiagnostics.value.lastError = error instanceof Error ? error.message : 'Unknown error';
    
    if (!apiDiagnostics.value.failedEndpoints.includes(endpoint)) {
      apiDiagnostics.value.failedEndpoints.push(endpoint);
    }
    
    return false;
  }
};

// Run comprehensive diagnostics
const runDiagnostics = async () => {
  try {
    diagnosticsRunning.value = true;
    connectionDiagnostics.value = null;
    endpointChecks.value = [];
    apiDiagnostics.value.failedEndpoints = [];
    apiDiagnostics.value.successfulEndpoints = [];
    
    // Check server health
    const healthResult = await checkServerHealth();
    
    // Run deeper diagnostics
    const diagnosticInfo = await diagnoseServerConnection();
    connectionDiagnostics.value = diagnosticInfo;
    
    // Check critical endpoints with enhanced endpoint testing
    const criticalEndpoints = [
      '/api/v1/health',
      '/api/v1/health/ping', // Check direct health ping endpoint
      '/api/v1/auth/current-user',
      '/api/v1/users',
      '/api/v1/activities',
      '/api/v1' // Base API path
    ];
    
    for (const endpoint of criticalEndpoints) {
      try {
        const startTime = Date.now();
        const response = await fetch(endpoint, {
          method: 'HEAD',
          cache: 'no-store'
        });
        
        const endTime = Date.now();
        
        endpointChecks.value.push({
          endpoint,
          reachable: response.ok,
          status: response.status,
          latency: endTime - startTime
        });
        
        if (response.ok) {
          if (!apiDiagnostics.value.successfulEndpoints.includes(endpoint)) {
            apiDiagnostics.value.successfulEndpoints.push(endpoint);
          }
        } else {
          if (!apiDiagnostics.value.failedEndpoints.includes(endpoint)) {
            apiDiagnostics.value.failedEndpoints.push(endpoint);
          }
        }
        
      } catch (error) {
        endpointChecks.value.push({
          endpoint,
          reachable: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        if (!apiDiagnostics.value.failedEndpoints.includes(endpoint)) {
          apiDiagnostics.value.failedEndpoints.push(endpoint);
        }
      }
    }
    
    // Add API info to the diagnostics output
    if (isDebugMode.value) {
      console.log("API Diagnostics:", { 
        failedEndpoints: apiDiagnostics.value.failedEndpoints,
        successfulEndpoints: apiDiagnostics.value.successfulEndpoints
      });
    }
    
    console.log("Diagnostics complete:", { 
      diagnosticInfo, 
      endpointChecks: endpointChecks.value 
    });
    
  } catch (error) {
    console.error("Error running diagnostics:", error);
  } finally {
    diagnosticsRunning.value = false;
  }
};

// Enhanced retry loading with API health check
const retryLoading = async () => {
  loading.value = true;
  error.value = '';
  authRetries.value = 0;
  apiDiagnostics.value.retryAttempts++;
  apiDiagnostics.value.lastRetryTimestamp = new Date();
  
  // Check API health before attempting to get current user
  const healthEndpoint = '/api/v1/health';
  const isApiHealthy = await checkApiEndpoint(healthEndpoint);
  
  if (isApiHealthy) {
    console.log('API health check passed, proceeding with user fetch');
    await getCurrentUser();
  } else {
    console.warn('API health check failed, attempting fallback method');
    // Try an alternative endpoint
    const altEndpoint = '/api/v1';
    const isAltHealthy = await checkApiEndpoint(altEndpoint);
    
    if (isAltHealthy) {
      console.log('Alternative API endpoint reachable, proceeding with user fetch');
      await getCurrentUser();
    } else {
      console.error('All API endpoints unreachable, falling back to sample data');
      error.value = 'API endpoints are unreachable. Showing sample data instead.';
      await fetchSampleActivities();
    }
  }
  
  loading.value = false;
};

// Enhanced fetch sample activities with better error diagnosis
const fetchSampleActivities = async () => {
  showingSampleData.value = true;
  console.log("Loading sample activities (API is unavailable)");
  
  // Run diagnostics when falling back to sample data to help troubleshoot
  if (!connectionDiagnostics.value) {
    try {
      await runDiagnostics();
      
      // Set more specific error message based on diagnostics
      if (connectionDiagnostics.value) {
        const connectivityMessage = getConnectivityMessage();
        if (connectivityMessage) {
          error.value = connectivityMessage;
        } else if (apiDiagnostics.value.failedEndpoints.length > 0) {
          error.value = `API connectivity issue: ${apiDiagnostics.value.failedEndpoints.length} endpoints failed. Running in offline mode.`;
        } else {
          error.value = 'Unable to connect to server. Showing sample data instead.';
        }
      }
    } catch (err) {
      console.error("Failed to run diagnostics:", err);
    }
  }
  
  try {
    // Get default activities
    const allMockActivities = mockDataService.getDefaultActivities();
    
    if (!allMockActivities || allMockActivities.length === 0) {
      // Handle empty mock data
      error.value = 'No sample activities available.';
      activities.value = [];
      return;
    }
    
    // Create a consistent user profile
    const user = currentUser.value || {
      id: 'sample-user',
      first_name: 'Demo',
      last_name: 'User',
      email: 'demo@example.com'
    };
    
    const userProfilePicture = currentUser.value?.profilePicture || 
                              currentUser.value?.profile_picture_url || 
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name || '')}&background=random`;
    
    // Filter and modify activities to be from the current user
    const filteredActivities = allMockActivities.map((activity, index) => ({
      ...activity,
      id: activity.id || `sample-${Date.now()}-${index}`,
      user_id: user.id,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        profilePicture: userProfilePicture
      }
    }));
    
    activities.value = filteredActivities;
    console.log(`Loaded ${activities.value.length} sample activities for current user`);
  } catch (err) {
    console.error('Error loading sample activities:', err);
    activities.value = [];
    error.value = 'Unable to load any activities.';
  } finally {
    loading.value = false;
  }
};

// Get current user with retry logic
const getCurrentUser = async () => {
  try {
    console.log('Attempting to get current user in MyActivityView');
    const response = await authService.getCurrentUser().catch(err => {
      console.error('Error in getCurrentUser call:', err);
      return null;
    });
    
    if (response && response.user) {
      console.log('User found:', response.user.id);
      currentUser.value = response.user;
      // Once we have the user, get their activities
      await fetchUserActivities();
    } else {
      console.warn('No user returned from getCurrentUser');
      
      // Try fallback approach - check if user exists in localStorage
      const localUser = localStorage.getItem('currentUser');
      if (localUser) {
        try {
          const parsedUser = JSON.parse(localUser);
          if (parsedUser && parsedUser.id) {
            console.log('Using localStorage user:', parsedUser.id);
            currentUser.value = parsedUser;
            await fetchUserActivities();
            return;
          }
        } catch (parseErr) {
          console.error('Error parsing localStorage user:', parseErr);
        }
      }
      
      if (authRetries.value < MAX_AUTH_RETRIES) {
        authRetries.value++;
        console.log(`Retrying getCurrentUser (${authRetries.value}/${MAX_AUTH_RETRIES})`);
        setTimeout(getCurrentUser, 1000); // Retry after 1 second
      } else {
        // After max retries, use sample activities
        console.log('Max retries reached, using sample activities');
        await fetchSampleActivities();
      }
    }
  } catch (err) {
    console.error('Failed to get current user:', err);
    error.value = 'Unable to authenticate user. Showing sample activities instead.';
    await fetchSampleActivities();
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  console.log('MyActivityView mounted, initializing...');
  getCurrentUser();
});
</script>

<template>
  <main>
    <h1 class="title">{{ page }}</h1>
    
    <!-- Add debug button -->
    <button @click="toggleDebug" class="debug-button" title="Toggle Debug Mode">
      🐞
    </button>
    
    <!-- Enhanced ConnectionErrorMessage with API diagnostics -->
    <ConnectionErrorMessage 
      v-if="showingSampleData" 
      :onRetry="retryLoading"
      :showDetails="isDebugMode"
      :errorMessage="error || debugInfo.lastError"
      :diagnostics="connectionDiagnostics"
      :onRunDiagnostics="runDiagnostics"
      :isDiagnosticsRunning="diagnosticsRunning"
      :connectionStatus="connectionStatus"
      :endpointChecks="endpointChecks"
      :connectivityMessage="getConnectivityMessage()"
    />
    
    <!-- Add API connectivity warning for limited mode -->
    <div v-if="connectionStatus === 'limited' && !showingSampleData" class="api-warning">
      <div class="warning-icon">⚠️</div>
      <div class="warning-message">
        <p><strong>Limited Connectivity:</strong> Some API features may not work correctly.</p>
        <button @click="runDiagnostics" class="warning-action" :disabled="diagnosticsRunning">
          {{ diagnosticsRunning ? 'Running Diagnostics...' : 'Run Diagnostics' }}
        </button>
      </div>
    </div>
    
    <!-- Add current user debug info -->
    <div v-if="isDebugMode" class="debug-info">
      <h3>Debug Info</h3>
      
      <!-- Additional API diagnostics section -->
      <div class="debug-section">
        <h4>API Diagnostics</h4>
        <p><strong>Failed Endpoints:</strong> {{ apiDiagnostics.failedEndpoints.length }}</p>
        <ul v-if="apiDiagnostics.failedEndpoints.length">
          <li v-for="(endpoint, index) in apiDiagnostics.failedEndpoints" :key="index">
            {{ endpoint }}
          </li>
        </ul>
        <p><strong>Successful Endpoints:</strong> {{ apiDiagnostics.successfulEndpoints.length }}</p>
        <ul v-if="apiDiagnostics.successfulEndpoints.length">
          <li v-for="(endpoint, index) in apiDiagnostics.successfulEndpoints" :key="index">
            {{ endpoint }}
          </li>
        </ul>
        <p><strong>Last Tested:</strong> {{ apiDiagnostics.lastTestedEndpoint || 'None' }}</p>
        <p><strong>Last Status:</strong> {{ apiDiagnostics.lastStatus || 'N/A' }}</p>
        <p><strong>Retry Attempts:</strong> {{ apiDiagnostics.retryAttempts }}</p>
        <p v-if="apiDiagnostics.lastRetryTimestamp">
          <strong>Last Retry:</strong> {{ apiDiagnostics.lastRetryTimestamp.toLocaleTimeString() }}
        </p>
        <div class="debug-actions">
          <button @click="checkApiEndpoint('/api/v1/health')" class="button is-small is-info">
            Test Health
          </button>
          <button @click="checkApiEndpoint('/api/v1/auth/current-user')" class="button is-small is-info">
            Test Auth
          </button>
          <button @click="checkApiEndpoint('/api/v1')" class="button is-small is-info">
            Test Base API
          </button>
        </div>
      </div>
      
      <div class="debug-section">
        <h4>Current User</h4>
        <p><strong>ID:</strong> {{ currentUser?.id || 'None' }}</p>
        <p><strong>Name:</strong> {{ currentUser?.first_name }} {{ currentUser?.last_name }}</p>
        <p><strong>Email:</strong> {{ currentUser?.email }}</p>
        <p><strong>Role:</strong> {{ currentUser?.role }}</p>
        <p><strong>Is Sample Data:</strong> {{ showingSampleData ? 'Yes' : 'No' }}</p>
        <div class="debug-actions">
          <button @click="fetchUserActivities" class="button is-small is-info">
            Retry Fetch
          </button>
          <button @click="createTestActivity" class="button is-small is-success">
            Create Test Activity
          </button>
          <button @click="runDiagnostics" class="button is-small is-warning" 
                  :class="{'is-loading': diagnosticsRunning}">
            Run Diagnostics
          </button>
        </div>
      </div>
      
      <div class="debug-section">
        <h4>Database Connection</h4>
        <p><strong>Status:</strong> {{ debugInfo.connectionStatus }}</p>
        <p><strong>Database Accessible:</strong> {{ debugInfo.databaseAccessible ? 'Yes' : 'No' }}</p>
        <p v-if="debugInfo.lastError" class="error-text">{{ debugInfo.lastError }}</p>
        <button @click="checkDatabaseConnection" class="button is-small is-info">
          Check Connection
        </button>
      </div>
      
      <div v-if="connectionDiagnostics" class="debug-section">
        <h4>Connection Diagnostics</h4>
        <div v-if="connectionDiagnostics.browserOnline !== undefined">
          <p><strong>Browser Online:</strong> 
            <span :class="connectionDiagnostics.browserOnline ? 'tag is-success' : 'tag is-danger'">
              {{ connectionDiagnostics.browserOnline ? 'Yes' : 'No' }}
            </span>
          </p>
        </div>
        <div v-if="connectionDiagnostics.internetConnectivity !== undefined">
          <p><strong>Internet Connectivity:</strong> 
            <span :class="connectionDiagnostics.internetConnectivity ? 'tag is-success' : 'tag is-danger'">
              {{ connectionDiagnostics.internetConnectivity ? 'Yes' : 'No' }}
            </span>
          </p>
        </div>
        <div v-if="connectionDiagnostics.serverReachable !== undefined">
          <p><strong>Server Reachable:</strong> 
            <span :class="connectionDiagnostics.serverReachable ? 'tag is-success' : 'tag is-danger'">
              {{ connectionDiagnostics.serverReachable ? 'Yes' : 'No' }}
            </span>
          </p>
        </div>
        <div v-if="connectionDiagnostics.possibleIssues?.length">
          <p><strong>Possible Issues:</strong></p>
          <ul>
            <li v-for="(issue, index) in connectionDiagnostics.possibleIssues" :key="index">
              {{ issue }}
            </li>
          </ul>
        </div>
      </div>
      
      <div v-if="endpointChecks.length > 0" class="debug-section">
        <h4>API Endpoint Checks</h4>
        <table class="debug-table">
          <thead>
            <tr>
              <th>Endpoint</th>
              <th>Status</th>
              <th>Latency</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(check, index) in endpointChecks" :key="index">
              <td>{{ check.endpoint }}</td>
              <td>
                <span :class="check.reachable ? 'tag is-success' : 'tag is-danger'">
                  {{ check.reachable ? 'OK' : check.status || 'Error' }}
                </span>
              </td>
              <td>{{ check.latency ? `${check.latency}ms` : 'N/A' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="debugInfo.activities.length > 0" class="debug-section">
        <h4>Sample Activities in Database</h4>
        <table class="debug-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>Title</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="activity in debugInfo.activities" :key="activity.id">
              <td>{{ activity.id }}</td>
              <td>{{ activity.user_id }}</td>
              <td>{{ activity.title }}</td>
              <td>
                <button 
                  @click="testWithUserId(activity.user_id)" 
                  class="button is-small is-link"
                  title="Test fetching activities with this user ID"
                >
                  Test
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="debug-section">
        <h4>Actions</h4>
        <button @click="fetchSampleActivities" class="button is-small is-warning">
          Load Sample Data
        </button>
      </div>
    </div>
    
    <div class="activities-container">
      <div v-if="loading" class="loading">
        <p>Loading activities...</p>
        <progress class="progress is-primary" max="100"></progress>
      </div>
      
      <div v-else-if="error && activities.length === 0" class="error">
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ error }}</p>
          <div v-if="error.includes('Server is offline') || error.includes('Proxy error')" class="connection-details">
            <p class="connection-tip">The server might be temporarily down or your internet connection is unstable.</p>
          </div>
        </div>
        <button @click="retryLoading" class="btn retry-btn">
          <i class="fas fa-sync"></i> Try Again
        </button>
      </div>
      
      <div v-else-if="activities.length === 0" class="empty-state">
        <p>You haven't recorded any activities yet.</p>
        <button class="btn">Record New Activity</button>
      </div>
      
      <div v-else class="activities-list">
        <div v-if="error" class="notification is-info">
          <p>{{ error }}</p>
        </div>
        
        <div v-for="activity in activities" :key="activity.id" class="activity-card card">
          <div class="delete-button" @click="deleteActivity(activity.id)">✕</div>
          
          <div class="user-info">
            <img 
              v-if="activity.user?.profilePicture"  
              :src="activity.user.profilePicture" 
              :alt="activity.user?.name || 'User'" 
              class="user-avatar"
            >
            <div v-else class="user-avatar-placeholder">
              <i class="fas fa-user"></i>
            </div>
            
            <div>
              <h4 class="user-name">{{ activity.user?.name || 'You' }}</h4>
              <p class="activity-date">{{ formatDate(activity.created_at) }}</p>
            </div>
          </div>
          
          <div class="activity-content">
            <h3 class="activity-title">{{ activity.title || 'Activity' }}</h3>
            <p class="activity-description">{{ activity.description }}</p>
            
            <div v-if="activity.image_url" class="activity-image-container">
              <img :src="activity.image_url" :alt="activity.title" class="activity-image">
            </div>
            
            <div class="activity-metrics">
              <div v-for="(value, key) in getActivityMetrics(activity)" :key="key" class="metric">
                <span class="metric-value">{{ value }}</span>
                <span class="metric-label">{{ key }}</span>
              </div>
            </div>
          </div>
          
          <div class="activity-engagement">
            <div class="engagement-stats">
              <span>{{ activity.likes || 0 }} likes</span>
              <span>{{ activity.comments || 0 }} comments</span>
            </div>
            
            <div class="engagement-actions">
              <button class="engagement-btn" @click="likeActivity(activity.id)">
                👍 Like
              </button>
              <button class="engagement-btn">
                💬 Comment
              </button>
              <button class="btn-small">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.title {
  margin-bottom: 2rem;
}

.activities-container {
  max-width: 800px;
  margin: 0 auto;
}

.loading, .error, .empty-state {
  text-align: center;
  padding: 2rem;
}

.empty-state {
  background-color: var(--dark-bg);
  border-radius: 8px;
  padding: 3rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
}

.activity-card {
  margin-bottom: 1.5rem;
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 1rem;
  object-fit: cover;
}

.user-avatar-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 1rem;
  background-color: #4a4a4a;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 1.5rem;
}

.user-name {
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
}

.activity-date {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.activity-content {
  margin-bottom: 1.5rem;
}

.activity-title {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-size: 1.4rem;
  font-weight: 600;
}

.activity-description {
  margin-bottom: 1rem;
}

.activity-metrics {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0.5rem;
}

.metric-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--highlight);
}

.metric-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-transform: capitalize;
}

.activity-image-container {
  margin: 1rem 0;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.activity-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.activity-image:hover {
  transform: scale(1.02);
}

.activity-engagement {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
}

.engagement-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.engagement-actions {
  display: flex;
  gap: 1rem;
}

.engagement-btn {
  background-color: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.engagement-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  background-color: var(--accent-color);
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.btn-small:hover {
  background-color: var(--highlight);
}

.delete-button {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.delete-button:hover {
  background: rgba(255, 0, 0, 0.6);
  opacity: 1;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.btn-primary {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.notification {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 4px;
  background-color: #856404;
  color: #fff3cd;
}

.progress {
  display: block;
  margin: 1rem auto;
  height: 8px;
}

.retry-btn {
  margin-top: 1rem;
  background-color: var(--accent-color);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.retry-btn:hover {
  background-color: var(--highlight);
}

.error-message {
  background-color: rgba(255, 59, 48, 0.1);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.error-message i {
  color: #ff3b30;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.connection-details {
  margin-top: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.connection-tip {
  margin-top: 0.5rem;
  font-style: italic;
}

.notification.is-warning {
  background-color: #ffd14a;
  color: #3e2800;
  margin-bottom: 1.5rem;
}

.notification.is-info {
  background-color: #3298dc;
  color: #fff;
  margin-bottom: 1.5rem;
}

.debug-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #333;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  border: none;
  z-index: 100;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.debug-button:hover {
  opacity: 1;
  transform: scale(1.1);
}

.debug-info {
  margin: 1rem auto;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  max-width: 800px;
  margin-bottom: 2rem;
  border: 1px dashed #666;
}

.debug-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
}

.debug-section h4 {
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #7bb7e4;
}

.debug-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.debug-table {
  width: 100%;
  margin-top: 0.5rem;
  border-collapse: collapse;
}

.debug-table th, 
.debug-table td {
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid #444;
}

.user-ids-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.user-id-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.error-text {
  color: #ff6b6b;
}

code {
  font-family: monospace;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.tag.is-success {
  background-color: #48c78e;
  color: white;
}

.tag.is-danger {
  background-color: #ff3860;
  color: white;
}

.tag.is-warning {
  background-color: #ffd14a;
  color: #3e2800;
}

.tag {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-left: 0.25rem;
}

.debug-section ul {
  margin-left: 1.5rem;
  list-style-type: disc;
}

.debug-section li {
  margin-bottom: 0.25rem;
}

/* Add styles for API warning */
.api-warning {
  display: flex;
  align-items: center;
  background-color: rgba(255, 204, 0, 0.15);
  border-left: 4px solid #ffcc00;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
}

.warning-icon {
  font-size: 1.5rem;
  margin-right: 1rem;
}

.warning-message {
  flex: 1;
}

.warning-message p {
  margin: 0;
}

.warning-action {
  background-color: transparent;
  border: 1px solid rgba(255, 204, 0, 0.5);
  color: #ffcc00;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.warning-action:hover:not(:disabled) {
  background-color: rgba(255, 204, 0, 0.2);
}

.warning-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>