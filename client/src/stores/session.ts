import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './auth';
import router from '../router';

export const useSessionStore = defineStore('session', () => {
  // State
  const lastActivity = ref(Date.now());
  const sessionTimeout = ref(30 * 60 * 1000); // 30 minutes in milliseconds
  const isSessionExpired = ref(false);
  const attemptedRoute = ref('');
  const sessionInterval = ref<number | null>(null);

  // Getters
  const timeUntilExpiry = computed(() => {
    const timePassed = Date.now() - lastActivity.value;
    return Math.max(0, sessionTimeout.value - timePassed);
  });

  const formattedTimeRemaining = computed(() => {
    const minutes = Math.floor(timeUntilExpiry.value / 60000);
    const seconds = Math.floor((timeUntilExpiry.value % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  // Actions
  function updateActivity() {
    lastActivity.value = Date.now();
    isSessionExpired.value = false;
  }

  function checkSession() {
    if (Date.now() - lastActivity.value > sessionTimeout.value) {
      expireSession();
      return false;
    }
    return true;
  }

  async function expireSession() {
    isSessionExpired.value = true;
    const authStore = useAuthStore();
    await authStore.logout();
    clearInterval(sessionInterval.value as number);
    sessionInterval.value = null;
  }

  function startSessionTimer() {
    // Clear any existing timer
    if (sessionInterval.value) {
      clearInterval(sessionInterval.value);
    }
    
    // Start new timer
    sessionInterval.value = setInterval(() => {
      if (!checkSession()) {
        router.push('/login?session=expired');
      }
    }, 60000) as unknown as number; // Check every minute
    
    // Reset last activity
    updateActivity();
  }

  function stopSessionTimer() {
    if (sessionInterval.value) {
      clearInterval(sessionInterval.value);
      sessionInterval.value = null;
    }
  }

  function setAttemptedRoute(route: string) {
    attemptedRoute.value = route;
  }

  function getAttemptedRoute() {
    const route = attemptedRoute.value;
    attemptedRoute.value = '';
    return route;
  }

  // Initialize
  updateActivity();

  return {
    // State
    lastActivity,
    sessionTimeout,
    isSessionExpired,
    attemptedRoute,
    
    // Getters
    timeUntilExpiry,
    formattedTimeRemaining,
    
    // Actions
    updateActivity,
    checkSession,
    expireSession,
    startSessionTimer,
    stopSessionTimer,
    setAttemptedRoute,
    getAttemptedRoute
  };
});
