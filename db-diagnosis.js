/**
 * Database Diagnosis Tool
 * Run this with: node db-diagnosis.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
// Using native fetch instead of node-fetch (available in newer Node.js versions)

// Get credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

console.log('=== DATABASE CONNECTION DIAGNOSIS ===');
console.log('Checking environment configuration...');

// Check environment variables
if (!supabaseUrl) {
  console.error('❌ Missing SUPABASE_URL environment variable');
  console.error('Check your .env file and make sure SUPABASE_URL is set correctly');
  process.exit(1);
}

if (!supabaseSecretKey) {
  console.error('❌ Missing SUPABASE_SECRET_KEY environment variable');
  console.error('Check your .env file and make sure SUPABASE_SECRET_KEY is set correctly');
  process.exit(1);
}

console.log('✅ Environment variables are set');
console.log(`SUPABASE_URL: ${supabaseUrl}`);
console.log(`SUPABASE_SECRET_KEY: ${supabaseSecretKey.substring(0, 5)}...${supabaseSecretKey.substring(supabaseSecretKey.length - 4)}`);

// Create Supabase client
console.log('\nInitializing Supabase client...');
const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: { persistSession: false }
});

// Function to test basic connection
async function testBasicConnection() {
  console.log('\nTest 1: Checking basic connectivity...');
  try {
    console.log('Executing query: SELECT COUNT(*) FROM users LIMIT 1');
    const startTime = process.hrtime();
    
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    const hrTime = process.hrtime(startTime);
    const executionTime = (hrTime[0] * 1000 + hrTime[1] / 1000000).toFixed(2);
    
    if (error) {
      console.error(`❌ Connection test failed (${executionTime}ms)`);
      console.error(`Error message: ${error.message}`);
      console.error(`Error code: ${error.code}`);
      console.error(`Error details: ${JSON.stringify(error.details || {})}`);
      return false;
    }
    
    console.log(`✅ Connection successful (${executionTime}ms)`);
    console.log(`Response data: ${JSON.stringify(data)}`);
    return true;
  } catch (err) {
    console.error('❌ Connection test failed with exception:');
    console.error(`Message: ${err.message}`);
    console.error(`Stack: ${err.stack}`);
    return false;
  }
}

// Function to test direct REST API
async function testDirectAPI() {
  console.log('\nTest 2: Testing direct REST API...');
  try {
    console.log(`Sending request to: ${supabaseUrl}/rest/v1/users?select=id&limit=1`);
    const startTime = process.hrtime();
    
    const response = await fetch(`${supabaseUrl}/rest/v1/users?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseSecretKey,
        'Authorization': `Bearer ${supabaseSecretKey}`
      }
    });
    
    const hrTime = process.hrtime(startTime);
    const executionTime = (hrTime[0] * 1000 + hrTime[1] / 1000000).toFixed(2);
    
    if (!response.ok) {
      console.error(`❌ Direct API test failed (${executionTime}ms)`);
      console.error(`Status: ${response.status} ${response.statusText}`);
      console.error(`Body: ${await response.text()}`);
      return false;
    }
    
    const data = await response.json();
    console.log(`✅ Direct API test successful (${executionTime}ms)`);
    console.log(`Response data: ${JSON.stringify(data)}`);
    return true;
  } catch (err) {
    console.error('❌ Direct API test failed with exception:');
    console.error(`Message: ${err.message}`);
    return false;
  }
}

// Function to test RPC call
async function testRpcFunction() {
  console.log('\nTest 3: Testing RPC functionality...');
  try {
    // Try to create a simple function if it doesn't exist
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION hello_world()
      RETURNS TEXT
      LANGUAGE SQL
      AS $$
        SELECT 'Hello from database'::TEXT;
      $$;
    `;
    
    console.log('Trying to create test function via RPC...');
    try {
      const { error: createError } = await supabase.rpc('exec_sql', { query: createFunctionSQL });
      
      if (createError) {
        console.log(`Creating function via exec_sql failed: ${createError.message}`);
        console.log('This is expected if exec_sql function does not exist yet.');
        // Continue anyway as the function might already exist or we'll create it directly
      }
    } catch (e) {
      console.log('exec_sql function not available, trying direct approach');
    }
    
    // Try to call our test function
    console.log('Calling RPC function...');
    const startTime = process.hrtime();
    
    try {
      const { data, error } = await supabase.rpc('hello_world');
      const hrTime = process.hrtime(startTime);
      const executionTime = (hrTime[0] * 1000 + hrTime[1] / 1000000).toFixed(2);
      
      if (error) {
        console.log(`❌ RPC function call failed (${executionTime}ms): ${error.message}`);
        
        // Try to create the function directly using REST API
        console.log('Attempting to create function directly via SQL...');
        const directResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/hello_world`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseSecretKey,
            'Authorization': `Bearer ${supabaseSecretKey}`
          }
        });
        
        if (!directResponse.ok) {
          console.log('Direct function call failed too, database may not allow RPC or function creation');
          return false;
        }
        
        const directData = await directResponse.json();
        console.log('Direct function call succeeded:', directData);
        return true;
      }
      
      console.log(`✅ RPC test successful (${executionTime}ms)`);
      console.log(`Response: ${JSON.stringify(data)}`);
      return true;
    } catch (rpcErr) {
      console.log(`RPC call failed with error: ${rpcErr.message}`);
      return false;
    }
  } catch (err) {
    console.error('❌ Overall RPC test failed with exception:');
    console.error(`Message: ${err.message}`);
    return false;
  }
}

// Test table existence
async function testTableExistence(tableName = 'users') {
  console.log(`\nTest 4: Checking if table '${tableName}' exists...`);
  try {
    console.log(`Querying table information...`);
    const startTime = process.hrtime();
    
    const { data, error } = await supabase
      .from(tableName)
      .select('count')
      .limit(0);
    
    const hrTime = process.hrtime(startTime);
    const executionTime = (hrTime[0] * 1000 + hrTime[1] / 1000000).toFixed(2);
    
    if (error) {
      console.error(`❌ Table check failed (${executionTime}ms)`);
      console.error(`Error message: ${error.message}`);
      console.error(`Error code: ${error.code}`);
      if (error.code === '42P01') {
        console.error(`The table '${tableName}' does not exist in your database.`);
      }
      return false;
    }
    
    console.log(`✅ Table '${tableName}' exists (${executionTime}ms)`);
    return true;
  } catch (err) {
    console.error(`❌ Table check failed with exception:`);
    console.error(`Message: ${err.message}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n=== RUNNING CONNECTION TESTS ===');
  
  const basicConnectionSuccess = await testBasicConnection();
  const directApiSuccess = await testDirectAPI();
  const rpcFunctionSuccess = await testRpcFunction();
  const tableExistsSuccess = await testTableExistence('users');
  
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Basic Connection: ${basicConnectionSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Direct API: ${directApiSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`RPC Function: ${rpcFunctionSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Table Existence: ${tableExistsSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (!basicConnectionSuccess && !directApiSuccess) {
    console.log('\n❌ CRITICAL: All connection tests failed.');
    console.log('This indicates a serious connection issue. Please check:');
    console.log('1. Your network connection');
    console.log('2. Your Supabase URL is correct');
    console.log('3. Your Supabase Secret Key has the proper permissions');
    console.log('4. Your Supabase instance is up and running');
  } else if (!tableExistsSuccess) {
    console.log('\n⚠️ WARNING: Table check failed.');
    console.log('This suggests your database schema is not set up correctly.');
    console.log('Run database migrations or setup scripts to create the necessary tables.');
    console.log('Try running: node server/tools/setup_db.js');
  } else if (!rpcFunctionSuccess) {
    console.log('\n⚠️ WARNING: RPC function test failed.');
    console.log('This may indicate permission issues or that functions are not set up.');
    console.log('Some advanced features may not work, but basic database operations should still function.');
  } else {
    console.log('\n✅ GOOD NEWS: All tests passed or most tests passed!');
    console.log('If you\'re still having issues, try checking:');
    console.log('1. Your application logic');
    console.log('2. Specific permissions for operations you\'re trying to perform');
    console.log('3. Console logs for detailed error messages');
  }
}

// Run the tests
runAllTests();
