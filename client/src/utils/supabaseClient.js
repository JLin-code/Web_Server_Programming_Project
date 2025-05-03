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

// Create Supabase client with explicit headers
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
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'x-application-name': 'fitness-tracker-client'
      }
    }
  }
);

// Test connection on client load
async function testConnection() {
  try {
    console.log('Testing Supabase connection from client...');
    const startTime = performance.now();
    const { data, error } = await supabase.from('users').select('count').limit(1);
    const duration = performance.now() - startTime;
    
    if (error) {
      console.error(`❌ Supabase connection failed (${duration.toFixed(2)}ms):`);
      console.error(`   Error: ${error.message}`);
      console.error(`   Code: ${error.code}`);
      return false;
    }
    
    console.log(`✅ Supabase connection successful (${duration.toFixed(2)}ms)`);
    console.log(`   Response: ${JSON.stringify(data)}`);
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
