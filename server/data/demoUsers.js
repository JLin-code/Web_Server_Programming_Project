/**
 * Demo users for development and testing
 * This file provides sample users for the login form when real database access is not available
 */

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

/**
 * Get all demo users in a format ready for client consumption
 */
function getAllDemoUsers() {
  return demoUsers.map(user => ({
    username: user.username,
    displayName: user.displayName
  }));
}

/**
 * Get a specific demo user by username
 * @param {string} username - Email address of the demo user
 */
function getDemoUserByUsername(username) {
  return demoUsers.find(user => user.username === username);
}

module.exports = {
  getAllDemoUsers,
  getDemoUserByUsername,
  demoUsers
};
