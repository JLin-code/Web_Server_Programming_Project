import { reactive } from 'vue';
import { userService, friendService, authService } from '../services/api';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  handle: string;
  isFriend?: boolean;
}

interface UserState {
  currentUser: string;
  isLoggedIn: boolean;
  userId: number | null;
  users: User[];
  friends: User[];
  loading: boolean;
  error: string | null;
}

const state = reactive<UserState>({
  currentUser: '',
  isLoggedIn: false,
  userId: null,
  users: [],
  friends: [],
  loading: false,
  error: null
});

// Export the store methods
export default {
  // Authentication
  async login(username: string, password: string) {
    try {
      state.loading = true;
      // Send credentials to server for validation
      const authResponse = await authService.login(username, password);
      
      if (authResponse.success) {
        state.currentUser = authResponse.user.username;
        state.isLoggedIn = true;
        state.userId = authResponse.user.id;
        
        await this.loadUsers();
        await this.loadFriends();
        return true;
      } else {
        state.error = authResponse.message || 'Login failed';
        return false;
      }
    } catch (error) {
      state.error = 'Login failed';
      return false;
    } finally {
      state.loading = false;
    }
  },

  async logout() {
    try {
      state.loading = true;
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      state.currentUser = '';
      state.isLoggedIn = false;
      state.userId = null;
      state.friends = [];
      state.loading = false;
    }
  },

  // User data
  async loadUsers() {
    try {
      state.loading = true;
      const response = await userService.getAll();
      state.users = response.items.map((user: any) => ({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        handle: user.handle || `@${user.first_name.toLowerCase()}`,
      }));
      return state.users;
    } catch (error) {
      state.error = 'Failed to load users';
      return [];
    } finally {
      state.loading = false;
    }
  },

  async loadFriends() {
    if (!state.userId) return [];

    try {
      state.loading = true;
      const response = await friendService.getFriends(state.userId);
      state.friends = response.items.map((user: any) => ({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        handle: user.handle || `@${user.first_name.toLowerCase()}`,
        isFriend: true
      }));
      return state.friends;
    } catch (error) {
      state.error = 'Failed to load friends';
      return [];
    } finally {
      state.loading = false;
    }
  },

  async addFriend(friendId: number) {
    if (!state.userId) return false;

    try {
      state.loading = true;
      await friendService.addFriend(state.userId, friendId);
      await this.loadFriends(); // Reload friends list
      return true;
    } catch (error) {
      state.error = 'Failed to add friend';
      return false;
    } finally {
      state.loading = false;
    }
  },

  async removeFriend(friendId: number) {
    if (!state.userId) return false;

    try {
      state.loading = true;
      await friendService.removeFriend(state.userId, friendId);
      await this.loadFriends(); // Reload friends list
      return true;
    } catch (error) {
      state.error = 'Failed to remove friend';
      return false;
    } finally {
      state.loading = false;
    }
  },

  // Getters
  isLoggedIn(): boolean {
    return state.isLoggedIn;
  },

  currentUser(): string {
    return state.currentUser;
  },

  getUsers(): User[] {
    return state.users;
  },

  getFriends(): User[] {
    return state.friends;
  },

  getError(): string | null {
    return state.error;
  }
};
