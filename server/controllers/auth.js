const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { CustomError, statusCodes } = require('../models/errors');
const userModel = require('../models/users');
const router = express.Router();

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Use a secure key in production

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required'
    });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }
    
    req.user = user;
    next();
  });
}

// Registration
router.post('/register', async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, handle } = req.body;
    
    // Validate required fields
    if (!first_name || !last_name || !email || !password) {
      throw new CustomError('Missing required fields', statusCodes.BAD_REQUEST);
    }
    
    // Check if user already exists
    try {
      await userModel.getByEmail(email);
      throw new CustomError('User with this email already exists', statusCodes.BAD_REQUEST);
    } catch(err) {
      // If user not found error, continue with registration
      if (err.status !== statusCodes.NOT_FOUND) {
        throw err;
      }
    }
    
    // Create the new user
    const userData = {
      first_name,
      last_name,
      email,
      password,
      handle
    };
    
    const user = await userModel.create(userData);
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        is_admin: user.is_admin
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        handle: user.handle,
        is_admin: user.is_admin
      }
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      throw new CustomError('Email and password are required', statusCodes.BAD_REQUEST);
    }
    
    // Get user by email
    const user = await userModel.getByEmail(email);
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new CustomError('Invalid password', statusCodes.UNAUTHORIZED);
    }
    
    // Generate token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        is_admin: user.is_admin 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return user info and token
    res.json({
      status: 'success',
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        handle: user.handle,
        is_admin: user.is_admin
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/current-user', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await userModel.get(userId);
    
    // Don't return password
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      status: 'success',
      user: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
});

// Logout - this is mostly for clearing cookies if you're using them
router.post('/logout', (req, res) => {
  res.json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

module.exports = {
  router,
  authenticateToken
};
