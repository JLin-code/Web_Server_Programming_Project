const express = require('express');
const router = express.Router();
const { supabase, testConnection } = require('../utils/supabaseClient');

// Test database connection
router.get('/db-connection', async (req, res) => {
  try {
    console.log('Running database connection test...');
    const startTime = process.hrtime();
    
    // Try to fetch data from the users table
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    const hrTime = process.hrtime(startTime);
    const duration = hrTime[0] * 1000 + hrTime[1] / 1000000;
    
    if (error) {
      console.error(`Database connection test failed (${duration.toFixed(2)}ms):`, error);
      return res.status(500).json({
        success: false,
        message: 'Database connection test failed',
        error: error.message,
        code: error.code,
        duration: `${duration.toFixed(2)}ms`
      });
    }
    
    console.log(`Database connection test successful (${duration.toFixed(2)}ms):`, data);
    return res.json({
      success: true,
      message: 'Database connection successful',
      data,
      duration: `${duration.toFixed(2)}ms`
    });
  } catch (error) {
    console.error('Critical database connection error:', error);
    return res.status(500).json({
      success: false,
      message: 'Critical database connection error',
      error: error.message,
      duration: 'N/A'
    });
  }
});

// Get environment information (safe details only)
router.get('/environment', (req, res) => {
  // Check all possible service role key variables
  const serviceRoleKey = 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_SERVICE_KEY || 
    process.env.SUPABASE_SECRET_KEY;
  
  const usingServiceRole = serviceRoleKey?.includes('service_role') || false;
  
  const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    SUPABASE_URL_SET: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY_SET: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_SERVICE_KEY_SET: !!process.env.SUPABASE_SERVICE_KEY,
    SUPABASE_SECRET_KEY_SET: !!process.env.SUPABASE_SECRET_KEY,
    SUPABASE_KEY_SET: !!process.env.SUPABASE_KEY,
    USING_SERVICE_ROLE: usingServiceRole,
    SERVER_PORT: process.env.PORT || '3000',
  };
  
  res.json({
    success: true,
    environment: env,
    warnings: !usingServiceRole ? ['Not using service role key. SQL execution and admin features will fail.'] : []
  });
});

module.exports = router;
