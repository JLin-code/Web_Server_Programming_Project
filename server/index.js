require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');

// Import controllers
const { router: authController, authenticateToken } = require('./controllers/auth');
const usersController = require('./controllers/users');
const friendsController = require('./controllers/friends');
const activitiesController = require('./controllers/activities');
const exerciseTypesController = require('./controllers/exerciseTypes');

const PORT = process.env.PORT ?? 3000;
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
      exerciseTypes: '/api/v1/exercise-types',
      health: '/api/health'
    }
  });
});

// Public routes
app.use('/api/v1/auth', authController);
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date() });
});

// Protected routes - require authentication
app.use('/api/v1/users', authenticateToken, usersController);
app.use('/api/v1/friends', authenticateToken, friendsController);
app.use('/api/v1/activities', authenticateToken, activitiesController);
app.use('/api/v1/exercise-types', authenticateToken, exerciseTypesController);

// Catch-all route - modified to handle missing client/dist directory properly
app.get('*', (req, res, next) => {
  // Handle API routes first
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // For non-API routes, serve the index.html if client dist exists
  if (clientDistExists) {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  } else {
    // If client dist doesn't exist, redirect to remote client
    res.redirect('https://clientsidewebsite.onrender.com');
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  
  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    message: message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/v1`);
});