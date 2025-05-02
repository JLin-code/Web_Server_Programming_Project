/**
 * User data is no longer stored in the client for security purposes.
 * All user data is managed exclusively on the server side.
 * 
 * This file exists only for backwards compatibility with existing imports.
 * Consider refactoring any code that imports from this file.
 */

// User type definition only - for TypeScript type checking
export interface DemoUser {
  username: string;
  displayName: string;
  firstName: string;
  lastName: string;
  role: string;
}

// No hardcoded data - empty array
export const demoUsers: DemoUser[] = [];

export default demoUsers;
