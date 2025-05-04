<script setup>
import { ref } from 'vue';
import { shouldShowDebug } from '../../utils/debugConfig';

const props = defineProps({
  message: {
    type: String,
    default: ''
  },
  data: {
    type: Object,
    default: () => ({})
  },
  hidden: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Debug Info'
  }
});

const isVisible = ref(!props.hidden);

function toggleVisibility() {
  isVisible.value = !isVisible.value;
}

// Only show if debug is enabled
const shouldDisplay = shouldShowDebug;
</script>

<template>
  <div v-if="shouldDisplay" class="debug-panel" :class="{ 'collapsed': !isVisible }">
    <div class="debug-header" @click="toggleVisibility">
      <h4>{{ title }}</h4>
      <span class="toggle-icon">{{ isVisible ? '▼' : '►' }}</span>
    </div>
    <div v-if="isVisible" class="debug-content">
      <p v-if="message" class="debug-message">{{ message }}</p>
      <pre v-if="Object.keys(data).length > 0" class="debug-data">{{ JSON.stringify(data, null, 2) }}</pre>
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.debug-panel {
  background-color: rgba(0, 0, 0, 0.8);
  color: #00ff00;
  border: 1px solid #444;
  border-radius: 4px;
  font-family: monospace;
  margin: 10px 0;
  max-width: 100%;
  overflow-x: auto;
  z-index: 9999;
}

.debug-panel.collapsed {
  background-color: rgba(0, 0, 0, 0.5);
}

.debug-header {
  display: flex;
  justify-content: space-between;
  padding: 5px 10px;
  background-color: #333;
  cursor: pointer;
  user-select: none;
}

.debug-header h4 {
  margin: 0;
  font-size: 14px;
}

.debug-content {
  padding: 10px;
  font-size: 12px;
}

.debug-message {
  margin: 0 0 10px 0;
}

.debug-data {
  overflow-x: auto;
  white-space: pre-wrap;
  margin: 0;
}
</style>
