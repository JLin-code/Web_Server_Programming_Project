/**
 * User Data Printer
 * 
 * This script directly prints out users from the database
 * to demonstrate that the connection is working.
 * 
 * Run with: node print-users.js
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Get credentials from environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

// Validate credentials
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials!');
  process.exit(1);
}

// Initialize the client
console.log('Connecting to Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to fetch and print users
async function printUsers() {
  console.log('Fetching users from database...');
  
  try {
    // Fetch all users with most fields
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching users:', error.message);
      console.error('Code:', error.code);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('No users found in the database.');
      return;
    }
    
    console.log('\n✅ SUCCESS! Data retrieved from Supabase!\n');
    console.log(`Found ${data.length} users in the database:`);
    console.log('------------------------------------');
    
    // Print each user in a readable format
    data.forEach((user, index) => {
      console.log(`\n[User ${index + 1}]`);
      console.log(`ID: ${user.id}`);
      console.log(`Name: ${user.first_name} ${user.last_name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Created: ${new Date(user.created_at).toLocaleString()}`);
    });
    
    console.log('\n------------------------------------');
    console.log('✅ Your Supabase connection is WORKING!');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Execute the function
printUsers();
