const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
// Explicitly use the service_key for server operations that require SQL execution
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing required Supabase environment variables:');
  console.error(`SUPABASE_URL: ${supabaseUrl ? 'Set' : 'Missing'}`);
  console.error(`SUPABASE_KEY/SERVICE_KEY: ${supabaseKey ? 'Set' : 'Missing'}`);
  console.error('Please check your .env file and ensure these variables are properly configured.');
  process.exit(1);
}

// Check if we're using the service_role key
const isServiceRole = supabaseKey.includes('service_role');
console.log(`Using key type: ${isServiceRole ? 'service_role' : 'anon/other'}`);
if (!isServiceRole) {
  console.warn('WARNING: Not using service_role key. SQL execution will fail.');
}

// Initialize the Supabase client
console.log(`Initializing Supabase client with URL: ${supabaseUrl}`);
const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Function to execute SQL directly (which the client doesn't support directly)
async function executeSql(sql) {
  try {
    // We need to use RPC (Remote Procedure Call) for executing arbitrary SQL
    // First, check if our helper function exists
    const { data: existsFnData, error: existsFnError } = await supabase.rpc(
      'function_exists', 
      { function_name: 'exec_sql' }
    ).maybeSingle();

    // If the function doesn't exist or we got an error, we need to create it
    if (existsFnError || !(existsFnData && existsFnData.exists)) {
      // Create the function via REST API call
      console.log('Creating exec_sql function...');
      const createFnRes = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          name: 'exec_sql',
          definition: `
            CREATE OR REPLACE FUNCTION exec_sql(query text)
            RETURNS jsonb
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            BEGIN
              EXECUTE query;
              RETURN jsonb_build_object('success', true);
            EXCEPTION WHEN OTHERS THEN
              RETURN jsonb_build_object(
                'success', false, 
                'error', SQLERRM, 
                'detail', SQLSTATE
              );
            END;
            $$;
          `
        })
      });
      
      if (!createFnRes.ok) {
        const error = await createFnRes.json();
        throw new Error(`Failed to create exec_sql function: ${JSON.stringify(error)}`);
      }
    }

    // Now we can execute our SQL using the function
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) {
      throw new Error(`SQL execution error: ${error.message}`);
    }
    
    if (data && !data.success) {
      throw new Error(`SQL execution failed: ${data.error}`);
    }
    
    return data;
  } catch (error) {
    console.error('Failed to execute SQL:', error);
    throw error;
  }
}

// Function to check if the exec_sql function already exists
async function createHelperFunction() {
  try {
    console.log('Setting up SQL execution helper function...');
    
    // SQL to create a function to check if another function exists
    const checkFnSql = `
      CREATE OR REPLACE FUNCTION function_exists(function_name text)
      RETURNS TABLE(exists boolean)
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        RETURN QUERY SELECT EXISTS (
          SELECT 1
          FROM pg_proc
          WHERE proname = function_name
        );
      END;
      $$;
    `;
    
    // Execute directly against the database using the REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        name: 'create_function_exists',
        sql: checkFnSql
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.warn('Helper function may already exist or could not be created:', error);
      // We'll try to use it anyway
    } else {
      console.log('Helper function created successfully');
    }
  } catch (error) {
    console.warn('Failed to create helper function, will attempt direct SQL execution:', error);
  }
}

// Initialize helper functions
createHelperFunction();

// Export the client and SQL execution function
module.exports = { 
  supabase,
  executeSql
};
