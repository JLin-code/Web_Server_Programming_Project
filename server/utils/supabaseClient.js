const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required Supabase environment variables:');
  console.error(`SUPABASE_URL: ${supabaseUrl ? 'Set' : 'Missing'}`);
  console.error(`SUPABASE_KEY: ${supabaseKey ? 'Set' : 'Missing'}`);
  console.error('Please check your .env file and ensure these variables are properly configured.');
}

// Initialize the Supabase client
const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  }
);

// Export the client for use in other server files
module.exports = { supabase };
