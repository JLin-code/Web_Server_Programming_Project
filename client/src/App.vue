<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref, onMounted, onErrorCaptured } from 'vue'
import NavBar from './components/NavBar.vue'
import ConnectionStatus from './components/ConnectionStatus.vue'
import { DEBUG, logger } from './utils/debugConfig'

// App version
const appVersion = '1.0.0'

// Debug mode - use our config
const debug = ref(DEBUG)

// Error handling
const hasError = ref(false)
const errorMessage = ref('An unknown error occurred')

// Error handling
onErrorCaptured((err, instance, info) => {
  console.error('App error captured:', err, info)
  // Don't set hasError to true unless it's a critical error
  // hasError.value = true
  errorMessage.value = err.message || 'An unexpected error occurred'
  return false // Prevent error propagation
})

// Reload page functionality
const reloadPage = () => {
  window.location.reload()
}

onMounted(() => {
  logger.info('App mounted')
  // Force hasError to false on app mount to ensure content displays
  hasError.value = false
})
</script>

<template>
  <div class="app-container">
    <!-- Debug info when in debug mode - repositioned to bottom of screen -->
    <div v-if="debug" class="debug-info">
      <strong>DEBUG:</strong> App loaded, error state: {{ hasError }}
    </div>
    
    <!-- Error fallback -->
    <div v-if="hasError" class="error-container">
      <div class="error-content">
        <h1>Something went wrong</h1>
        <p>{{ errorMessage }}</p>
        <button @click="reloadPage" class="reload-button">Reload Application</button>
      </div>
    </div>
    
    <!-- Regular app content -->
    <template v-else>
      <header>
        <NavBar />
      </header>
      <main class="content-container">
        <RouterView />
      </main>
      <footer class="app-footer">
        <p>© {{ new Date().getFullYear() }} Fitness Tracker v{{ appVersion }}</p>
      </footer>
      <ConnectionStatus />
    </template>
  </div>
</template>

<style>
:root {
  --dark-bg: #121212;
  --dark-secondary: #1e1e1e;
  --accent-color: #5d5dff;
  --accent-hover: #4a4ad7;
  --text-primary: #f5f5f5;
  --text-secondary: #b3b3b3;
  --highlight: #00c9a7;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--dark-bg);
  color: var(--text-primary);
  font-family: 'Roboto', 'Segoe UI', sans-serif;
  line-height: 1.6;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content-container {
  flex: 1;
  padding: 1.5rem;
  background-color: var(--dark-secondary);
  margin: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.app-footer {
  padding: 1rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
  background-color: var(--dark-bg);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* Common Elements Styling */
h1, h2, h3 {
  color: var(--text-primary);
  margin-bottom: 1rem;
}

button, .btn {
  background-color: var(--accent-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

button:hover, .btn:hover {
  background-color: var(--accent-hover);
}

.card {
  background-color: var(--dark-bg);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.highlight {
  color: var(--highlight);
}

.error-container {
  background-color: var(--dark-bg);
  color: var(--text-primary);
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.error-content {
  max-width: 500px;
  padding: 2rem;
  background-color: var(--dark-secondary);
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.error-content h1 {
  color: #f14668;
  margin-bottom: 1rem;
}

.reload-button {
  background-color: var(--accent-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  margin-top: 1.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.reload-button:hover {
  background-color: var(--accent-hover);
}

/* Add debugging styles - repositioned to bottom */
.debug-info {
  background-color: #ffeb3b;
  color: #333;
  padding: 10px;
  position: fixed;
  bottom: 0; /* Changed from top: 0 to bottom: 0 */
  left: 0;
  right: 0;
  z-index: 999; /* Reduced z-index */
  text-align: center;
  font-family: monospace;
}
</style>