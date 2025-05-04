/**
 * Helper utilities for debugging Supabase connection issues
 */
const { supabase } = require('./supabaseClient');

/**
 * Deep check Supabase connection with detailed diagnostics
 * @returns {Object} Diagnostic information
 */
async function diagnoseSupabaseConnection() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: {
      basic: { success: false, time: null, error: null },
      query: { success: false, time: null, error: null },
      auth: { success: false, time: null, error: null }
    },
    environment: {
      url: !!process.env.SUPABASE_URL,
      key: !!process.env.SUPABASE_SECRET_KEY,
      nodeEnv: process.env.NODE_ENV
    },
    summary: 'Not yet run'
  };
  
  // Basic connection check
  try {
    const startTime = Date.now();
    const { data, error } = await supabase.from('users').select('count').limit(1);
    results.checks.basic.time = Date.now() - startTime;
    
    if (error) {
      results.checks.basic.error = error.message;
    } else {
      results.checks.basic.success = true;
    }
  } catch (err) {
    results.checks.basic.error = err.message;
  }
  
  // More specific query check
  try {
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('users')
      .select('id, email')
      .limit(5);
    
    results.checks.query.time = Date.now() - startTime;
    
    if (error) {
      results.checks.query.error = error.message;
    } else {
      results.checks.query.success = true;
      results.checks.query.count = data ? data.length : 0;
    }
  } catch (err) {
    results.checks.query.error = err.message;
  }
  
  // Summarize results
  const allSuccess = Object.values(results.checks).every(check => check.success);
  results.summary = allSuccess ? 'All connection checks passed' : 'Some connection checks failed';
  results.status = allSuccess ? 'healthy' : 'unhealthy';
  
  return results;
}

module.exports = {
  diagnoseSupabaseConnection
};
