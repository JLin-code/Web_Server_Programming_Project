/**
 * Database Schema Validator
 * Checks if required tables exist in your Supabase database
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Get credentials from environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

// Define required tables for application
const requiredTables = [
  'users',
  'activities',
  'activity_comments',
  'friends'
];

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Check if tables exist
async function checkTables() {
  console.log('=== DATABASE SCHEMA VALIDATOR ===');
  console.log('Checking required tables...\n');
  
  let allTablesExist = true;
  
  for (const tableName of requiredTables) {
    try {
      console.log(`Checking table '${tableName}'...`);
      const { data, error } = await supabase
        .from(tableName)
        .select('count')
        .limit(0);
      
      if (error) {
        console.error(`❌ Table '${tableName}' check failed: ${error.message}`);
        if (error.code === '42P01') {
          console.log(`   Table '${tableName}' does not exist in the database`);
        }
        allTablesExist = false;
      } else {
        console.log(`✅ Table '${tableName}' exists`);
        
        // Get row count
        const { data: countData, error: countError } = await supabase
          .from(tableName)
          .select('count');
          
        if (!countError && countData) {
          console.log(`   Contains approximately ${countData.length > 0 ? countData[0].count : 0} records`);
        }
      }
    } catch (err) {
      console.error(`❌ Error checking table '${tableName}': ${err.message}`);
      allTablesExist = false;
    }
    
    console.log(''); // Add line break between tables
  }
  
  console.log('\n=== SUMMARY ===');
  
  if (allTablesExist) {
    console.log('✅ All required tables exist in the database');
    console.log('\nYour database schema appears to be correctly set up!');
  } else {
    console.log('❌ Some required tables are missing from your database');
    console.log('\nTo set up your database schema, try running:');
    console.log('node server/tools/setup_db.js');
  }
}

// Run the checks
checkTables();
