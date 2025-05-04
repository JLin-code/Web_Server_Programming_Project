const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const { getAllDemoUsers } = require('../data/demoUsers');
const router = express.Router();

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-jwt-secret-key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

// Add debug logging
const DEBUG = process.env.DEBUG_AUTH === 'true';

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
      // If user not found in database, check if it's a demo user
      const demoUserData = getDemoUserByUsername(username);
      
      if (demoUserData) {
        // For demo users, accept any password (simplified for demo purposes)
        if (DEBUG) console.log(`[Auth Controller] Using demo user: ${username}`);
        
        // Create a simplified user object from demo data
        const demoUser = {
          id: `demo-${Date.now()}`,
          first_name: demoUserData.firstName || demoUserData.displayName.split(' ')[0],
          last_name: demoUserData.lastName || demoUserData.displayName.split(' ').slice(1).join(' '),
          email: username,
          role: demoUserData.isAdmin ? 'admin' : 'user'
        };
        
        // Create token for demo user
        const token = jwt.sign(
          { 
            id: demoUser.id,
            email: demoUser.email,
            role: demoUser.role 
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
          user: demoUser
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // For real database users, we need to check password
    if (password === 'password') {
      // Special case: If the generic "password" is used, accept it for any user
      if (DEBUG) console.log(`[Auth Controller] Using generic password for user: ${username}`);
    } else {
      // Otherwise, verify the password properly
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
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
        role: user.role,
        profile_picture_url: user.profile_picture_url
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
    if (DEBUG) console.log('[Auth Controller] Getting current user from token');
    
    // Check for token in cookies
    const token = req.cookies.auth_token;
    
    if (!token) {
      if (DEBUG) console.log('[Auth Controller] No auth token found in cookies');
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    if (DEBUG) console.log(`[Auth Controller] Token verified, user ID: ${decoded.id}`);
    
    // Get user from database
    const user = await userModel.getById(decoded.id);
    
    if (!user) {
      console.error(`[Auth Controller] User not found with ID: ${decoded.id}`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (DEBUG) console.log(`[Auth Controller] Current user retrieved: ${user.first_name} ${user.last_name}`);
    
    return res.json({
      success: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        profile_picture_url: user.profile_picture_url
      }
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      console.error('[Auth Controller] Invalid or expired token:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    console.error('[Auth Controller] Error getting current user:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting current user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Demo users for development - provides dummy users for login form
router.get('/demo-users', async (req, res) => {
  try {
    console.log('Fetching users for login dropdown');
    
    // First try to get real users from database
    let users = [];
    let source = 'database';
    
    try {
      const dbUsers = await userModel.getAll();
      
      if (dbUsers && dbUsers.length > 0) {
        users = dbUsers.map(user => ({
          username: user.email, 
          displayName: `${user.first_name} ${user.last_name}${user.role === 'admin' ? ' (Admin)' : ''}`,
          isAdmin: user.role === 'admin'
        }));
        console.log(`Returning ${users.length} users from database`);
      }
    } catch (dbError) {
      console.warn('Database error fetching users, using fallback:', dbError);
      source = 'fallback';
    }
    
    // If no users from database, use our fallback demo users
    if (users.length === 0) {
      users = demoUsers;
      console.log(`Returning ${users.length} fallback demo users`);
    }
    
    return res.json({
      success: true,
      users: users,
      source: source
    });
    
  } catch (error) {
    console.error('Error fetching users for dropdown:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving users',
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

// Mock demo users for development and testing
const demoUsers = [
  {
    username: 'admin@example.com',
    displayName: 'Admin User (Administrator)',
    firstName: 'Admin',
    lastName: 'User',
    isAdmin: true
  },
  {
    username: 'user@example.com',
    displayName: 'Regular User',
    firstName: 'Regular',
    lastName: 'User',
    isAdmin: false
  },
  {
    username: 'demo@example.com',
    displayName: 'Demo User',
    firstName: 'Demo',
    lastName: 'User',
    isAdmin: false
  }
];

// Basic middleware to verify JWT token
// This is a placeholder - in a real app, you'd verify the token properly
const verifyTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
  
  // In a real implementation, you would verify the token
  // For demo purposes, we'll just check if it exists
  next();
};

// Export both router and middleware
module.exports = {
  router,
  verifyToken,
  isAdmin
};
