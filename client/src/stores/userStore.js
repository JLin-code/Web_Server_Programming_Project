"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userStore = void 0;
var vue_1 = require("vue");
// Mock data for different users
var userData = {
    'Admin': {
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
var state = (0, vue_1.reactive)({
    currentUser: '',
    isLoggedIn: false
});
// Store actions
var actions = {
    login: function (username) {
        state.currentUser = username;
        state.isLoggedIn = true;
    },
    logout: function () {
        state.currentUser = '';
        state.isLoggedIn = false;
    }
};
// Store getters
var getters = {
    getUserData: function () {
        return userData[state.currentUser] || userData['default'];
    },
    isLoggedIn: function () {
        return state.isLoggedIn;
    },
    currentUser: function () {
        return state.currentUser;
    }
};
exports.userStore = __assign(__assign({ state: (0, vue_1.readonly)(state) }, actions), getters);
import { reactive } from 'vue'

// Create a reactive store for user state management
const state = reactive({
  loggedIn: false,
  user: null
})

export const userStore = {
  // Method to check login status
  isLoggedIn() {
    return state.loggedIn
  },
  
  // Method to get current user info
  currentUser() {
    return state.user
  },
  
  // Method to handle login
  login(username) {
    state.loggedIn = true
    state.user = username
  },
  
  // Method to handle logout
  logout() {
    state.loggedIn = false
    state.user = null
  }
}
