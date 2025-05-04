/**
 * Simple Supabase Connection Check
 * This script has minimal dependencies and just checks the basic connection
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('=== SIMPLE SUPABASE CONNECTION CHECK ===');

// Get credentials from environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing Supabase credentials in .env file');
  console.error(`SUPABASE_URL: ${supabaseUrl ? 'Set ✓' : 'Missing ✗'}`);
  console.error(`SUPABASE_SECRET_KEY: ${supabaseKey ? 'Set ✓' : 'Missing ✗'}`);
  process.exit(1);
}

console.log(`Using Supabase URL: ${supabaseUrl}`);
console.log(`Using key starting with: ${supabaseKey.substring(0, 8)}...`);

// Create client
const supabase = createClient(supabaseUrl, supabaseKey);

// Simple test function
async function testConnection() {
  console.log('\nTesting connection to Supabase...');
  try {
    const start = Date.now();
    const { data, error } = await supabase.from('users').select('count').limit(1);
    const duration = Date.now() - start;
    
    if (error) {
      console.error(`❌ ERROR: Connection failed (${duration}ms)`);
      console.error('Error details:', error);
      return;
    }
    
    console.log(`✅ SUCCESS: Connection established in ${duration}ms`);
    console.log('Response data:', data);
    
    // Try to get one user record to verify data access
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
      
    if (userError) {
      console.error('❌ Could not fetch user data:', userError);
    } else if (!userData || userData.length === 0) {
      console.log('⚠️ No user records found in the database');
    } else {
      console.log('✅ Successfully retrieved a user record:');
      console.log(JSON.stringify(userData[0], null, 2));
    }
    
  } catch (err) {
    console.error('❌ CRITICAL ERROR:', err);
  }
}

// Run the test
testConnection();
