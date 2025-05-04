/**
 * Debug Utilities for Client
 * 
 * Provides helper functions to debug data flow in the client application
 */

// Enable console output for debugging
const DEBUG_ENABLED = true;

/**
 * Log API responses for debugging
 * @param {string} endpoint - The API endpoint being called
 * @param {any} data - The data received from the API
 */
export function logApiResponse(endpoint, data) {
  if (!DEBUG_ENABLED) return;
  
  console.group(`🔍 API Response from: ${endpoint}`);
  console.log('Timestamp:', new Date().toISOString());
  console.log('Data received:', data);
  
  // Check if data is empty or missing expected properties
  if (!data) {
    console.warn('⚠️ Warning: Received empty data!');
  } else if (Array.isArray(data) && data.length === 0) {
    console.warn('⚠️ Warning: Received empty array!');
  }
  
  console.groupEnd();
}

/**
 * Debug component rendering with data
 * @param {string} componentName - The component that's rendering
 * @param {any} props - The props or data being rendered
 */
export function debugRender(componentName, props) {
  if (!DEBUG_ENABLED) return;
  
  console.group(`🔄 Rendering: ${componentName}`);
  console.log('Props/Data:', props);
  console.groupEnd();
}

/**
 * Add data visualization to the DOM for debugging
 * @param {any} data - The data to visualize 
 * @param {string} containerId - The ID of the container element to insert the debug panel
 */
export function visualizeData(data, containerId = 'debug-data-panel') {
  if (!DEBUG_ENABLED) return;
  
  // Create or find container
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.position = 'fixed';
    container.style.bottom = '10px';
    container.style.right = '10px';
    container.style.padding = '10px';
    container.style.background = 'rgba(0,0,0,0.8)';
    container.style.color = '#fff';
    container.style.zIndex = '9999';
    container.style.maxHeight = '300px';
    container.style.maxWidth = '400px';
    container.style.overflow = 'auto';
    container.style.borderRadius = '5px';
    container.style.fontFamily = 'monospace';
    container.style.fontSize = '12px';
    document.body.appendChild(container);
  }
  
  // Create header
  const header = document.createElement('div');
  header.style.fontWeight = 'bold';
  header.style.marginBottom = '5px';
  header.style.borderBottom = '1px solid white';
  header.textContent = `Debug Data (${new Date().toLocaleTimeString()})`;
  
  // Create content
  const content = document.createElement('pre');
  content.textContent = JSON.stringify(data, null, 2);
  
  // Clear and append
  container.innerHTML = '';
  container.appendChild(header);
  container.appendChild(content);
}

export default {
  logApiResponse,
  debugRender,
  visualizeData
};
