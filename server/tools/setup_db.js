require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch'); // You may need to install this: npm install node-fetch

// Get credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in environment variables');
  console.error('Make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in your .env file');
  process.exit(1);
}

// Verify we're using the service role key
if (!supabaseKey.includes('service_role')) {
  console.error('Error: You must use the service_role key for SQL execution');
  console.error('Current key does not appear to be a service_role key');
  console.error('Please check your .env file and ensure SUPABASE_SERVICE_KEY is set correctly');
  process.exit(1);
}

// Initialize Supabase client with service role key
console.log('Initializing Supabase client...');
const supabase = createClient(supabaseUrl, supabaseKey, {
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
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
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
  console.log('Setting up SQL execution function in the database...');
  
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(query text)
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE query;
      RETURN jsonb_build_object('success', true);
    EXCEPTION WHEN OTHERS THEN
      RETURN jsonb_build_object('success', false, 'error', SQLERRM, 'detail', SQLSTATE);
    END;
    $$;
  `;
  
  try {
    // Create the function using direct SQL query through the REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
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
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
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
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
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
  console.log('Starting database setup...');

  try {
    // First, set up the SQL execution function
    await setupSqlExecutionFunction();
    
    // Find SQL directory
    let sqlDir = null;
    let sqlFiles = [];
    
    for (const dir of sqlDirectories) {
      try {
        await fs.access(dir);
        const files = await fs.readdir(dir);
        const sqlFilesInDir = files.filter(file => file.endsWith('.sql'));
        if (sqlFilesInDir.length > 0) {
          sqlDir = dir;
          sqlFiles = sqlFilesInDir;
          break;
        }
      } catch (err) {
        // Directory doesn't exist or can't be accessed - try the next one
      }
    }

    if (!sqlDir) {
      console.error('Error: Could not find any SQL files directory');
      console.error('Please create an "sql" directory in your project with your SQL files');
      process.exit(1);
    }

    console.log(`Found SQL files in ${sqlDir}`);
    
    // Sort SQL files by name to ensure proper execution order
    sqlFiles.sort();
    console.log(`SQL files to execute (${sqlFiles.length}):`, sqlFiles);

    // Execute each SQL file
    for (const file of sqlFiles) {
      try {
        console.log(`Executing ${file}...`);
        const filePath = path.join(sqlDir, file);
        const sql = await fs.readFile(filePath, 'utf8');
        
        try {
          // Try to execute using the RPC function first
          await executeSQLViaRPC(sql);
        } catch (rpcError) {
          console.log(`RPC execution failed, trying direct execution for ${file}...`);
          await executeSQL(sql);
        }
        
        console.log(`✅ Successfully executed ${file}`);
      } catch (error) {
        console.error(`❌ Failed to execute ${file}: ${error.message}`);
        process.exit(1);
      }
    }

    console.log('✅ Database setup completed successfully');
  } catch (err) {
    console.error('Error setting up database:', err);
    process.exit(1);
  }
}

// Run the setup
setupDatabase().catch(err => {
  console.error('Error setting up database:', err);
  process.exit(1);
});
