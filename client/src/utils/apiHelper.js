/**
 * API Helper utilities for handling API connection issues
 */

// Default timeout in milliseconds
const DEFAULT_TIMEOUT = 5000;

/**
 * Fetch with timeout and error handling
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise} - Fetch response
 */
export const fetchWithTimeout = async (url, options = {}, timeout = DEFAULT_TIMEOUT) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  const fetchOptions = {
    ...options,
    signal: controller.signal
  };

  try {
    const response = await fetch(url, fetchOptions);
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    console.error(`API request failed: ${url}`, error);
    
    // Create a custom error response for client-side handling
    return {
      ok: false,
      status: error.name === 'AbortError' ? 408 : 503,
      statusText: error.name === 'AbortError' ? 'Request Timeout' : 'Service Unavailable',
      json: async () => ({
        success: false,
        message: error.name === 'AbortError' 
          ? 'Request timed out. Server may be too slow.'
          : 'Unable to connect to API server.',
        error: error.message,
        offline: !navigator.onLine
      })
    };
  }
};

/**
 * Checks if the API server is available
 * @returns {Promise<boolean>} - True if the API is available
 */
export const checkApiAvailability = async () => {
  try {
    const response = await fetchWithTimeout('/api/v1/health', {}, 2000);
    if (!response.ok) return false;
    
    const data = await response.json();
    return data.success && data.status !== 'fallback';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

/**
 * Displays an offline notification to the user
 * @param {boolean} offline - Whether the app is offline
 */
export const showOfflineNotification = (offline = true) => {
  // Remove any existing notification
  const existingNotification = document.getElementById('offline-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  if (!offline) return;
  
  // Create new offline notification
  const notification = document.createElement('div');
  notification.id = 'offline-notification';
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = '#ff4d4f';
  notification.style.color = 'white';
  notification.style.padding = '10px 20px';
  notification.style.borderRadius = '4px';
  notification.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
  notification.style.zIndex = '9999';
  notification.innerHTML = 'API server is currently unavailable. Some features may not work properly.';
  
  document.body.appendChild(notification);
  
  // Auto hide after 10 seconds
  setTimeout(() => {
    if (document.getElementById('offline-notification')) {
      document.getElementById('offline-notification').style.opacity = '0';
      document.getElementById('offline-notification').style.transition = 'opacity 0.5s';
      
      setTimeout(() => {
        if (document.getElementById('offline-notification')) {
          document.getElementById('offline-notification').remove();
        }
      }, 500);
    }
  }, 10000);
};
