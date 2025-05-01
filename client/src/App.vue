<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import DebugPanel from './components/DebugPanel.vue'

</script>

<template>
  <div class="app-container">
    <header>
      <NavBar />
    </header>
    <main class="content-container">
      <RouterView />
    </main>
    <footer class="app-footer">
      <p>© {{ new Date().getFullYear() }} Fitness Tracker</p>
    </footer>
    <DebugPanel />
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
</style>