const express = require('express');
const router = express.Router();
const { supabase } = require('../utils/supabaseClient');

// Simple ping endpoint for API health checks
router.get('/ping', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is up and running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint with more details
router.get('/health', (req, res) => {
  // Basic system health information
  const healthInfo = {
    success: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.status(200).json(healthInfo);
});

// Detailed DB test endpoint to debug Supabase connectivity
router.get('/db-test', async (req, res) => {
  console.log('Running database connectivity test...');
  try {
    const startTime = Date.now();
    
    // Basic query to check connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
      
    const responseTime = Date.now() - startTime;
    
    if (error) {
      console.error('Database test failed:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
        code: error.code,
        responseTime: `${responseTime}ms`
      });
    }
    
    return res.status(200).json({
      success: true,
      data,
      responseTime: `${responseTime}ms`,
      environmentChecks: {
        supabaseUrl: !!process.env.SUPABASE_URL,
        supabaseKeySet: !!process.env.SUPABASE_SECRET_KEY,
        nodeEnv: process.env.NODE_ENV || 'development'
      }
    });
  } catch (err) {
    console.error('Database test exception:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

module.exports = router;
