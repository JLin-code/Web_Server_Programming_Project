<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/api';
import { RouterLink } from 'vue-router';
import { supabase } from '../services/supabase';
import { demoUsers as fallbackUsers } from '../data/hardcodedUsers';
import { useUsersStore } from '../stores/users';

const router = useRouter();
const usersStore = useUsersStore();
const isActive = ref(false);
const isLoginDropdownActive = ref(false);
const isAdminDropdownActive = ref(false);
const isLoggedIn = ref(false);
const attemptedRoute = ref('');
const demoUsers = ref<Array<{username: string, displayName: string}>>([]);
const demoUsersLoading = ref(true);
const currentUser = ref({
    id: '',
    name: '',
    email: '',
    isAdmin: false
});
const hasError = ref(false);
const errorMessage = ref('');

// Toggles the burger menu visibility
function toggleBurger() {
  isActive.value = !isActive.value;
}

onMounted(async () => {
  try {
    await loadDemoUsers();
    await checkUserSession();
  } catch (err) {
    console.error('Error in NavBar initialization:', err);
    errorMessage.value = err instanceof Error ? err.message : 'Unknown error initializing navigation';
    hasError.value = true;
  }
});

// Load demo users for login dropdown
async function loadDemoUsers() {
  try {
    demoUsersLoading.value = true;
    console.log('Loading demo users...');
    
    // First try to get users from the API
    const success = await usersStore.fetchDemoUsers();
    
    if (success && usersStore.demoUsers.length > 0) {
      // Map demo users from the store to the format needed for the dropdown
      demoUsers.value = usersStore.demoUsers.map(user => ({
        username: user.username,
        displayName: user.displayName
      }));
      console.log('Demo users loaded from API:', demoUsers.value.length);
    } else {
      // Fallback to hardcoded users if API fails or returns empty
      console.log('Falling back to hardcoded users');
      demoUsers.value = fallbackUsers.map(user => ({
        username: user.username,
        displayName: user.displayName
      }));
    }
  } catch (err) {
    console.warn('Error loading demo users:', err);
    // Ensure we still have fallback users if everything fails
    demoUsers.value = fallbackUsers.map(user => ({
      username: user.username,
      displayName: user.displayName
    }));
  } finally {
    demoUsersLoading.value = false;
  }
}

// Watch for changes to the store's demo users
watch(() => usersStore.demoUsers, (newDemoUsers) => {
  if (newDemoUsers.length > 0 && demoUsers.value.length === 0) {
    demoUsers.value = newDemoUsers.map(user => ({
      username: user.username,
      displayName: user.displayName
    }));
    console.log('Demo users updated from store:', demoUsers.value.length);
  }
}, { deep: true });

// Simplified session check
async function checkUserSession() {
  try {
    // Try Supabase first
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, role')
        .eq('email', session.user.email)
        .single();
        
      if (userData && !userError) {
        setUserData({
          id: userData.id,
          name: `${userData.first_name} ${userData.last_name}`,
          email: userData.email,
        });
        return;
      }
    }
    
    // Fallback to API
    await checkApiUser();
  } catch (err) {
    console.warn('Session check error:', err);
  }
}

// Simplified API user check
async function checkApiUser() {
  try {
    const response = await authService.getCurrentUser().catch(() => null);
    
    if (response?.user) {
      setUserData({
        id: response.user.id,
        name: `${response.user.first_name} ${response.user.last_name}`,
        email: response.user.email,
      });
    }
  } catch (err) {
    console.warn('API user check failed:', err);
  }
}

// Helper to set user data consistently
function setUserData(userData: {id: string, name: string, email: string}) {
  isLoggedIn.value = true;
  currentUser.value.id = userData.id;
  currentUser.value.name = userData.name;
  currentUser.value.email = userData.email;
  currentUser.value.isAdmin = true; // Always set admin true for simplicity
}

// Toggles dropdown while ensuring only one is open at a time
function toggleDropdown(dropdown: string) {
  if (dropdown === 'login') {
    isLoginDropdownActive.value = !isLoginDropdownActive.value;
    isAdminDropdownActive.value = false;
  } else if (dropdown === 'admin') {
    isAdminDropdownActive.value = !isAdminDropdownActive.value;
    isLoginDropdownActive.value = false;
  }
}

