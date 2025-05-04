const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

// Log environment variable availability (without exposing actual keys)
console.log('Supabase Configuration:');
console.log(`- SUPABASE_URL: ${supabaseUrl ? 'Defined ✓' : 'MISSING ✗'}`);
console.log(`- SUPABASE_SECRET_KEY: ${supabaseSecretKey ? 'Defined ✓' : 'MISSING ✗'}`);

// Validate environment variables
if (!supabaseUrl) {
  console.error('ERROR: Missing SUPABASE_URL environment variable');
  console.error('Please check your .env file and ensure this variable is properly configured.');
  process.exit(1);
}

if (!supabaseSecretKey) {
  console.error('ERROR: Missing SUPABASE_SECRET_KEY environment variable');
  console.error('Please check your .env file and ensure this variable is properly configured.');
  process.exit(1);
}

// Check if token has elevated permissions by properly decoding the JWT
function hasElevatedPermissions(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, '=');
    const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
    
    return payload.role === 'service_role';
  } catch (e) {
    console.error('Error checking token permissions:', e);
    return false;
  }
}

// Allow bypassing permission check in development mode via env var
const bypassPermissionCheck = process.env.BYPASS_PERMISSION_CHECK === 'true' && 
                             process.env.NODE_ENV === 'development';

// Check if we're using a key with proper permissions
const hasPermission = bypassPermissionCheck || hasElevatedPermissions(supabaseSecretKey);
console.log(`Key permissions: ${hasPermission ? 'elevated access ✓' : 'limited access ✗'}`);

if (bypassPermissionCheck) {
  console.log('⚠️ Permission check bypassed via BYPASS_PERMISSION_CHECK environment variable');
}

// For debugging in dev mode only
if (process.env.NODE_ENV === 'development' && !hasPermission) {
  console.log('DEBUG: JWT payload check failed - Token structure:');
  try {
    const parts = supabaseSecretKey.split('.');
    if (parts.length === 3) {
      const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, '=');
      const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
      console.log('Decoded payload:', payload);
      console.log(`- Token role: ${payload.role || 'not found'}`);
    }
  } catch (e) {
    console.log('- Could not parse token for debugging:', e.message);
  }
}

// Enforce proper permissions for server operations
if (!hasPermission) {
  console.error('ERROR: Secret key with elevated permissions is required for server operations');
  console.error('Current key does not have sufficient permissions. SQL execution will fail.');
  console.error('Please check your .env file to ensure SUPABASE_SECRET_KEY contains the correct key.');
  console.error('Tip: The key should have "service_role" in the JWT payload.');
  console.error('You can get your secret key from the Supabase dashboard → Project Settings → API.');
  
  if (process.env.NODE_ENV === 'production') {
    console.error('Exiting due to insufficient permissions in production');
    process.exit(1);
  } else {
    console.warn('WARNING: Continuing in development mode with limited permissions, some features will not work');
  }
}

// Initialize the Supabase client
console.log(`Initializing Supabase client with URL: ${supabaseUrl}`);

