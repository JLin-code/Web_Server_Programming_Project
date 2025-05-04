/**
 * Helper function to safely execute API calls with error handling
 * @param apiCall - The API function to call
 * @param defaultValue - Default value to return if the API call fails
 * @returns The result of the API call or the default value
 */
export async function safeApiCall<T>(apiCall: () => Promise<T>, defaultValue: T): Promise<T> {
  try {
    const result = await apiCall();
    return result;
  } catch (error) {
    console.error('API call failed:', error);
    return defaultValue;
  }
}

/**
 * Interface defining a user structure
 */
interface User {
  id: string | number;
  username: string;
  // Add other required user properties based on your actual data structure
}

/**
 * Interface defining the shape of authentication service
 */
interface AuthService {
  getDemoUsers(): Promise<{
    success: boolean;
    message: string;
    users: User[];
  }>;
  // Add other methods as needed
}

/**
 * Creates a more robust version of the auth service
 * @param authService - The original auth service
 * @returns A wrapped version of the auth service with better error handling
 */
export function createRobustAuthService(authService: AuthService) {
  return {
    ...authService,
    getDemoUsers: async () => {
      return safeApiCall(
        async () => await authService.getDemoUsers(),
        { success: false, message: 'Failed to load demo users', users: [] }
      );
    }
  };
}
