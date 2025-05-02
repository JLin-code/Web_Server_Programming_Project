const express = require('express');
const router = express.Router();
const userModel = require('../models/user');

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await userModel.getAll();
    
    // Transform data to match expected client format
    const formattedUsers = users.map(user => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      handle: `@${user.first_name.toLowerCase()}`
    }));
    
    return res.json({
      success: true,
      items: formattedUsers,
      count: formattedUsers.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.getById(id);
    
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
        role: user.role,
        created_at: user.created_at,
        handle: `@${user.first_name.toLowerCase()}`
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email, password, role } = req.body;
    
    // Basic validation
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Check if user already exists
    try {
      const existingUser = await userModel.getByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
    } catch (error) {
      // If error is not found, continue; otherwise throw
      if (error.code !== 'PGRST116') throw error;
    }
    
    // Hash password
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    // Create user
    const userData = {
      first_name,
      last_name,
      email,
      password_hash,
      role: role || 'user'
    };
    
    const newUser = await userModel.create(userData);
    
    return res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        role: newUser.role,
        created_at: newUser.created_at
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating user'
    });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, role } = req.body;
    
    // Check if user exists
    const existingUser = await userModel.getById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Build update object with only provided fields
    const updateData = {};
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) {
      if (role !== 'user' && role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified'
        });
      }
      updateData.role = role;
    }
    
    // Update user
    const updatedUser = await userModel.update(id, updateData);
    
    return res.json({
      success: true,
      user: {
        id: updatedUser.id,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email: updatedUser.email,
        role: updatedUser.role,
        created_at: updatedUser.created_at
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await userModel.getById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Delete user
    await userModel.delete(id);
    
    return res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
});

// Get user activities
router.get('/:id/activities', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await userModel.getById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const activities = await userModel.getUserActivities(id);
    
    // Transform data to match expected client format
    const transformedData = activities.map(activity => ({
      ...activity,
      user: activity.user ? {
        id: activity.user.id,
        name: `${activity.user.first_name} ${activity.user.last_name}`,
        email: activity.user.email,
        role: activity.user.role
      } : null,
      comments: activity.comments ? activity.comments.map(comment => ({
        id: comment.id,
        text: comment.comment,
        created_at: comment.created_at,
        user: comment.user ? {
          id: comment.user.id,
          name: `${comment.user.first_name} ${comment.user.last_name}`
        } : null
      })) : []
    }));
    
    return res.json({
      success: true,
      items: transformedData,
      count: transformedData.length
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user activities'
    });
  }
});

// Change user role
router.patch('/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!role || (role !== 'user' && role !== 'admin')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }
    
    // Check if user exists
    const existingUser = await userModel.getById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Change role
    const updatedUser = await userModel.changeRole(id, role);
    
    return res.json({
      success: true,
      user: {
        id: updatedUser.id,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Error changing user role:', error);
    return res.status(500).json({
      success: false,
      message: 'Error changing user role'
    });
  }
});

module.exports = router;
