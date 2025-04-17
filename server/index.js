require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

// Import controllers
const { router: authController, authenticateToken } = require('./controllers/auth');
const productsController = require('./controllers/products');
const usersController = require('./controllers/users');
const friendsController = require('./controllers/friends');

const PORT = process.env.PORT ?? 3000;
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Allow frontend origin
  credentials: true // Allow cookies to be sent
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from the client distribution folder
app.use('/', express.static(path.join(__dirname, '../client/dist')));

// Public routes
app.use('/api/v1/auth', authController);
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date() });
});

// Protected routes - require authentication
app.use('/api/v1/products', authenticateToken, productsController);
app.use('/api/v1/users', authenticateToken, usersController);
app.use('/api/v1/friends', authenticateToken, friendsController);

// Catch-all route to serve the client app for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/v1`);
});