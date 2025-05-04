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
const loginInProgress = ref(false);
const currentUser = ref({
    id: '',
    name: '',
    email: '',
    isAdmin: false,
    profilePicture: ''
});
const hasError = ref(false);
const errorMessage = ref('');

// Toggles the burger menu visibility
function toggleBurger() {
  isActive.value = !isActive.value;
}

onMounted(async () => {
  try {
    // Start loading both at once to improve performance
    const checkSessionPromise = checkUserSession();
    const loadUsersPromise = loadDemoUsers();
    
    // Wait for both to complete
    await Promise.all([checkSessionPromise, loadUsersPromise]);
  } catch (err) {
    console.error('Error in NavBar initialization:', err);
    errorMessage.value = err instanceof Error ? err.message : 'Unknown error initializing navigation';
    hasError.value = true;
    // Always ensure loading states are finished even if there's an error
    demoUsersLoading.value = false;
  }
});

// Improved loadDemoUsers with direct Supabase connection
async function loadDemoUsers() {
  try {
    demoUsersLoading.value = true;
    console.log('Loading demo users...');
    
    // Try to get users directly from Supabase
    try {
      // Direct Supabase query for better performance
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .limit(10);
      
      if (error) {
        console.error('Supabase error loading users:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log('Users loaded directly from Supabase:', data.length);
        
        // Map the users to the format we need
        demoUsers.value = data.map(user => ({
          username: user.email,
          displayName: `${user.first_name} ${user.last_name}`
        }));
        
        demoUsersLoading.value = false;
        return true;
      }
    } catch (supabaseError) {
      console.warn('Supabase users fetch failed:', supabaseError);
    }
    
    // Fall back to API if Supabase direct fails
    try {
      const response = await authService.getDemoUsers();
      
      if (response?.success && Array.isArray(response.users) && response.users.length > 0) {
        demoUsers.value = response.users.map((user: any) => ({
          username: user.username || user.email || user.id,
          displayName: user.displayName || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username
        }));
        console.log('Demo users loaded from API:', demoUsers.value.length);
        return true;
      }
    } catch (apiError) {
      console.warn('API call for demo users failed:', apiError);
    }
    
    // Fall back to store
    try {
      const success = await usersStore.fetchDemoUsers();
      
      if (success && usersStore.demoUsers.length > 0) {
        demoUsers.value = usersStore.demoUsers.map(user => ({
          username: user.username,
          displayName: user.displayName
        }));
        console.log('Demo users loaded from store:', demoUsers.value.length);
        return true;
      }
    } catch (storeError) {
      console.warn('Store fallback for demo users failed:', storeError);
    }
    
    // If all else fails, use fallback users
    demoUsers.value = fallbackUsers.map(user => ({
      username: user.username,
      displayName: user.displayName
    }));
    console.log('Using fallback hardcoded users:', demoUsers.value.length);
    return true;
  } catch (err) {
    console.error('Error loading demo users:', err);
    // Set some default users to prevent blank state
    demoUsers.value = [
      { username: 'admin@example.com', displayName: 'Admin User' },
      { username: 'user@example.com', displayName: 'Regular User' },
      { username: 'demo@example.com', displayName: 'Demo User' }
    ];
    return false;
  } finally {
    // Always reset loading state
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

// Improved session check with better error handling
async function checkUserSession() {
  try {
    console.log('Checking user session...');
    
    // Try Supabase first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Supabase session error:', sessionError);
    }
    
    if (session) {
      console.log('Supabase session found:', session.user.email);
      
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, first_name, last_name, email, role, profile_picture_url')
          .eq('email', session.user.email)
          .single();
          
        if (userError) {
          console.error('Error fetching user data:', userError);
        }
          
        if (userData) {
          console.log('User data retrieved from Supabase');
          
          setUserData({
            id: userData.id,
            name: `${userData.first_name} ${userData.last_name}`,
            email: userData.email,
            profilePicture: userData.profile_picture_url
          });
          
          // Set admin status if it exists in the user data
          currentUser.value.isAdmin = userData.role === 'admin';
          
          return true;
        }
      } catch (userQueryError) {
        console.error('Error during user data query:', userQueryError);
      }
    }
    
    // Fallback to API
    return await checkApiUser();
  } catch (err) {
    console.warn('Session check error:', err);
    return false;
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

// Improved login function with timeout and better error handling
async function login(username: string, password: string) {
  if (loginInProgress.value) {
    console.log('Login already in progress');
    return { success: false, message: 'Login already in progress' };
  }
  
  loginInProgress.value = true;
  
  try {
    console.log('Attempting login with:', username);
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Login timeout')), 5000); // 5 second timeout
    });
    
    // Try Supabase login with timeout
    try {
      const loginPromise = supabase.auth.signInWithPassword({
        email: username,
        password: password || 'password' // Use provided password or default
      });
      
      const { data: authData, error: authError } = await Promise.race([
        loginPromise,
        timeoutPromise
      ]) as any;
      
      if (authError) {
        console.warn('Supabase auth error:', authError);
      } else if (authData?.user) {
        console.log('Supabase auth successful');
        
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, first_name, last_name, email, role, profile_picture_url')
          .eq('email', authData.user.email)
          .single();
        
        if (userError) {
          console.warn('User data fetch error:', userError);
        }
        
        if (userData) {
          setUserData({
            id: userData.id,
            name: `${userData.first_name} ${userData.last_name}`,
            email: userData.email,
            profilePicture: userData.profile_picture_url
          });
          
          // Set admin status if it exists
          currentUser.value.isAdmin = userData.role === 'admin';
          
          handleSuccessfulLogin();
          return { success: true };
        }
      }
    } catch (timeoutError) {
      console.warn('Supabase login timed out:', timeoutError);
    }
    
    // Try API login as a fallback
    try {
      const response = await authService.login(username, password || 'password');
      
      if (response?.success) {
        console.log('API login successful');
        
        setUserData({
          id: response.user.id,
          name: `${response.user.first_name} ${response.user.last_name}`,
          email: response.user.email,
          profilePicture: response.user.profile_picture_url
        });
        
        // Set admin status if it exists
        currentUser.value.isAdmin = response.user.role === 'admin';
        
        handleSuccessfulLogin();
        return { success: true };
      }
    } catch (apiError) {
      console.warn('API login error:', apiError);
    }
    
    // Only use fallback login as a last resort
    return fallbackLogin(username);
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, message: err instanceof Error ? err.message : 'Login failed' };
  } finally {
    loginInProgress.value = false;
  }
}

