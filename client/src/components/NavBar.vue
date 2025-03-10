<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userStore } from '../stores/userStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const isActive = ref(false)
const isLoginDropdownActive = ref(false)
const isAdminDropdownActive = ref(false)
const isLoggedIn = ref(false)
const attemptedRoute = ref('')
const currentUser = ref({
    name: '',
    isAdmin: false
})

onMounted(() => {
  isLoggedIn.value = userStore.isLoggedIn();
  if (isLoggedIn.value) {
    currentUser.value.name = userStore.currentUser();
    currentUser.value.isAdmin = currentUser.value.name === 'ADMIN';
  }
})

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

// Closes dropdowns when opening burger menu to prevent UI conflicts
function toggleBurger() {
  isActive.value = !isActive.value;
  if (isActive.value) {
    closeDropdowns();
  }
}

function checkLoginBeforeNav(route: string) {
  if (!isLoggedIn.value) {
    attemptedRoute.value = route
    isLoginDropdownActive.value = true
    return false
  }
  return true
}

function login(username: string, admin: boolean = false) {
  currentUser.value.name = username
  currentUser.value.isAdmin = admin
  isLoggedIn.value = true
  isLoginDropdownActive.value = false
  
  userStore.login(username)

  if (attemptedRoute.value) {
    router.push(attemptedRoute.value)
    attemptedRoute.value = ''
  }
}

function logout() {
  isLoggedIn.value = false
  currentUser.value.name = ''
  currentUser.value.isAdmin = false
  
  userStore.logout()
}
</script>

<template>
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
                                    <a class="navbar-item" @click.stop="login('Admin', true)">Administrator</a>
                                    <a class="navbar-item" @click.stop="login('Jane Smith')">Jane Smith</a>
                                    <a class="navbar-item" @click.stop="login('John Doe')">John Doe</a>
                                    <a class="navbar-item" @click.stop="login('Major Major')">Major Major</a>
                                    <a class="navbar-item" @click.stop="login('Laura Green')">Laura Green</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </nav>
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
    background-color: rgb(3, 255, 150);
    border-radius: 4px;
    box-shadow: 0 8px 8px rgba(10, 10, 10, 0.1);
    padding-bottom: 0.5rem;
    padding-top: 0.5rem;
    min-width: 12rem;
    z-index: 20;
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