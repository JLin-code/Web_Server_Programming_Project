const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize the Supabase client with the service role key
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test the connection
async function testConnection() {
  try {
    const { data, error } = await supabase.from('your_table').select('count(*)').limit(1);
    if (error) throw error;
    console.log('✅ Supabase connection successful');
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
  }
}

module.exports = { supabase, testConnection };
