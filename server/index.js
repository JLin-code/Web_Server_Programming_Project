require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const http = require('http');

// Import Supabase utilities
const { supabase, testConnection } = require('./utils/supabaseClient');

// Add environment variable validation early in startup
const { checkSupabaseConfig } = require('./utils/env-checker');
checkSupabaseConfig();

// Import controllers with error handling for missing modules
function safeRequire(modulePath) {
  try {
    return require(modulePath);
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.warn(`Warning: Module not found - ${modulePath}`);
      // Return a simple router that returns 501 Not Implemented
      const router = express.Router();
      router.all('*', (req, res) => {
        res.status(501).json({ 
          success: false, 
          message: 'This functionality is not yet implemented'
        });
      });
      return router;
    }
    throw err;
  }
}

// Import controllers with safe require
const authController = require('./controllers/auth');
const usersController = require('./controllers/users');
const activitiesController = require('./controllers/activities');
const friendsController = safeRequire('./controllers/friends');
const commentsController = safeRequire('./controllers/comments');
const systemController = safeRequire('./controllers/system');

// Use environment variable or default port, with fallback logic
const DEFAULT_PORT = 3000;
const PORT = process.env.PORT || DEFAULT_PORT;
const MAX_PORT_ATTEMPTS = 10; // Try up to 10 ports before giving up

const app = express();

// Define allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'https://clientsidewebsite.onrender.com'
];

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(null, false);
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Create server but don't start listening yet
const server = http.createServer(app);

// Function to attempt listening on a port, and try the next one if it fails
function startServer(port, attempt = 1) {
  server.listen(port, '0.0.0.0')
    .on('listening', async () => {
      const actualPort = server.address().port;
      console.log(`Server is running on port ${actualPort}`);
      console.log(`http://localhost:${actualPort}`);
      
      // Test Supabase connection on server start
      console.log('Testing Supabase connection...');
      await testConnection();
      
      if (clientDistExists) {
        console.log('\x1b[32m%s\x1b[0m', `Client app is being served from ${clientDistPath}`);
      } else {
        console.log('\x1b[33m%s\x1b[0m', 'Note: Client app is not built. Using remote client at https://clientsidewebsite.onrender.com');
      }
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE' && attempt < MAX_PORT_ATTEMPTS) {
        const nextPort = port + 1;
        console.log(`Port ${port} is already in use, trying port ${nextPort}...`);
        server.close();
        startServer(nextPort, attempt + 1);
      } else {
        console.error('Error starting server:', err);
        process.exit(1);
      }
    });
}

// Check if client dist directory exists before trying to serve it
const clientDistPath = path.join(__dirname, '../client/dist');
const clientDistExists = fs.existsSync(clientDistPath);

if (clientDistExists) {
  // Serve static files from the client distribution folder
  app.use('/', express.static(clientDistPath));
} else {
  console.log('Warning: Client dist directory not found. Static file serving is disabled.');
  console.log('Note: Using remote client at https://clientsidewebsite.onrender.com');
}

// API root endpoint
app.get('/api/v1', (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to the Fitness Tracker API',
    version: '1.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      friends: '/api/v1/friends',
      activities: '/api/v1/activities',
      health: '/api/health'
    }
  });
});

// Public routes
app.use('/api/v1/auth', authController);
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date() });
});

// Register API routes
app.use('/api/v1/auth', authController);
app.use('/api/v1/users', usersController);
app.use('/api/v1/activities', activitiesController);
app.use('/api/v1/friends', friendsController);
app.use('/api/v1/comments', commentsController);
if (systemController) app.use('/api', systemController);

// Protected routes - require authentication
app.use('/api/v1/users', verifyToken, usersController);
app.use('/api/v1/friends', verifyToken, friendsController);
app.use('/api/v1/activities', verifyToken, activitiesController);

// Catch-all route - modified to handle missing client/dist directory properly
app.get('*', (req, res, next) => {
  // Only attempt to serve client app if it's an API request or the directory exists
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  if (!clientDistExists) {
    return res.status(200).send(`
      <h1>API Server Running</h1>
      <p>This server is configured to work with the remote client at:</p>
      <p><a href="https://clientsidewebsite.onrender.com" style="color: blue; text-decoration: underline;">https://clientsidewebsite.onrender.com</a></p>
      <p>API endpoints are available at <a href="/api/v1" style="color: blue; text-decoration: underline;">/api/v1</a></p>
    `);
  }

  // If we get here, the client/dist directory exists
  try {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  } catch (err) {
    next(err);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  // Determine if the error is JSON-related
  const isJsonSyntaxError = err instanceof SyntaxError && 
    err.status === 400 && 
    'body' in err;
  
  if (isJsonSyntaxError) {
    return res.status(400).json({
      status: 400,
      message: 'Invalid JSON payload',
      details: err.message
    });
  }
  
  // Handle other types of errors
  const status = err.status || 500;
  const error = {
    status,
    message: err.message || 'Internal Server Error',
    // Add stack trace in development only
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {})
  };
  
  res.status(status).json(error);
});

// Start the server with automatic port selection
startServer(PORT);

// Export the app for testing
module.exports = app;