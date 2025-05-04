/**
 * Server health monitoring utilities with fallbacks
 */

// Cache health check results for a short period to avoid excessive calls
let healthCache = {
  status: null,
  timestamp: 0
};

const CACHE_TTL = 5000; // 5 seconds cache

/**
 * Check if the server is up
 * @returns {Promise<{online: boolean, latency?: number, error?: string, cached?: boolean, serverError?: boolean}>}
 */
export async function checkServerHealth() {
  // Check if we have a recent cache
  const now = Date.now();
  if (healthCache.status !== null && (now - healthCache.timestamp) < CACHE_TTL) {
    return {
      ...healthCache.status,
      cached: true
    };
  }

  try {
    const startTime = performance.now();
    
    // Use fetch with a short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch('/api/v1/health/ping', {
      method: 'GET',
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    clearTimeout(timeoutId);
    const endTime = performance.now();
    
    // Check for server error responses (5xx status codes)
    if (response.status >= 500) {
      console.warn(`Server returned error status: ${response.status}`);
      let errorData = null;
      try {
        errorData = await response.json();
      } catch {
        // If we can't parse the response, just use the status text
        errorData = { message: response.statusText };
      }
      
      const result = {
        online: false,
        serverError: true,
        statusCode: response.status,
        error: errorData?.message || `Server error: ${response.status}`,
        timestamp: new Date().toISOString(),
        latency: Math.round(endTime - startTime)
      };
      
      // Cache the server error result
      healthCache = {
        status: result,
        timestamp: now
      };
      
      return result;
    }
    
    const result = {
      online: response.ok,
      latency: Math.round(endTime - startTime),
      timestamp: new Date().toISOString()
    };
    
    // Cache the result
    healthCache = {
      status: result,
      timestamp: now
    };
    
    return result;
  } catch (e) {
    console.warn('Server health check failed:', e.name === 'AbortError' ? 'Request timed out' : e.message);
    
    const result = {
      online: false,
      error: e.name === 'AbortError' ? 'Request timed out' : e.message,
      timestamp: new Date().toISOString()
    };
    
    // Cache the negative result too, but for a shorter time
    healthCache = {
      status: result,
      timestamp: now
    };
    
    return result;
  }
}

/**
 * Attempt alternative health checks when primary fails
 * @returns {Promise<{online: boolean, method: string, latency?: number}>}
 */
export async function fallbackHealthCheck() {
  try {
    const startTime = performance.now();
    
    // Try a HEAD request to the API root - often less problematic
    const response = await fetch('/api/v1', { 
      method: 'HEAD',
      cache: 'no-cache',
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    
    const endTime = performance.now();
    
    return {
      online: response.ok,
      latency: Math.round(endTime - startTime),
      method: 'head-request'
    };
  } catch {
    // As a last resort, try a simple image request which is less likely to fail
    try {
      const imgStartTime = performance.now();
      const imgResponse = await fetch('/favicon.ico', { 
        method: 'HEAD', 
        cache: 'no-cache' 
      });
      const imgEndTime = performance.now();
      
      return {
        online: imgResponse.ok,
        latency: Math.round(imgEndTime - imgStartTime),
        method: 'favicon-request',
        limited: true // This only tells us if the static server is up, not the API
      };
    } catch (innerError) {
      return {
        online: false,
        error: innerError.message,
        method: 'all-checks-failed'
      };
    }
  }
}

/**
 * Get information about why server might be offline
 * @returns {Promise<Object>} Diagnostic information
 */
export async function diagnoseServerConnection() {
  const networkInfo = {
    browserOnline: navigator.onLine,
    connectionType: navigator.connection ? navigator.connection.effectiveType : 'unknown',
    serverReachable: false,
    possibleIssues: []
  };
  
  // Check if browser is online
  if (!navigator.onLine) {
    networkInfo.possibleIssues.push('Your device is offline. Check your internet connection.');
    return networkInfo;
  }
  
  try {
    // Try to ping a reliable external service to check internet connectivity
    networkInfo.internetConnectivity = true;
    
    // If we can reach Google, try a fallback health check
    const fallbackHealth = await fallbackHealthCheck();
    networkInfo.fallbackHealthCheck = fallbackHealth;
    
    if (fallbackHealth.online) {
      if (fallbackHealth.limited) {
        networkInfo.possibleIssues.push(
          'Static server is reachable, but API server seems to be experiencing issues. ' +
          'The application might have limited functionality.'
        );
      } else {
        networkInfo.serverReachable = true;
        networkInfo.possibleIssues.push(
          'The server is reachable using alternative methods, but the main health endpoint is returning errors. ' +
          'This suggests a server-side issue that administrators should investigate.'
        );
      }
    } else {
      // If we can reach Google but not our server, the server is likely down
      networkInfo.possibleIssues.push(
        'Your internet is working, but our server appears to be unreachable. ' +
        'The server may be down for maintenance or experiencing issues.'
      );
    }
  } catch {
    networkInfo.internetConnectivity = false;
    networkInfo.possibleIssues.push(
      'Unable to connect to external sites. You may have limited connectivity ' +
      'or be behind a restrictive firewall.'
    );
  }
  
  return networkInfo;
}

/**
 * Checks if a particular API endpoint is available
 * @param {string} endpoint - The API endpoint to check (e.g. "/api/v1/users")
 * @returns {Promise<{available: boolean, statusCode?: number, error?: string}>}
 */
export async function checkApiEndpoint(endpoint) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(endpoint, {
      method: 'HEAD',  // HEAD requests are lightweight
      signal: controller.signal,
      headers: { 
        'Cache-Control': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    clearTimeout(timeoutId);
    
    return {
      available: response.ok,
      statusCode: response.status
    };
  } catch (error) {
    return {
      available: false,
      error: error.name === 'AbortError' ? 'Request timed out' : error.message
    };
  }
}

export default {
  checkServerHealth,
  diagnoseServerConnection,
  fallbackHealthCheck,
  checkApiEndpoint
};
