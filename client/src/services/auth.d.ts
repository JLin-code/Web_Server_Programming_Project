export interface User {
  id: string | number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: User;
}

export interface DemoUserResponse {
  success: boolean;
  users: Array<{
    username: string;
    displayName: string;
  }>;
  source?: string;
  message?: string;
}

export const authService: {
  login(username: string, password: string): Promise<LoginResponse>;
  logout(): Promise<{success: boolean; message?: string}>;
  getCurrentUser(): Promise<{user: User}>;
  getDemoUsers(): Promise<DemoUserResponse>;
};

export function authHeader(): Record<string, string>;
export function isAuthenticated(): boolean;
