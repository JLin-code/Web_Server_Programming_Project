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
const error = ref(''); // Add error display variable
const skipSupabaseAuth = ref(true); // Set to true to bypass Supabase auth errors

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
        .select('id, first_name, last_name, email, role')
        .limit(10); // Increased limit to get more users
      
      if (error) {
        console.error('Supabase error loading users:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log('Users loaded directly from Supabase:', data.length);
        
        // Map the users to the format we need, including role information
        demoUsers.value = data.map(user => ({
          username: user.email,
          displayName: `${user.first_name} ${user.last_name}${user.role === 'admin' ? ' (Administrator)' : ''}`
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
      { username: 'demo@example.com', displayName: 'Demo User' },
      { username: 'sarah.johnson@example.com', displayName: 'Sarah Johnson' },
      { username: 'micheal.brown@example.com', displayName: 'Micheal Brown' },
      { username: 'emma.wilson@example.com', displayName: 'Emma Wilson' },
      { username: 'james.taylor@example.com', displayName: 'James Taylor' }
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
    
    // Fallback to API - modified to better handle 401 errors
    return await checkApiUser();
  } catch (err) {
    console.warn('Session check error:', err);
    // If the session check fails, still try to get user data from Supabase directly
    return await fetchUserDirectly();
  }
}

// Add a new function to fetch user directly from Supabase as a last resort
async function fetchUserDirectly() {
  console.log('Attempting to fetch user directly from Supabase...');
  try {
    // Try to get any user to display (for demonstration purposes)
    const { data: users, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role, profile_picture_url')
      .limit(1);
      
    if (error) {
      console.error('Error fetching any user:', error);
      return false;
    }
    
    if (users && users.length > 0) {
      console.log('Found a user to display:', users[0].email);
      const user = users[0];
      
      setUserData({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        profilePicture: user.profile_picture_url
      });
      
      currentUser.value.isAdmin = user.role === 'admin';
      return true;
    }
    
    return false;
  } catch (err) {
    console.error('Failed to fetch user directly:', err);
    return false;
  }
}

// Improve the API user check to better handle 401 errors
async function checkApiUser() {
  try {
    console.log('Checking API user...');
    
    const response = await authService.getCurrentUser().catch((err) => {
      console.warn('API getCurrentUser error (handled):', err.message);
      // If it's a 401, we know the user isn't authenticated through the API
      if (err.response && err.response.status === 401) {
        console.log('User not authenticated with API (401 error)');
      }
      return null;
    });
    
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

// Improved login function with better error handling
async function login(username: string, password: string) {
  if (loginInProgress.value) {
    console.log('Login already in progress');
    return { success: false, message: 'Login already in progress' };
  }
  
  loginInProgress.value = true;
  error.value = ''; // Reset previous errors
  
  try {
    console.log('Attempting login with:', username);
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Login timeout')), 8000);
    });
    
    // Try Supabase login only if not skipped
    if (!skipSupabaseAuth.value) {
      try {
        console.log('Trying Supabase login...');
        
        const loginPromise = supabase.auth.signInWithPassword({
          email: username,
          password: 'password123' // Always use a simple password for demo
        });
        
        const { data: authData, error: authError } = await Promise.race([
          loginPromise,
          timeoutPromise
        ]) as any;
        
        if (authError) {
          console.error('Supabase auth error:', authError);
          // Just log the error and continue to API login instead of throwing
          console.log('Continuing to API login after Supabase auth failure');
        } 
        else if (authData?.user) {
          console.log('Supabase auth successful for:', authData.user.email);
          
          try {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('id, first_name, last_name, email, role, profile_picture_url')
              .eq('email', authData.user.email)
              .single();
            
            if (userError) {
              console.error('User data fetch error:', userError);
              // Continue to API login if user data fetch fails
              console.log('Continuing to API login after user data fetch failure');
            }
            else if (userData) {
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
          } catch (userDataError) {
            console.error('Error fetching user data after authentication:', userDataError);
            // Continue to API login if user data fetch fails
          }
        }
      } catch (supabaseError) {
        console.error('Supabase login failed:', supabaseError);
        // Just log the error and continue to API login
        console.log('Continuing to API login after Supabase error');
      }
    } else {
      console.log('Skipping Supabase auth, going directly to API login');
    }
    
    // Try API login as our primary method
    try {
      console.log('Trying API login...');
      
      const apiLoginPromise = authService.login(username, 'password123');
      const apiTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('API login timeout')), 5000);
      });
      
      const response = await Promise.race([apiLoginPromise, apiTimeoutPromise]);
      
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
      } else {
        // If API login also fails, show a more friendly error
        throw new Error(response?.message || 'Login failed. Please try again or contact support.');
      }
    } catch (apiError) {
      console.error('API login error:', apiError);
      // If API login fails, try hardcoded fallback
      return fallbackLogin(username);
    }
  } catch (err) {
    console.error('Login error:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown login error';
    error.value = errorMsg; // Store the error for display
    return { success: false, message: errorMsg };
  } finally {
    loginInProgress.value = false;
  }
}

// Add a fallback login function for demo purposes
function fallbackLogin(username: string) {
  console.log('Using fallback login with:', username);
  
  // Find the user in our fallback list or create a generic user
  const user = demoUsers.value.find(u => u.username === username) || { 
    username, 
    displayName: username.split('@')[0].replace(/\./g, ' ') 
  };
  
  // Extract first and last name from displayName
  const nameParts = user.displayName.split(' ');
  const firstName = nameParts[0] || 'Demo';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User';
  
  // Set user data for the fallback login
  setUserData({
    id: `demo-${Date.now()}`, // Generate a unique demo ID
    name: `${firstName} ${lastName}`,
    email: username,
    profilePicture: '' // No profile picture for fallback users
  });
  
  // Check if this user should be an admin
  currentUser.value.isAdmin = username.includes('admin');
  
  handleSuccessfulLogin();
  return { success: true };
}

function handleSuccessfulLogin() {
  isLoginDropdownActive.value = false;
  error.value = '';
  if (attemptedRoute.value) {
    router.push(attemptedRoute.value);
    attemptedRoute.value = '';
  } else {
    // Change to a route that definitely exists
    router.push('/my-activity');
  }
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

// Helper to set user data consistently
function setUserData(userData: {id: string, name: string, email: string, profilePicture?: string}) {
  isLoggedIn.value = true;
  currentUser.value.id = userData.id;
  currentUser.value.name = userData.name;
  currentUser.value.email = userData.email;
  currentUser.value.profilePicture = userData.profilePicture || '';
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
                                        <div v-if="error" class="navbar-item error-message">
                                            <p>{{ error }}</p>
                                        </div>
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

/* Error message styling */
.error-message {
    background-color: #feecf0;
    color: #cc0f35;
    padding: 0.5rem 1rem;
    border-left: 3px solid #cc0f35;
}
</style>