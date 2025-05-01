const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create a single Supabase client for interacting with your database
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/**
 * Execute a database query with error handling
 * @param {Function} queryFn - Function that performs the actual Supabase query
 * @returns {Promise} - Result of the query
 */
async function executeQuery(queryFn) {
  try {
    const result = await queryFn();
    
    if (result.error) {
      throw result.error;
    }
    
    return result.data;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

module.exports = {
  supabase,
  executeQuery
};
