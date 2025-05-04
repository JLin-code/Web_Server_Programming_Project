/**
 * Client Supabase Connection Debugger
 * Run this script to test your Supabase connection from the client
 * 
 * How to use:
 * 1. Run "npm run debug:connection" from the client directory
 * 2. Check the console output for connection status
 */
import { supabase } from './utils/supabaseClient';

// Get and display environment variables
console.log('=== SUPABASE CLIENT CONNECTION TEST ===');
console.log('Environment Variables:');
console.log(`- VITE_SUPABASE_URL: ${import.meta.env.VITE_SUPABASE_URL ? 'Defined ✓' : 'Missing ✗'}`);
console.log(`- VITE_SUPABASE_ANON_KEY: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Defined ✓' : 'Missing ✗'}`);

// Test the connection
async function testConnection() {
  console.log('\nTesting Supabase connection...');
  
  try {
    const start = performance.now();
    
    // Try to get users
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    const duration = performance.now() - start;
    
    if (error) {
      console.error(`❌ CONNECTION FAILED (${Math.round(duration)}ms)`);
      console.error(`Error: ${error.message}`);
      console.error(`Code: ${error.code}`);
      console.error('\nPossible issues:');
      console.error('1. Your .env file is missing or has incorrect values');
      console.error('2. Network connection to Supabase is blocked');
      console.error('3. Database permissions are not set correctly');
      return false;
    }
    
    console.log(`✅ CONNECTION SUCCESSFUL (${Math.round(duration)}ms)`);
    console.log(`Data: ${JSON.stringify(data)}`);
    
    // Try to get a specific user record
    console.log('\nTrying to fetch a single user record...');
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
      
    if (userError) {
      console.warn(`⚠️ Could not fetch user data: ${userError.message}`);
    } else if (userData && userData.length > 0) {
      console.log(`✅ Successfully retrieved user record:`);
      console.log(`- ID: ${userData[0].id}`);
      console.log(`- Name: ${userData[0].first_name} ${userData[0].last_name}`);
      console.log(`- Email: ${userData[0].email}`);
    } else {
      console.log('✅ Database connected but no user records found');
    }
    
    return true;
  } catch (err) {
    console.error('❌ Critical error during connection test:');
    console.error(err);
    return false;
  }
}

// Run the test
testConnection()
  .then(success => {
    console.log('\n=== SUMMARY ===');
    if (success) {
      console.log('✅ Your Supabase connection is WORKING!');
      console.log('You can now use the database in your application.');
    } else {
      console.log('❌ Supabase connection test FAILED!');
      console.log('Please check the error messages above for troubleshooting.');
    }
  });
