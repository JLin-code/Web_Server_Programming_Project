<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import { ref, onMounted, onErrorCaptured } from 'vue'

const hasError = ref(false);
const errorMessage = ref('');
const appVersion = '1.0.0'; // Add version for debugging

// Define reloadPage method
const reloadPage = () => {
  window.location.reload();
};

onMounted(() => {
  console.log(`Fitness Tracker App v${appVersion} initializing...`);
});

// Add global error handler
onErrorCaptured((err, instance, info) => {
  console.error('App error captured:', err);
  console.error('Error details:', { instance, info });
  hasError.value = true;
  errorMessage.value = err instanceof Error ? err.message : 'Unknown application error';
  return false; // Prevent error from propagating further
});
</script>

<template>
  <div class="app-container">
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
</style>