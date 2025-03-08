import { reactive, readonly } from 'vue';

// Define types
type TimePeriod = 'day' | 'week' | 'month' | 'allTime';
type TrackingData = {
  distance: number;
  duration: number;
  avgPace: number;
  calories: number;
};
type UserTrackingData = Record<TimePeriod, TrackingData>;
type UserDataStore = Record<string, UserTrackingData>;

// Mock data for different users
const userData: UserDataStore = {
  'ADMIN': {
    day: { distance: 8.5, duration: 45, avgPace: 5.3, calories: 520 },
    week: { distance: 42.3, duration: 230, avgPace: 5.4, calories: 2600 },
    month: { distance: 180.6, duration: 950, avgPace: 5.3, calories: 11000 },
    allTime: { distance: 2250.3, duration: 11500, avgPace: 5.1, calories: 135000 }
  },
  'Jane Smith': {
    day: { distance: 5.2, duration: 32, avgPace: 6.9, calories: 320 },
    week: { distance: 28.5, duration: 185, avgPace: 6.5, calories: 1850 },
    month: { distance: 112.4, duration: 720, avgPace: 6.4, calories: 7200 },
    allTime: { distance: 1035.7, duration: 6248, avgPace: 6.0, calories: 62480 }
  },
  'John Doe': {
    day: { distance: 3.1, duration: 25, avgPace: 8.1, calories: 210 },
    week: { distance: 18.6, duration: 145, avgPace: 7.8, calories: 1250 },
    month: { distance: 75.3, duration: 580, avgPace: 7.7, calories: 4900 },
    allTime: { distance: 745.2, duration: 5930, avgPace: 8.0, calories: 41500 }
  },
  'Major Major': {
    day: { distance: 6.8, duration: 35, avgPace: 5.1, calories: 390 },
    week: { distance: 32.7, duration: 198, avgPace: 6.1, calories: 2340 },
    month: { distance: 142.5, duration: 845, avgPace: 5.9, calories: 9800 },
    allTime: { distance: 1876.3, duration: 9250, avgPace: 4.9, calories: 112650 }
  },
  'Laura Green': {
    day: { distance: 4.3, duration: 38, avgPace: 8.8, calories: 275 },
    week: { distance: 24.9, duration: 215, avgPace: 8.6, calories: 1850 },
    month: { distance: 98.7, duration: 715, avgPace: 7.2, calories: 6240 },
    allTime: { distance: 923.5, duration: 7340, avgPace: 7.9, calories: 58720 }
  },
  'default': {
    day: { distance: 0, duration: 0, avgPace: 0, calories: 0 },
    week: { distance: 0, duration: 0, avgPace: 0, calories: 0 },
    month: { distance: 0, duration: 0, avgPace: 0, calories: 0 },
    allTime: { distance: 0, duration: 0, avgPace: 0, calories: 0 }
  }
};

// State management
const state = reactive({
  currentUser: '',
  isLoggedIn: false
});

// Store actions
const actions = {
  login(username: string) {
    state.currentUser = username;
    state.isLoggedIn = true;
  },
  logout() {
    state.currentUser = '';
    state.isLoggedIn = false;
  }
};

// Store getters
const getters = {
  getUserData(): UserTrackingData {
    return userData[state.currentUser] || userData['default'];
  },
  isLoggedIn(): boolean {
    return state.isLoggedIn;
  },
  currentUser(): string {
    return state.currentUser;
  }
};

export const userStore = {
  state: readonly(state),
  ...actions,
  ...getters
};
