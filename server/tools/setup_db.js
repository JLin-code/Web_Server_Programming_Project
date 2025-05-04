require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch'); // You may need to install this: npm install node-fetch

// Get credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error('Error: Missing Supabase credentials in environment variables');
  console.error('Make sure SUPABASE_URL and SUPABASE_SECRET_KEY are set in your .env file');
  process.exit(1);
}

// Function to check if token has elevated permissions by decoding the JWT
function checkKeyPermissions(token) {
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, '=');
      const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
      
      if (payload.role === 'service_role') {
        return true;
      }
    }
  } catch (e) {
    console.error('Error checking token permissions:', e);
  }
  return false;
}

// Add this test function before actual usage
function validateJWTPermissions(token) {
  const hasPermission = checkKeyPermissions(token);
  if (!hasPermission) {
    console.error('\nERROR: The provided SUPABASE_SECRET_KEY does not have service_role permissions.');
    console.error('This is required for setting up the database schema.');
    console.error('Please check your .env file and ensure you are using the Service Role key from your Supabase project settings.\n');
    process.exit(1);
  }
  
  console.log('✓ Service role key validation passed');
  return true;
}

// Run the validation check
validateJWTPermissions(supabaseSecretKey);

// Initialize Supabase client with secret key
console.log('Initializing Supabase client...');
const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: { persistSession: false }
});

// SQL directories to check (in order of preference)
const sqlDirectories = [
  path.join(__dirname, '..', 'sql'),
  path.join(__dirname, '..', 'database', 'migrations'),
  path.join(__dirname, '..', 'database'),
  path.join(__dirname, '..', '..', 'sql')
];

// Direct SQL execution using the REST API
async function executeSQL(sql) {
  try {
    console.log('Executing SQL directly via REST API...');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseSecretKey,
        'Authorization': `Bearer ${supabaseSecretKey}`,
        'Prefer': 'tx=commit'
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SQL execution failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to execute SQL via REST API:', error);
    throw error;
  }
}

// Create the SQL execution function in the database
async function setupSqlExecutionFunction() {
  try {
    console.log('Setting up SQL execution function...');
    
    // Define the SQL function that allows us to execute arbitrary SQL
    const createFunctionSQL = `
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
          'success', false,
          'error', SQLERRM,
          'detail', SQLSTATE
        );
      END;
      $$;
    `;
    
    // Try to create the function
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseSecretKey,
        'Authorization': `Bearer ${supabaseSecretKey}`
      },
      body: JSON.stringify({
        sql: createFunctionSQL
      })
    });
    
    if (!response.ok) {
      console.log('Initial direct function creation attempt failed. Trying alternative approach...');
      
      // Try an alternative approach with a direct SQL query
      const queryResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseSecretKey,
          'Authorization': `Bearer ${supabaseSecretKey}`,
          'Prefer': 'tx=commit'
        },
        body: JSON.stringify({
          query: createFunctionSQL
        })
      });
      
      if (!queryResponse.ok) {
        console.log('Alternative approach failed. Creating function via management API...');
        
        // Try one more approach - using the management API
        const managementResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/sql',
            'apikey': supabaseSecretKey,
            'Authorization': `Bearer ${supabaseSecretKey}`
          },
          body: createFunctionSQL
        });
        
        if (!managementResponse.ok) {
          throw new Error(`Failed to create SQL execution function: ${await managementResponse.text()}`);
        }
      }
    }
    
    console.log('✅ SQL execution function created successfully');
  } catch (error) {
    console.error('❌ Failed to create SQL execution function:', error);
    throw error;
  }
}

// Execute SQL via RPC after the function is created
async function executeSQLViaRPC(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) {
      throw new Error(`SQL execution error: ${error.message}`);
    }
    
    if (data && !data.success) {
      throw new Error(`SQL execution failed: ${data.error || 'Unknown error'}`);
    }
    
    return data;
  } catch (error) {
    console.error('Failed to execute SQL via RPC:', error);
    throw error;
  }
}

// Function to find and execute SQL files
async function setupDatabase() {
  try {
    console.log('Starting database setup...');
    
    // First, try to create the SQL execution function
    await setupSqlExecutionFunction();
    
    // Find the SQL directory
    let sqlDir = null;
    for (const dir of sqlDirectories) {
      try {
        await fs.access(dir);
        sqlDir = dir;
        console.log(`Found SQL directory: ${dir}`);
        break;
      } catch (err) {
        // Directory doesn't exist, try next one
      }
    }
    
    if (!sqlDir) {
      throw new Error('Could not find any SQL directory');
    }
    
    // Get all SQL files and sort them alphabetically to ensure correct order
    const files = await fs.readdir(sqlDir);
    const sqlFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    if (sqlFiles.length === 0) {
      console.log('No SQL files found to execute.');
      return;
    }
    
    console.log(`Found ${sqlFiles.length} SQL files to execute.`);
    
    // Execute each SQL file
    for (const file of sqlFiles) {
      console.log(`\nExecuting SQL file: ${file}`);
      try {
        const sql = await fs.readFile(path.join(sqlDir, file), 'utf8');
        
        // Try to execute via RPC first
        try {
          await executeSQLViaRPC(sql);
          console.log(`✅ Successfully executed ${file}`);
        } catch (rpcError) {
          // Fallback to direct execution
          console.log(`RPC execution failed, falling back to direct API: ${rpcError.message}`);
          await executeSQL(sql);
          console.log(`✅ Successfully executed ${file} via direct API`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to execute ${file}:`, error);
        throw error;
      }
    }
    
    console.log('\n✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run the setup if this script is called directly
if (require.main === module) {
  setupDatabase();
} else {
  // Export functions for use in other scripts
  module.exports = {
    setupDatabase,
    executeSQL,
    executeSQLViaRPC,
    setupSqlExecutionFunction
  };
}
