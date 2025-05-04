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

// System diagnostics endpoint
router.get('/diagnostics', async (req, res) => {
  try {
    // Check Supabase connection
    let dbStatus = { connected: false, latency: null };
    const startTime = Date.now();
    
    try {
      // Simple query to check if database is responsive
      const { data, error } = await supabase.from('users').select('count').limit(1);
      const endTime = Date.now();
      
      dbStatus = {
        connected: !error,
        latency: endTime - startTime,
        error: error ? error.message : null
      };
    } catch (dbError) {
      dbStatus.error = dbError.message;
    }
    
    // Get system info
    const diagnostics = {
      api: {
        status: 'online',
        serverTime: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
      },
      database: dbStatus,
      memory: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(process.memoryUsage().external / 1024 / 1024)}MB`,
      }
    };
    
    return res.status(200).json(diagnostics);
  } catch (error) {
    console.error('Error in diagnostics endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve system diagnostics',
      error: process.env.NODE_ENV === 'production' ? {} : {
        name: error.name,
        message: error.message,
      }
    });
  }
});

module.exports = router;
