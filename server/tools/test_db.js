require('dotenv').config({ path: '../../.env' });
const { supabase } = require('../models/supabase');

async function testDatabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test connection
    const { data: connectionTest, error: connectionError } = await supabase.from('users').select('count');
    
    if (connectionError) {
      console.error('❌ Connection failed:', connectionError);
    } else {
      console.log('✅ Connection successful!');
    }
    
    // Check if users table exists and has data
    const { data: users, error: usersError } = await supabase.from('users').select('*');
    
    if (usersError) {
      console.error('❌ Failed to query users table:', usersError);
    } else {
      console.log(`Found ${users.length} users in database`);
      if (users.length > 0) {
        console.log('First user:', JSON.stringify(users[0], null, 2));
      } else {
        console.log('No users found in the database');
      }
    }
    
    // Check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables');
    
    if (tablesError) {
      console.error('❌ Failed to get tables:', tablesError);
    } else {
      console.log('Database tables:', tables);
    }
    
  } catch (error) {
    console.error('Unexpected error during database test:', error);
  }
}

testDatabaseConnection();
