/**
 * Controller to serve hardcoded user data for development and testing
 */
const express = require('express');
const router = express.Router();
const { demoUsers, getAllDemoUsers, getDemoUserByUsername } = require('../data/demoUsers');

// GET all demo users
router.get('/users', (req, res) => {
  try {
    const users = getAllDemoUsers();
    return res.status(200).json({
      success: true,
      message: 'Demo users retrieved successfully',
      users
    });
  } catch (error) {
    console.error('Error retrieving demo users:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving demo users'
    });
  }
});

// GET specific demo user by username
router.get('/users/:username', (req, res) => {
  try {
    const { username } = req.params;
    const user = getDemoUserByUsername(username);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Demo user ${username} not found`
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Demo user retrieved successfully',
      user
    });
  } catch (error) {
    console.error(`Error retrieving demo user ${req.params.username}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving demo user'
    });
  }
});

module.exports = router;
