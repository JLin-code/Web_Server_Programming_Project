/**
 * User data is no longer stored in the client for security purposes.
 * All user data is managed exclusively on the server side.
 * 
 * This file exists only for backwards compatibility with existing imports.
 * Consider refactoring any code that imports from this file.
 */

// Empty array - NO client-side user data for security
export const demoUsers = [];

// Export a deprecation notice function
export const getDemoUsers = () => {
  console.warn('WARNING: getDemoUsers() is deprecated. Use AuthService.getDemoUsers() instead.');
  return { success: false, message: 'Demo users are only available through the server API', users: [] };
};

export default demoUsers;
