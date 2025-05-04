/**
 * Utility functions for network diagnostics
 */

// Check if the API is reachable
export async function checkApiConnection() {
  try {
    console.log('Checking API connection...');
    const startTime = Date.now();
    
    const response = await fetch('/api/ping', { 
      method: 'HEAD',
      cache: 'no-store'
    });
    
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    return {
      reachable: response.ok,
      status: response.status,
      latency,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('API connection check failed:', error);
    return {
      reachable: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Check if Supabase connection is working
export async function checkSupabaseConnection(supabase) {
  try {
    console.log('Checking Supabase connection...');
    const startTime = Date.now();
    
    // Just do a simple health check query
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    return {
      reachable: !error,
      latency,
      error: error ? error.message : null,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return {
      reachable: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Run a complete diagnostic
export async function runNetworkDiagnostics(supabase) {
  const apiStatus = await checkApiConnection();
  const supabaseStatus = await checkSupabaseConnection(supabase);
  
  return {
    api: apiStatus,
    supabase: supabaseStatus,
    timestamp: new Date().toISOString(),
    summary: {
      allSystemsOperational: apiStatus.reachable && supabaseStatus.reachable,
      issues: [
        ...(!apiStatus.reachable ? ['API server unreachable'] : []),
        ...(!supabaseStatus.reachable ? ['Supabase connection failed'] : [])
      ]
    }
  };
}
