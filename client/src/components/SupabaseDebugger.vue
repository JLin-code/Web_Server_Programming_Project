<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../utils/supabaseClient';

const connectionStatus = ref('Checking...');
const errorMessage = ref('');
const users = ref([]);
const loading = ref(true);
const debugVisible = ref(true);

async function checkConnection() {
  try {
    const start = performance.now();
    const { data, error } = await supabase.from('users').select('count');
    const duration = performance.now() - start;
    
    if (error) {
      connectionStatus.value = 'Failed';
      errorMessage.value = `Error: ${error.message} (Code: ${error.code})`;
      return false;
    }
    
    connectionStatus.value = `Connected (${Math.round(duration)}ms)`;
    return true;
  } catch (err) {
    connectionStatus.value = 'Error';
    errorMessage.value = err.message;
    return false;
  }
}

async function loadUsers() {
  try {
    loading.value = true;
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .limit(5);
    
    if (error) throw error;
    
    users.value = data || [];
  } catch (err) {
    errorMessage.value = `Failed to load users: ${err.message}`;
  } finally {
    loading.value = false;
  }
}

function toggleDebugger() {
  debugVisible.value = !debugVisible.value;
}

onMounted(async () => {
  const connected = await checkConnection();
  if (connected) {
    loadUsers();
  }
});
</script>

<template>
  <div class="supabase-debugger">
    <button @click="toggleDebugger" class="toggle-button">
      {{ debugVisible ? 'Hide' : 'Show' }} Debugger
    </button>
    
    <div v-if="debugVisible" class="debug-panel">
      <h3>Supabase Connection Debug</h3>
      
      <div class="connection-status">
        <strong>Status:</strong> 
        <span :class="connectionStatus === 'Checking...' ? 'checking' : 
                     connectionStatus.includes('Connected') ? 'success' : 'error'">
          {{ connectionStatus }}
        </span>
      </div>
      
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      
      <h4>Environment Variables:</h4>
      <div class="env-vars">
        <div>VITE_SUPABASE_URL: {{ import.meta.env.VITE_SUPABASE_URL ? '✓' : '✗' }}</div>
        <div>VITE_SUPABASE_ANON_KEY: {{ import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓' : '✗' }}</div>
      </div>
      
      <div v-if="users.length > 0" class="users-data">
        <h4>Users from Database:</h4>
        <ul>
          <li v-for="user in users" :key="user.id">
            {{ user.first_name }} {{ user.last_name }} ({{ user.email }})
          </li>
        </ul>
      </div>
      
      <div v-else-if="!loading && connectionStatus.includes('Connected')" class="no-data">
        No users found in database
      </div>
      
      <div v-if="loading" class="loading">Loading data...</div>
      
      <div class="actions">
        <button @click="checkConnection">Test Connection</button>
        <button @click="loadUsers" :disabled="!connectionStatus.includes('Connected')">Load Users</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.supabase-debugger {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  font-family: Arial, sans-serif;
}

.toggle-button {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
}

.debug-panel {
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 15px;
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  margin-bottom: 40px;
}

h3 {
  margin-top: 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.connection-status {
  margin: 10px 0;
}

.success {
  color: green;
  font-weight: bold;
}

.error {
  color: red;
  font-weight: bold;
}

.checking {
  color: orange;
  font-weight: bold;
}

.error-message {
  margin: 10px 0;
  padding: 8px;
  background-color: #ffeeee;
  border-left: 4px solid red;
}

.env-vars {
  background-color: #f5f5f5;
  padding: 8px;
  margin: 10px 0;
  border-radius: 4px;
}

.actions {
  margin-top: 15px;
  display: flex;
  gap: 8px;
}

.actions button {
  padding: 6px 10px;
  background-color: #4a5568;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.actions button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.users-data {
  margin-top: 15px;
}

.users-data ul {
  padding-left: 20px;
}

.no-data {
  font-style: italic;
  color: #666;
  margin: 15px 0;
}

.loading {
  font-style: italic;
  color: #666;
  margin: 15px 0;
  display: flex;
  align-items: center;
}

.loading:after {
  content: '.';
  animation: dots 1.5s steps(5, end) infinite;
}

@keyframes dots {
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60% { content: '...'; }
  80%, 100% { content: ''; }
}
</style>
