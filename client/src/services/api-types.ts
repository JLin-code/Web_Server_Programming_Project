import { AxiosInstance } from 'axios';

// Auth service types
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role?: string;
  isAdmin?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}

export interface DemoUser {
  username: string;
  displayName: string;
}

export interface DemoUsersResponse {
  success: boolean;
  message?: string;
  users: DemoUser[];
  source?: string;
}

// User service types
export interface UsersResponse {
  success: boolean;
  message?: string;
  items?: User[];
  count?: number;
}

export interface UserResponse {
  success: boolean;
  message?: string;
  user?: User;
}

// Auth service interface
export interface AuthService {
  login(username: string, password: string): Promise<AuthResponse>;
  logout(): Promise<{ success: boolean; message?: string }>;
  getCurrentUser(): Promise<AuthResponse>;
  getDemoUsers(): Promise<DemoUsersResponse>;
}

// User service interface
export interface UserService {
  getUsers(): Promise<UsersResponse>;
  getUserById(id: string): Promise<UserResponse>;
  updateUser(id: string, userData: Record<string, any>): Promise<UserResponse>;
  delete(id: string): Promise<{ success: boolean; message?: string }>;
}

// Exported API instance type
export type ApiInstance = AxiosInstance;
