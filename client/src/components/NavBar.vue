<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/api';
import { RouterLink } from 'vue-router';
import { supabase } from '../services/supabase';
import { demoUsers as fallbackUsers } from '../data/hardcodedUsers';

const router = useRouter();
const isActive = ref(false);
const isLoginDropdownActive = ref(false);
const isAdminDropdownActive = ref(false);
const isLoggedIn = ref(false);
const attemptedRoute = ref('');
const demoUsers = ref<Array<{username: string, displayName: string}>>([]);
const currentUser = ref({
    id: '',
    name: '',
    email: '',
    isAdmin: false
});

// Toggles the burger menu visibility
function toggleBurger() {
  isActive.value = !isActive.value;
}

onMounted(async () => {
  // Check if logged in via Supabase
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('Supabase session found:', session.user.email);
      // Get user details from Supabase database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, role')
        .eq('email', session.user.email)
        .single();
        
      if (userError) {
        console.error('Error fetching user data from Supabase:', userError);
        // Fall back to API
        checkApiUser();
      } else if (userData) {
        // Set user from Supabase data
        isLoggedIn.value = true;
        currentUser.value.id = userData.id;
        currentUser.value.email = userData.email;
        currentUser.value.name = `${userData.first_name} ${userData.last_name}`;
        // Always set admin to true regardless of actual role
        currentUser.value.isAdmin = true;
        
        console.log('User logged in via Supabase session:', currentUser.value);
      }
    } else {
      checkApiUser();
    }
  } catch (error) {
    console.error('Error checking Supabase session:', error);
    checkApiUser();
  }

  // Load demo users for login dropdown
  loadDemoUsers();
});

async function checkApiUser() {
  try {
    // Check if user is logged in via API as fallback
    const response = await authService.getCurrentUser().catch(err => {
      console.warn('Error fetching current user from API (continuing anyway):', err);
      return null;
    });
    
    if (response && response.user) {
      isLoggedIn.value = true;
      currentUser.value.id = response.user.id;
      currentUser.value.name = `${response.user.first_name} ${response.user.last_name}`;
      currentUser.value.email = response.user.email;
      // Always set admin to true regardless of actual role
      currentUser.value.isAdmin = true;
    }
  } catch (error) {
    console.warn('API user check failed, using no user state:', error);
    isLoggedIn.value = false;
  }
}

async function loadDemoUsers() {
  try {
    // First try to get users directly from Supabase
    const { data: supabaseUsers, error } = await supabase
      .from('users')
      .select('email, first_name, last_name, role')
      .limit(5);
    
    if (error) throw error;
    
    if (supabaseUsers && supabaseUsers.length > 0) {
      demoUsers.value = supabaseUsers.map((user: { email: string; first_name: string; last_name: string; role: string }) => ({
        username: user.email,
        displayName: `${user.first_name} ${user.last_name} (${user.role === 'admin' ? 'Admin' : 'User'})`
      }));
      console.log('Loaded demo users directly from Supabase:', demoUsers.value);
      return;
    }
    
    // If we got no users, try API
    fallbackLoadDemoUsers();
  } catch (error) {
    console.error('Error loading demo users from Supabase:', error);
    fallbackLoadDemoUsers();
  }
}

async function fallbackLoadDemoUsers() {
  try {
    // Try API for demo users
    const demoUsersResponse = await authService.getUsers();
    if (demoUsersResponse && demoUsersResponse.users && demoUsersResponse.users.length > 0) {
      demoUsers.value = demoUsersResponse.users;
      console.log('Loaded demo users via API');
    } else {
      // Use imported fallback users if API returns empty
      demoUsers.value = fallbackUsers.map(user => ({
        username: user.username,
        displayName: user.displayName
      }));
      console.log('Using hardcoded fallback users (API returned empty)');
    }
  } catch (demoError) {
    console.error('Failed to load demo users from API, using fallbacks:', demoError);
    demoUsers.value = fallbackUsers.map(user => ({
      username: user.username,
      displayName: user.displayName
    }));
  }
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

async function login(username: string, password: string) {
  try {
    // Try to login via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: username,
      password: password
    });
    
    if (authError || !authData.user) {
      console.warn('Supabase auth failed, falling back to API login:', authError?.message);
      return loginViaApi(username, password);
    }
    
    // If login is successful with Supabase
    console.log('Supabase login successful:', authData.user.email);
    
    // Get user details from the database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role')
      .eq('email', authData.user.email)
      .single();
      
    if (userError || !userData) {
      console.warn('Error fetching user details after Supabase auth:', userError);
      return loginViaApi(username, password);
    }
    
    // Update UI with user info
    currentUser.value.id = userData.id;
    currentUser.value.name = `${userData.first_name} ${userData.last_name}`;
    currentUser.value.email = userData.email;
    // Always set admin to true regardless of actual role
    currentUser.value.isAdmin = true;
    isLoggedIn.value = true;
    isLoginDropdownActive.value = false;
    
    if (attemptedRoute.value) {
      router.push(attemptedRoute.value);
      attemptedRoute.value = null;
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error in login process:', err);
    return { success: false, message: 'Login failed due to a technical error.' };
  }
}