function closeDropdowns() {
  isLoginDropdownActive.value = false;
  isAdminDropdownActive.value = false;
}

function checkLoginBeforeNav(route: string) {
  if (!isLoggedIn.value) {
    attemptedRoute.value = route;
    isLoginDropdownActive.value = true;
    return false;
  }
  return true;
}

// Simplified login function
async function login(username: string, password: string) {
  try {
    // Try Supabase login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: username,
      password: password
    });
    
    if (!authError && authData.user) {
      const { data: userData } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, role')
        .eq('email', authData.user.email)
        .single();
      
      if (userData) {
        setUserData({
          id: userData.id,
          name: `${userData.first_name} ${userData.last_name}`,
          email: userData.email
        });
        handleSuccessfulLogin();
        return { success: true };
      }
    }
    
    // Try API login
    const apiResponse = await authService.login(username, password);
    if (apiResponse?.success) {
      setUserData({
        id: apiResponse.user.id,
        name: `${apiResponse.user.first_name} ${apiResponse.user.last_name}`,
        email: apiResponse.user.email
      });
      handleSuccessfulLogin();
      return { success: true };
    }

    // Fallback to demo login
    return fallbackLogin(username);
  } catch {
    return fallbackLogin(username);
  }
}

function handleSuccessfulLogin() {
  isLoginDropdownActive.value = false;
  if (attemptedRoute.value) {
    router.push(attemptedRoute.value);
    attemptedRoute.value = '';
  }
}

