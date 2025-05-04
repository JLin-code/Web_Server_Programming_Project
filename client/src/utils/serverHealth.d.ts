/**
 * Server health check response interface
 */
export interface ServerHealthResponse {
  online: boolean;
  latency?: number;
  error?: string;
  cached?: boolean;
  serverError?: boolean;
  statusCode?: number;
  timestamp?: string;
}

/**
 * Fallback health check response interface
 */
export interface FallbackHealthResponse {
  online: boolean;
  method: string;
  latency?: number;
  limited?: boolean;
  error?: string;
}

/**
 * Network diagnosis response interface
 */
export interface DiagnosisResponse {
  browserOnline: boolean;
  connectionType: string;
  serverReachable: boolean;
  possibleIssues: string[];
  internetConnectivity?: boolean;
  fallbackHealthCheck?: FallbackHealthResponse;
}

/**
 * API endpoint check response interface
 */
export interface ApiEndpointResponse {
  available: boolean;
  statusCode?: number;
  error?: string;
}

/**
 * Check if the server is up
 * @returns Promise with server health status
 */
export function checkServerHealth(): Promise<ServerHealthResponse>;

/**
 * Attempt alternative health checks when primary fails
 * @returns Promise with fallback health check results
 */
export function fallbackHealthCheck(): Promise<FallbackHealthResponse>;

/**
 * Get information about why server might be offline
 * @returns Promise with diagnostic information
 */
export function diagnoseServerConnection(): Promise<DiagnosisResponse>;

/**
 * Checks if a particular API endpoint is available
 * @param endpoint - The API endpoint to check (e.g. "/api/v1/users")
 * @returns Promise with API endpoint availability status
 */
export function checkApiEndpoint(endpoint: string): Promise<ApiEndpointResponse>;

/**
 * Default export containing all server health utilities
 */
declare const _default: {
  checkServerHealth: typeof checkServerHealth;
  diagnoseServerConnection: typeof diagnoseServerConnection;
  fallbackHealthCheck: typeof fallbackHealthCheck;
  checkApiEndpoint: typeof checkApiEndpoint;
};

export default _default;