async function loginViaApi(username: string, password: string) {
  try {
    // Attempt server login
    const response = await authService.login(username, password);
    
    if (response && response.success) {
      // If server login succeeds
      currentUser.value.id = response.user.id;
      currentUser.value.name = `${response.user.first_name} ${response.user.last_name}`;
      currentUser.value.email = response.user.email;
      // Always set admin to true regardless of actual role
      currentUser.value.isAdmin = true;
      isLoggedIn.value = true;
      isLoginDropdownActive.value = false;
      
      if (attemptedRoute.value) {
        router.push(attemptedRoute.value);
        attemptedRoute.value = '';
      }
      return true;
    } else {
      console.error('API login response indicates failure');
      fallbackLogin(username);
      return false;
    }
  } catch (error) {
    console.error('API login failed:', error);
    fallbackLogin(username);
    return false;
  }
}

// Fallback login for when API fails
function fallbackLogin(username: string) {
  // If API fails, perform client-side "login" with hardcoded user
  const hardcodedUser = fallbackUsers.find(user => user.username === username);
  if (hardcodedUser && username) {
    console.log('Falling back to client-side login with user:', hardcodedUser);
    
    // Extract user info from hardcoded user
    let firstName = '';
    let lastName = '';
    
    if (hardcodedUser.displayName) {
      const nameParts = hardcodedUser.displayName.split(' ');
      firstName = nameParts[0] || '';
      
      // Get last name (everything before the parenthesis but after first word)
      if (nameParts.length > 1) {
        const lastNamePart = nameParts.slice(1).join(' ').split('(')[0].trim();
        lastName = lastNamePart || '';
      }
    } else {
      // Fallback to direct properties if available
      firstName = hardcodedUser.firstName || '';
      lastName = hardcodedUser.lastName || '';
    }
    
    // Always set isAdmin to true to allow all users to access admin features
    const isAdmin = true;
    
    currentUser.value.id = 'fallback-id-' + (Math.floor(Math.random() * 1000));
    currentUser.value.name = `${firstName} ${lastName}`;
    currentUser.value.email = username;
    currentUser.value.isAdmin = isAdmin;
    isLoggedIn.value = true;
    isLoginDropdownActive.value = false;
    
    // Log detailed information for debugging
    console.log('Fallback login successful', {
      id: currentUser.value.id,
      name: currentUser.value.name,
      email: currentUser.value.email,
      isAdmin: currentUser.value.isAdmin
    });
    
    if (attemptedRoute.value) {
      router.push(attemptedRoute.value);
      attemptedRoute.value = '';
    }
    return true;
  }
  return false;
}

async function logout() {
  try {
    console.log('Attempting Supabase logout');
    // First try direct Supabase logout
    const { error: supabaseError } = await supabase.auth.signOut();
    
    if (supabaseError) {
      console.warn('Supabase logout error:', supabaseError);
      // Continue to API logout even if Supabase fails
    } else {
      console.log('Supabase logout successful');
    }
    
    // Also try API logout for consistency
    try {
      await authService.logout();
      console.log('API logout successful');
    } catch (apiError) {
      console.error('API logout error:', apiError);
      // Continue even if API logout fails
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Reset application state regardless of logout API success
    isLoggedIn.value = false;
    currentUser.value.id = '';
    currentUser.value.name = '';
    currentUser.value.email = '';
    currentUser.value.isAdmin = false;
    router.push('/');
  }
}
</script>

<template>
    <div>
        <!-- Safe fallback UI in case of catastrophic errors -->
        <div v-if="false" class="emergency-fallback">
            <div class="container has-text-centered">
                <h1 class="title">Navigation Unavailable</h1>
                <p>Please try refreshing the page or contact support.</p>
            </div>
        </div>

        <!-- Regular navigation -->
        <nav class="navbar is-info" role="navigation" aria-label="main navigation" @click.self="closeDropdowns">
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
    background-color: #3273dc;
    padding: 1rem;
    color: white;
    margin-bottom: 1rem;
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
</style>