const supabase = createClient(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Add debug logging to help diagnose issues
const DEBUG = process.env.DEBUG_DATABASE_QUERIES === 'true';

// Enhanced test function that verifies connection
async function testConnection() {
  console.log('Testing Supabase connection from server...');
  try {
    const startTime = process.hrtime();
    // Test the user table specifically
    const { data, error } = await supabase.from('users')
      .select('id, first_name, last_name, email, role')
      .limit(7);
    
    const hrTime = process.hrtime(startTime);
    const duration = hrTime[0] * 1000 + hrTime[1] / 1000000;
    
    if (error) {
      console.error(`❌ Supabase connection failed (${duration.toFixed(2)}ms):`);
      console.error(`   Error: ${error.message}`);
      console.error(`   Code: ${error.code}`);
      return false;
    }
    
    console.log(`✅ Supabase connection successful (${duration.toFixed(2)}ms)`);
    console.log(`   Found ${data?.length || 0} users`);
    if (data && data.length > 0) {
      console.log(`   First user: ${JSON.stringify({
        id: data[0].id,
        name: `${data[0].first_name} ${data[0].last_name}`,
        email: data[0].email,
        role: data[0].role
      })}`);
    } else {
      console.warn('   No users found in database. This might indicate an empty table or permission issue.');
    }
    return true;
  } catch (err) {
    console.error('❌ Critical Supabase connection error:', err);
    console.error('This could indicate network issues or invalid credentials.');
    return false;
  }
}

// Create an enhanced query wrapper for debugging
const enhancedQuery = (tableName) => {
  return {
    select: async (columns) => {
      if (DEBUG) console.log(`[DB] Querying ${tableName} for ${columns}`);
      const startTime = process.hrtime();
      const result = await supabase.from(tableName).select(columns);
      
      const hrTime = process.hrtime(startTime);
      const duration = hrTime[0] * 1000 + hrTime[1] / 1000000;
      
      if (DEBUG) {
        if (result.error) {
          console.error(`[DB] Error querying ${tableName}: ${result.error.message} (${duration.toFixed(2)}ms)`);
        } else {
          console.log(`[DB] Successfully retrieved ${result.data?.length || 0} rows from ${tableName} (${duration.toFixed(2)}ms)`);
        }
      }
      
      return result;
    }
  };
}

// Function to execute SQL directly (which the client doesn't support directly)
async function executeSql(sql) {
  // Check again for permissions before allowing SQL execution
  if (!hasPermission) {
    throw new Error('SQL execution requires elevated permissions');
  }

  // Attempt to create a SQL execution function if it doesn't exist
  try {
    // First try to use the function directly
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (!error) {
      return data;
    }
    
    // If this fails, we might need to create the function first
    console.log('SQL function not found or error occurred, attempting to create it...');
    
    // Create the SQL execution function in Supabase
    const createFnSql = `
      CREATE OR REPLACE FUNCTION exec_sql(query text)
      RETURNS JSONB
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        result JSONB;
      BEGIN
        EXECUTE query INTO result;
        RETURN result;
      EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object(
          'error', SQLERRM,
          'detail', SQLSTATE
        );
      END;
      $$;`;
    
    // Use REST API directly to create the function (needs secret key)
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseSecretKey,
        'Authorization': `Bearer ${supabaseSecretKey}`,
        'Prefer': 'tx=commit'
      },
      body: JSON.stringify({ query: createFnSql })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`Could not create exec_sql function: ${errorText}`);
      throw new Error(`Failed to create SQL execution function: ${errorText}`);
    }
    
    // Now try to use the newly created function
    const { data: execData, error: execError } = await supabase.rpc('exec_sql', { query: sql });
    
    if (execError) {
      throw new Error(`SQL execution error: ${execError.message}`);
    }
    
    return execData;
  } catch (err) {
    console.error('SQL execution failed:', err.message);
    throw err;
  }
}

/**
 * Deep check Supabase connection with detailed diagnostics
 * @returns {Object} Diagnostic information
 */
async function diagnoseSupabaseConnection() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    issues: []
  };
  
  // Test basic connection
  try {
    const startTime = process.hrtime();
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
      
    const hrTime = process.hrtime(startTime);
    const duration = hrTime[0] * 1000 + hrTime[1] / 1000000;
    
    results.checks.basicConnection = {
      success: !error,
      duration: `${duration.toFixed(2)}ms`,
      error: error ? error.message : null
    };
    
    if (error) {
      results.issues.push(`Basic connection failed: ${error.message}`);
    }
  } catch (err) {
    results.checks.basicConnection = {
      success: false,
      error: err.message
    };
    results.issues.push(`Connection exception: ${err.message}`);
  }
  
  // Check table access
  try {
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
      
    results.checks.tableAccess = {
      success: !error,
      error: error ? error.message : null
    };
    
    if (error) {
      results.issues.push(`Table access failed: ${error.message}`);
    }
  } catch (err) {
    results.checks.tableAccess = {
      success: false,
      error: err.message
    };
    results.issues.push(`Table access exception: ${err.message}`);
  }
  
  // Check RPC function access
  try {
    const { error } = await supabase
      .rpc('get_global_statistics_with_periods');
      
    results.checks.rpcAccess = {
      success: !error,
      error: error ? error.message : null
    };
    
    if (error) {
      results.issues.push(`RPC access failed: ${error.message}`);
    }
  } catch (err) {
    results.checks.rpcAccess = {
      success: false,
      error: err.message
    };
    results.issues.push(`RPC access exception: ${err.message}`);
  }
  
  // Overall status
  const allSuccess = Object.values(results.checks)
    .every(check => check.success);
  
  results.summary = allSuccess ? 'All connection checks passed' : 'Some connection checks failed';
  results.status = allSuccess ? 'healthy' : 'unhealthy';
  
  return results;
}

// Export the client and functions
module.exports = { 
  supabase,
  executeSql,
  testConnection,
  enhancedQuery,
  diagnoseSupabaseConnection
};
