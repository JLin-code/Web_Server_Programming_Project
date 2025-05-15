const express = require('express');
const app = express();
const dataRoutes = require('./routes/dataRoutes');
const cors = require('cors');

// Import Supabase client
const { supabase, testConnection } = require('./utils/supabaseClient');

// Middleware
app.use(express.json());
app.use(cors()); // Add CORS middleware

// Test Supabase connection on startup
let supabaseConnected = false;
app.use(async (req, res, next) => {
  // Only test connection once on first request if not yet connected
  if (!supabaseConnected) {
    try {
      supabaseConnected = await testConnection();
      console.log('Supabase connection status:', supabaseConnected ? 'Connected' : 'Failed');
    } catch (error) {
      console.error('Error testing Supabase connection:', error);
    }
  }
  next();
});

// Register the data routes
app.use('/api/v1/data', dataRoutes);

// Import the diagnostics controller
const diagnosticsRouter = require('./controllers/diagnostics');

// Import controllers
const usersController = require('./controllers/users'); 
const activitiesController = require('./controllers/activities'); 
const friendsController = require('./controllers/friends');
const authController = require('./controllers/auth');
const systemController = require('./controllers/system');
const dbTestController = require('./controllers/dbTestController');
const healthController = require('./controllers/health');

// Add a Supabase health check endpoint with enhanced debugging
app.get('/api/health/supabase', async (req, res) => {
  try {
    console.log('Testing Supabase connection...');
    const startTime = Date.now();
    
    // More verbose query to help debug
    console.log('Executing test query to users table...');
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
      
    const responseTime = Date.now() - startTime;
    
    if (error) {
      console.error('Supabase query failed:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Supabase connection failed',
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        responseTime: `${responseTime}ms`
      });
    }
    
    console.log('Supabase query succeeded:', data);
    return res.status(200).json({
      status: 'success',
      message: 'Supabase connection successful',
      data,
      responseTime: `${responseTime}ms`
    });
  } catch (err) {
    console.error('Unexpected Supabase error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Unexpected error checking Supabase connection',
      error: err.message
    });
  }
});

app.use('/api/diagnostics', diagnosticsRouter);
app.use('/api/system', systemController);
app.use('/api/db-test', dbTestController);

// Register routes - ONLY use real data routes
app.use('/api/v1/auth', authController);
app.use('/api/v1/health', healthController);

// Add real data Supabase controllers
app.use('/api/v1/users', usersController);
app.use('/api/v1/activities', activitiesController);
app.use('/api/v1/friends', friendsController);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  
  // Special handling for Supabase errors
  if (err.message && err.message.includes('Supabase')) {
    return res.status(503).json({
      error: {
        message: 'Database connection error',
        details: err.message
      }
    });
  }
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    }
  });
});

module.exports = app;