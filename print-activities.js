/**
 * Activities Data Printer
 * 
 * This script directly prints out activities from the database
 * to demonstrate that the connection is working with related data.
 * 
 * Run with: node print-activities.js
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

// Function to fetch and print activities with related data
async function printActivities() {
  console.log('Fetching activities from database...');
  
  try {
    // Fetch activities with user information
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        user:user_id (
          id, first_name, last_name, email
        )
      `)
      .limit(5)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching activities:', error.message);
      console.error('Code:', error.code);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('No activities found in the database.');
      return;
    }
    
    console.log('\n✅ SUCCESS! Data retrieved from Supabase!\n');
    console.log(`Found ${data.length} activities in the database:`);
    console.log('------------------------------------');
    
    // Print each activity in a readable format
    data.forEach((activity, index) => {
      console.log(`\n[Activity ${index + 1}]`);
      console.log(`ID: ${activity.id}`);
      console.log(`Type: ${activity.type || 'N/A'}`);
      console.log(`Description: ${activity.description || 'N/A'}`);
      console.log(`Created: ${new Date(activity.created_at).toLocaleString()}`);
      
      if (activity.user) {
        console.log(`\nPosted by: ${activity.user.first_name} ${activity.user.last_name}`);
        console.log(`User email: ${activity.user.email}`);
      } else {
        console.log('\nNo user information available');
      }
    });
    
    console.log('\n------------------------------------');
    console.log('✅ Your Supabase connection is WORKING with related data!');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Execute the function
printActivities();
