/**
 * Database Test Controller
 * 
 * Provides endpoints to verify database connectivity through the API
 */
const express = require('express');
const router = express.Router();
const { supabase } = require('../utils/supabaseClient');

// Get all users - simple test endpoint
router.get('/users', async (req, res) => {
  console.log('API request: Fetching all users...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, created_at')
      .limit(10);
    
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
    
    console.log(`Successfully retrieved ${data.length} users`);
    
    return res.json({
      success: true,
      count: data.length,
      users: data
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error processing request'
    });
  }
});

// Get all activities - test relationships
router.get('/activities', async (req, res) => {
  console.log('API request: Fetching activities with related data...');
  
  try {
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
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
    
    console.log(`Successfully retrieved ${data.length} activities`);
    
    return res.json({
      success: true,
      count: data.length,
      activities: data
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error processing request'
    });
  }
});

// Test specific table columns - helpful for schema debugging
router.get('/table-info/:tableName', async (req, res) => {
  const { tableName } = req.params;
  console.log(`API request: Getting info about table ${tableName}...`);
  
  // Whitelist tables for security
  const allowedTables = ['users', 'activities', 'activity_comments', 'friends'];
  
  if (!allowedTables.includes(tableName)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid table name'
    });
  }
  
  try {
    // First get column info
    const { data, error } = await supabase
      .from(tableName)
      .select()
      .limit(1);
      
    if (error) {
      console.error(`Error accessing table ${tableName}:`, error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
    
    // Get count of records
    const { data: countData, error: countError } = await supabase
      .from(tableName)
      .select('count');
      
    if (countError) {
      console.error(`Error counting records in ${tableName}:`, countError);
    }
    
    const columns = data.length > 0 ? Object.keys(data[0]) : [];
    const count = countData?.[0]?.count || 'unknown';
    
    return res.json({
      success: true,
      table: tableName,
      columns,
      rowCount: count,
      sampleData: data
    });
    
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error processing request'
    });
  }
});

module.exports = router;
