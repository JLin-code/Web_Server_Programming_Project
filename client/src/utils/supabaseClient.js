import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate config and log info for debugging (won't expose keys)
console.log('Supabase Client Configuration:');
console.log(`- URL: ${supabaseUrl ? 'Defined' : 'Missing!'}`);
console.log(`- API Key: ${supabaseAnonKey ? 'Defined' : 'Missing!'}`);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Missing Supabase credentials in environment variables.');
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.');
}

// Create a custom Supabase client with error handling and debug logs
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    },
    global: {
      headers: {
        'x-application-name': 'fitness-tracker-client'
      },
    },
    // Add debug option to log all requests and responses
    debug: {
      request: true,
      response: true
    }
  }
);

// Enhanced test connection with better error handling and detailed logs
async function testConnection() {
  try {
    console.log('Testing Supabase connection from client...');
    console.log('URL:', supabaseUrl);
    console.log('Key format check:', supabaseAnonKey ? 
      `Key starts with: ${supabaseAnonKey.substring(0, 10)}...` : 
      'Key is missing!');
    
    const startTime = performance.now();
    console.log('Executing test query...');
    
    const { data, error } = await supabase.from('users').select('count').limit(1);
    const duration = performance.now() - startTime;
    
    if (error) {
      console.error(`❌ Supabase connection failed (${duration.toFixed(2)}ms):`);
      console.error(`   Error: ${error.message}`);
      console.error(`   Code: ${error.code}`);
      console.error(`   Details: ${JSON.stringify(error.details || {})}`);
      console.error('Please check:');
      console.error('1. Your .env file settings');
      console.error('2. Network connectivity to Supabase');
      console.error('3. Database permissions');
      return false;
    }
    
    console.log(`✅ Supabase connection successful (${duration.toFixed(2)}ms)`);
    console.log(`   Response: ${JSON.stringify(data)}`);
    
    // Also try to fetch first user row to verify permissions
    console.log('Attempting to fetch a user record...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
      
    if (userError) {
      console.warn(`⚠️ Could fetch count but not user data: ${userError.message}`);
    } else {
      console.log(`✅ Successfully fetched user data:`, userData);
    }
    
    return true;
  } catch (err) {
    console.error('❌ Critical Supabase connection error:', err);
    console.error('This could indicate network issues or invalid credentials.');
    return false;
  }
}

// Run the connection test
testConnection();

export default supabase;
