require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');

// Import controllers
const { router: authController, authenticateToken } = require('./controllers/auth');
const productsController = require('./controllers/products');
const usersController = require('./controllers/users');
const friendsController = require('./controllers/friends');
const activitiesController = require('./controllers/activities');

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
      products: '/api/v1/products',
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

// Protected routes - require authentication
app.use('/api/v1/products', authenticateToken, productsController);
app.use('/api/v1/users', authenticateToken, usersController);
app.use('/api/v1/friends', authenticateToken, friendsController);
app.use('/api/v1/activities', authenticateToken, activitiesController);

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
  console.error(err);
  const status = err.status || 500;
  const error = {
    status,
    message: err.message || 'Internal Server Error',
  };
  res.status(status).json(error);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
  
  if (clientDistExists) {
    console.log('\x1b[32m%s\x1b[0m', `Client app is being served from ${clientDistPath}`);
  } else {
    console.log('\x1b[33m%s\x1b[0m', 'Note: Client app is not built. Using remote client at https://clientsidewebsite.onrender.com');
  }
});