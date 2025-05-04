/**
 * User data is now imported from hardcodedUsers.ts for consistency.
 * This file exists only for backwards compatibility with existing imports.
 */

// Import from the TypeScript version to ensure consistency
import { demoUsers as tsDemoUsers } from './hardcodedUsers.ts';

// Use the TypeScript version instead of an empty array
export const demoUsers = tsDemoUsers;

// Export a function that actually returns the demo users
export const getDemoUsers = () => {
  console.warn('WARNING: getDemoUsers() is deprecated. Use AuthService.getDemoUsers() instead.');
  return { 
    success: true, 
    message: 'Using fallback demo users', 
    users: tsDemoUsers.map(user => ({
      username: user.username,
      displayName: user.displayName
    }))
  };
};

export default demoUsers;