function handleSuccessfulLogin() {
  isLoginDropdownActive.value = false;
  if (attemptedRoute.value) {
    router.push(attemptedRoute.value);
    attemptedRoute.value = '';
  }
}

// Improved fallback login
function fallbackLogin(username: string) {
  console.log('Using fallback login with:', username);
  
  const hardcodedUser = fallbackUsers.find(user => user.username === username);
  if (hardcodedUser && username) {
    const nameParts = hardcodedUser.displayName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ').split('(')[0].trim() : '';
    
    // Set user data even in fallback mode
    setUserData({
      id: username, // Use username as ID in fallback mode
      name: hardcodedUser.displayName,
      email: username,
      profilePicture: ''
    });
    
    // Set admin status based on hardcoded data
    currentUser.value.isAdmin = hardcodedUser.isAdmin;
    
    handleSuccessfulLogin();
    return { success: true };
  }
  
  return { success: false, message: 'Invalid login credentials' };
}

// Improved logout function
async function logout() {
  try {
    // Try Supabase logout
    await supabase.auth.signOut().catch(err => console.warn('Supabase signout error:', err));
    
    // Also try API logout
    await authService.logout().catch(err => console.warn('API logout error:', err));
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always reset user state
    isLoggedIn.value = false;
    currentUser.value = { id: '', name: '', email: '', isAdmin: false, profilePicture: '' };
    router.push('/');
  }
}

// Improved API user check
async function checkApiUser() {
  try {
    console.log('Checking API user...');
    
    const response = await authService.getCurrentUser().catch(() => null);
    
    if (response?.user) {
      console.log('API user found');
      
      setUserData({
        id: response.user.id,
        name: `${response.user.first_name} ${response.user.last_name}`,
        email: response.user.email,
        profilePicture: response.user.profile_picture_url
      });
      
      // Set admin status if it exists
      currentUser.value.isAdmin = response.user.role === 'admin';
      return true;
    }
    return false;
  } catch (err) {
    console.warn('API user check failed:', err);
    return false;
  }
}

// Helper to set user data consistently
function setUserData(userData: {id: string, name: string, email: string, profilePicture?: string}) {
  isLoggedIn.value = true;
  currentUser.value.id = userData.id;
  currentUser.value.name = userData.name;
  currentUser.value.email = userData.email;
  currentUser.value.profilePicture = userData.profilePicture || '';
}
</script>

<script lang="ts">
// Empty script block, functions moved to script setup
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

                    <!-- New workout stats link -->
                    <a class="navbar-item is-hidden-mobile" @click="checkLoginBeforeNav('/') && router.push('/workout-stats')">
                        <span class="icon-text">
                            <span class="icon">
                                <i class="fas fa-chart-line"></i>
                            </span>
                            <span>Workout Stats</span>
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

                        <!-- New workout stats link -->
                        <a class="navbar-item is-hidden-tablet" @click="checkLoginBeforeNav('/') && router.push('/workout-stats')">
                            <span class="icon-text">
                                <span class="icon">
                                    <i class="fas fa-chart-line"></i>
                                </span>
                                <span>Workout Stats</span>
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
                                    <span v-if="currentUser.profilePicture" class="user-avatar-small">
                                        <img :src="currentUser.profilePicture" alt="Profile" />
                                    </span>
                                    <span v-else class="icon">
                                        <i class="fas fa-user"></i>
                                    </span>
                                    <span>{{ currentUser.name }}</span>
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
                                        <template v-else>
                                            <p class="navbar-item has-text-grey-light has-text-centered is-size-7">
                                                Click a user to log in
                                            </p>
                                            <a v-for="user in demoUsers" 
                                               :key="user.username" 
                                               class="navbar-item" 
                                               @click.stop="login(user.username, 'password')">
                                              {{ user.displayName }}
                                            </a>
                                        </template>
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

.user-avatar-small {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin-right: 8px;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.user-avatar-small img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>