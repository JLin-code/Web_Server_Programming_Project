require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Get credentials with fallbacks
const supabaseUrl = process.env.SUPABASE_URL || 'https://chuhfxkepvakwgmhiuep.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

// Check for required environment variables
console.log('\n=== Supabase Connection Test ===\n');
console.log('Environment Variables:');
console.log(`- SUPABASE_URL: ${supabaseUrl ? '✓ Found' : '✗ Missing'}`);
console.log(`- SUPABASE_KEY: ${supabaseKey ? '✓ Found' : '✗ Missing'}`);
console.log(`- URL being used: ${supabaseUrl}`);
console.log(`- KEY length: ${supabaseKey?.length || 0} characters\n`);

async function testConnection() {
  console.log('Testing connection to Supabase...');
  
  // Create client
  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      global: { 
        fetch: (url, options) => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);
          
          return fetch(url, { ...options, signal: controller.signal })
            .then(response => {
              clearTimeout(timeout);
              return response;
            })
            .catch(error => {
              clearTimeout(timeout);
              throw error;
            });
        }
      }
    });
    
    console.log('Initial client created successfully');
    
    // Test simple query to check connectivity
    console.log('Testing database query...');
    const startTime = performance.now();
    const { data, error } = await supabase.from('users').select('count');
    const duration = (performance.now() - startTime).toFixed(2);
    
    if (error) {
      throw error;
    }
    
    console.log(`✓ Connection successful! (${duration}ms)`);
    console.log(`✓ Response received:`, data);
    
    // Try a more complex query
    console.log('\nTesting table existence...');
    const { data: tableData, error: tableError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1);
      
    if (tableError) {
      if (tableError.code === '42P01') {
        console.log('✗ The users table does not exist. You may need to run your migrations.');
      } else {
        console.log(`✗ Error querying users table: ${tableError.message}`);
      }
    } else {
      console.log('✓ Users table exists and is accessible');
      console.log(`✓ Found ${tableData.length ? tableData.length + ' user(s)' : 'no users'} in the database`);
      if (tableData.length > 0) {
        console.log(`✓ Sample user: ID=${tableData[0].id}, Email=${tableData[0].email}`);
      }
    }
    
  } catch (error) {
    console.error('\n✗ Connection failed!');
    console.error(`Error: ${error.message}\n`);
    
    if (error.message.includes('fetch failed')) {
      console.log('TROUBLESHOOTING:');
      console.log('1. Check your internet connection');
      console.log('2. Verify firewall/proxy settings');
      console.log('3. Ensure Supabase is online: https://status.supabase.com');
      console.log('4. Check if the URL is correct');
    } else if (error.message.includes('denied') || error.code === '42501') {
      console.log('AUTHENTICATION ISSUE:');
      console.log('1. Verify your API key is correct');
      console.log('2. Make sure your API key has appropriate permissions');
    } else if (error.code === '42P01') {
      console.log('DATABASE STRUCTURE ISSUE:');
      console.log('1. Your tables may not be created yet');
      console.log(`2. Run the SQL setup script: node server/tools/setup_db.js`);
    }
    
    process.exit(1);
  }
}

testConnection();
