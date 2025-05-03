const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const { getAllDemoUsers } = require('../data/demoUsers');
const router = express.Router();

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-jwt-secret-key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Try to find user by email (username is actually email)
    const user = await userModel.getByEmail(username);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Create token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
    
    // Set token in cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    return res.json({
      success: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error during authentication'
    });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  return res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Get current user
router.get('/current-user', async (req, res) => {
  try {
    // Check for token in cookies
    const token = req.cookies.auth_token;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const user = await userModel.getById(decoded.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.json({
      success: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    console.error('Error getting current user:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting current user'
    });
  }
});

// Demo users for development - provides dummy users for login form
router.get('/demo-users', async (req, res) => {
  try {
    // Try to get users from the database first
    let demoUsers = [];
    let source = 'fallback';
    
    try {
      const users = await userModel.getAll();
      
      // Map to a safe subset of information for the login form
      if (users && users.length > 0) {
        demoUsers = users.map(user => ({
          username: user.email, 
          displayName: `${user.first_name} ${user.last_name} (${user.role === 'admin' ? 'Admin' : 'User'})`
        }));
        source = 'api';
      }
    } catch (dbError) {
      console.warn('Database error fetching demo users, using fallback:', dbError);
    }
    
    // If no users from database, use our fallback demo users
    if (demoUsers.length === 0) {
      demoUsers = getAllDemoUsers();
      source = 'fallback';
    }
    
    return res.json({
      success: true,
      users: demoUsers,
      source: source
    });
    
  } catch (error) {
    console.error('Error fetching demo users:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching demo users',
      users: []
    });
  }
});

// Middleware for verifying JWT tokens
const verifyToken = (req, res, next) => {
  const token = req.cookies.auth_token;
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Admin role check middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Access denied. Admin role required.'
  });
};

// Export both router and middleware
module.exports = {
  router,
  verifyToken,
  isAdmin
};