// Simplified fallback login
function fallbackLogin(username: string) {
  const hardcodedUser = fallbackUsers.find(user => user.username === username);
  if (hardcodedUser && username) {
    const nameParts = hardcodedUser.displayName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ').split('(')[0].trim() : '';
    
    setUserData({
      id: 'fallback-id-' + (Math.floor(Math.random() * 1000)),
      name: `${firstName} ${lastName}`,
      email: username
    });
    handleSuccessfulLogin();
    return { success: true };
  }
  return { success: false };
}

// Simplified logout
async function logout() {
  try {
    await supabase.auth.signOut();
    await authService.logout().catch(() => {});
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    isLoggedIn.value = false;
    currentUser.value = { id: '', name: '', email: '', isAdmin: false };
    router.push('/');
  }
}
</script>

<template>
    <div>
        <div v-if="hasError" class="emergency-fallback">
            <div class="container has-text-centered">
                <h1 class="title">Navigation Error</h1>
                <p>There was a problem loading the navigation: {{ errorMessage }}</p>
            </div>
        </div>

        <!-- Regular navigation -->
        <nav v-else class="navbar is-info" role="navigation" aria-label="main navigation" @click.self="closeDropdowns">
            <div class="container">
                <div class="navbar-brand">
                    <a class="navbar-item" @click="router.push('/')">
                        <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="30" />
                    </a>

                    <!-- Always visible on desktop -->
                    <a class="navbar-item is-hidden-mobile" @click="checkLoginBeforeNav('/') && router.push('/my-activity')">
                        <span class="icon-text">
                            <span class="icon">
                                <i class="fas fa-running"></i>
                            </span>
                            <span>My Activity</span>
                        </span>
                    </a>
                    
                    <a class="navbar-item is-hidden-mobile" @click="router.push('/')">
                        <span class="icon-text">
                            <span class="icon">
                                <i class="fas fa-chart-bar"></i>
                            </span>
                            <span>Statistics</span>
                        </span>
                    </a>
                    
                    <a class="navbar-item is-hidden-mobile" @click="checkLoginBeforeNav('/friends') && router.push('/friend-activity')">
                        <span class="icon-text">
                            <span class="icon">
                                <i class="fas fa-users"></i>
                            </span>
                            <span>Friends Activity</span>
                        </span>
                    </a>

                    <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false"
                       :class="{ 'is-active': isActive }" @click.stop="toggleBurger">
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                    </a>
                </div>

                <div class="navbar-menu" :class="{ 'is-active': isActive }">
                    <div class="navbar-start">
                        <!-- Mobile-only duplicates -->
                        <a class="navbar-item is-hidden-tablet" @click="checkLoginBeforeNav('/') && router.push('/my-activity')">
                            <span class="icon-text">
                                <span class="icon">
                                    <i class="fas fa-running"></i>
                                </span>
                                <span>My Activity</span>
                            </span>
                        </a>
                        
                        <a class="navbar-item is-hidden-tablet" @click="router.push('/')">
                            <span class="icon-text">
                                <span class="icon">
                                    <i class="fas fa-chart-bar"></i>
                                </span>
                                <span>Statistics</span>
                            </span>
                        </a>
                        
                        <a class="navbar-item is-hidden-tablet" @click="checkLoginBeforeNav('/friends') && router.push('/friends')">
                            <span class="icon-text">
                                <span class="icon">
                                    <i class="fas fa-users"></i>
                                </span>
                                <span>Friends Activity</span>
                            </span>
                        </a>
                        
                        <!-- Items in burger on mobile -->
                        <a class="navbar-item" @click="checkLoginBeforeNav('/search') && router.push('/people-search')">
                            <span class="icon-text">
                                <span class="icon">
                                    <i class="fas fa-search"></i>
                                </span>
                                <span>People Search</span>
                            </span>
                        </a>

                        <div class="navbar-item has-dropdown" v-if="isLoggedIn && currentUser.isAdmin"
                             :class="{ 'is-active': isAdminDropdownActive }">
                            <a class="navbar-link" @click.stop="toggleDropdown('admin')">
                                    <span>Admin</span>
                            </a>

                            <div class="navbar-dropdown">
                                <RouterLink to="/manage-users" class="navbar-item">
                                        <span>Manage Users</span>
                                </RouterLink>
                            </div>
                        </div>
                    </div>

                    <div class="navbar-end">
                        <div class="navbar-item">
                            <div class="buttons">
                                <RouterLink v-if="!isLoggedIn" to="/signup" class="button is-primary">
                                    <span>Sign up</span>
                                    <span class="icon">
                                        <i class="fas fa-user-plus"></i>
                                    </span>
                                </RouterLink>
                                
                                <RouterLink v-if="isLoggedIn" to="/profile" class="button is-primary">
                                    <span>Profile ({{ currentUser.name }})</span>
                                    <span class="icon">
                                        <i class="fas fa-user"></i>
                                    </span>
                                </RouterLink>
                                
                                <a v-if="isLoggedIn" @click="logout" class="button is-light">
                                    <span>Logout</span>
                                    <span class="icon">
                                        <i class="fas fa-sign-out-alt"></i>
                                    </span>
                                </a>
                                
                                <!-- Custom implementation for proper dropdown behavior -->
                                <div v-if="!isLoggedIn" class="login-dropdown-container">
                                    <a class="button is-light" @click.stop="toggleDropdown('login')">
                                        <span>Log in {{ attemptedRoute ? '(to access ' + attemptedRoute + ')' : '' }}</span>
                                        <span class="icon">
                                            <i class="fas fa-sign-in-alt"></i>
                                        </span>
                                    </a>
                                    <div class="navbar-dropdown is-right" :class="{ 'is-active': isLoginDropdownActive }">
                                        <div v-if="demoUsersLoading" class="navbar-item loading-item">
                                            <span class="icon is-small loading-spinner">
                                                <i class="fas fa-spinner fa-spin"></i>
                                            </span>
                                            <span>Loading users...</span>
                                        </div>
                                        <div v-else-if="demoUsers.length === 0" class="navbar-item">
                                            <span>No demo users available</span>
                                            <div class="mt-2">
                                                <button class="button is-small is-info" @click="loadDemoUsers">
                                                    Retry
                                                </button>
                                            </div>
                                        </div>
                                        <a v-for="user in demoUsers" 
                                           :key="user.username" 
                                           class="navbar-item" 
                                           @click.stop="login(user.username, 'password')">
                                          {{ user.displayName }}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    </div>
</template>

<style scoped>
.navbar-item.has-dropdown .button.navbar-link {
    border-radius: 4px;
    padding-right: 1em;
}

.navbar-end .navbar-dropdown {
    border-top-right-radius: 0;
}

.button {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.button .icon {
    margin-left: 0.5em;
}

.navbar-item.has-dropdown .navbar-link {
    cursor: pointer;
}

.navbar-link .icon {
    margin-left: 0.5em;
}

.navbar-item .icon {
    margin-right: 0.3em;
}

.navbar-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.navbar-link .icon-text {
    display: flex;
    align-items: center;
}

.icon-text .icon {
    margin-right: 0.4em;
}

.navbar-brand {
    align-items: center;
}

.emergency-fallback {
    background-color: #f14668;
    padding: 2rem;
    color: white;
    margin-bottom: 1rem;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9999;
}

.emergency-fallback .button {
    margin-top: 1rem;
}

@media screen and (min-width: 1024px) {
    .navbar-brand .navbar-item {
        padding-right: 0.75rem;
    }
}

@media screen and (max-width: 1023px) {
    .navbar-dropdown {
        display: block;
        padding: 0;
        box-shadow: none;
        border-left: 1px solid rgba(255, 255, 255, 0.2);
        margin-left: 1rem;
    }
    
    .navbar-item.has-dropdown.is-active .navbar-dropdown {
        position: static;
        background-color: transparent;
    }
}

/* Custom login dropdown implementation */
.login-dropdown-container {
    position: relative;
    display: inline-flex;
}

.login-dropdown-container .navbar-dropdown {
    display: none;
    position: absolute;
    right: 0;
    top: 100%;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 8px 8px rgba(10, 10, 10, 0.1);
    padding-bottom: 0.5rem;
    padding-top: 0.5rem;
    min-width: 12rem;
    z-index: 40;
}

.login-dropdown-container .navbar-dropdown.is-active {
    display: block;
}

.login-dropdown-container .navbar-item {
    color: #4a4a4a;
    display: block;
    line-height: 1.5;
    padding: 0.375rem 1rem;
    position: relative;
}

.login-dropdown-container .navbar-item:hover {
    background-color: #f5f5f5;
}

.navbar-divider {
    background-color: black;
    border: none;
    height: 1px;
    margin: 0.225rem 0;
}

/* Mobile adjustments for login dropdown */
@media screen and (max-width: 1023px) {
    .login-dropdown-container {
        display: block;
        width: auto;
        margin-bottom: 0;
    }
    
    .login-dropdown-container .button {
        width: auto;
        justify-content: space-between;
        margin-bottom: 0;
        display: inline-flex;
    }
    
    .navbar-item .buttons {
        flex-wrap: wrap;
        justify-content: flex-start;
        align-items: flex-start;
    }
    
    .navbar-item .buttons .button {
        margin-bottom: 0.5rem;
        margin-right: 0.5rem;
    }
    
    .login-dropdown-container .navbar-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        box-shadow: 0 8px 8px rgba(10, 10, 10, 0.1);
        background-color: white;
        border-left: none;
        margin-left: 0;
        padding: 0.5rem 0;
        width: 12rem;
        z-index: 30;
    }
    
    .login-dropdown-container .navbar-dropdown:not(.is-active) {
        display: none;
    }
    
    .login-dropdown-container .navbar-item {
        color: #4a4a4a;
        padding: 0.5rem 0.75rem;
    }
    
    .login-dropdown-container .navbar-item:hover {
        background-color: #f5f5f5;
    }
    
    .login-dropdown-container .navbar-divider {
        background-color: #ededed;
    }
}

/* Phone-specific adjustments */
@media screen and (max-width: 768px) {
    .login-dropdown-container .navbar-dropdown {
        width: 100%;
        position: static;
        box-shadow: none;
        background-color: transparent;
        border-left: 1px solid rgba(255, 255, 255, 0.2);
        margin-left: 1rem;
        padding: 0;
    }
    
    .login-dropdown-container .navbar-item {
        color: white;
    }
    
    .login-dropdown-container .navbar-item:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
    
    .login-dropdown-container .navbar-divider {
        background-color: rgba(255, 255, 255, 0.2);
    }
}

/* Loading spinner styles */
.loading-item {
    display: flex;
    align-items: center;
}

.loading-spinner {
    margin-right: 0.5em;
}

.mt-2 {
    margin-top: 0.5rem;
}
</style>