<script setup lang="ts">
import { ref } from 'vue'

const isActive = ref(false)
const isLoginDropdownActive = ref(false)
const isAdminDropdownActive = ref(false)

// New function to toggle dropdown states
function toggleDropdown(dropdown: string) {
  if (dropdown === 'login') {
    isLoginDropdownActive.value = !isLoginDropdownActive.value;
    isAdminDropdownActive.value = false;
  } else if (dropdown === 'admin') {
    isAdminDropdownActive.value = !isAdminDropdownActive.value;
    isLoginDropdownActive.value = false;
  }
}

// Close dropdowns when clicking outside
function closeDropdowns() {
  isLoginDropdownActive.value = false;
  isAdminDropdownActive.value = false;
}
</script>

<template>
    <nav class="navbar is-info" role="navigation" aria-label="main navigation" @click.self="closeDropdowns">
        <div class="container">
            <div class="navbar-brand">
                <a class="navbar-item">
                    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="30" />
                </a>

                <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false"
                   :class="{ 'is-active': isActive }" @click="isActive = !isActive">
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </a>
            </div>

            <div class="navbar-menu" :class="{ 'is-active': isActive }">
                <div class="navbar-start">
                    <RouterLink to="/" class="navbar-item">
                        <span class="icon-text">
                            <span class="icon">
                                <i class="fas fa-running"></i>
                            </span>
                            <span>My Activity</span>
                        </span>
                    </RouterLink>
                    
                    <RouterLink to="/statistics" class="navbar-item">
                        <span class="icon-text">
                            <span class="icon">
                                <i class="fas fa-chart-bar"></i>
                            </span>
                            <span>Statistics</span>
                        </span>
                    </RouterLink>
                    
                    <RouterLink to="/friends" class="navbar-item">
                        <span class="icon-text">
                            <span class="icon">
                                <i class="fas fa-users"></i>
                            </span>
                            <span>Friends Activity</span>
                        </span>
                    </RouterLink>
                    
                    <RouterLink to="/search" class="navbar-item">
                        <span class="icon-text">
                            <span class="icon">
                                <i class="fas fa-search"></i>
                            </span>
                            <span>People Search</span>
                        </span>
                    </RouterLink>

                    <div class="navbar-item has-dropdown" 
                         :class="{ 'is-active': isAdminDropdownActive }">
                        <a class="navbar-link" @click.prevent="toggleDropdown('admin')">
                                <span>Admin</span>
                        </a>

                        <div class="navbar-dropdown">
                            <RouterLink to="/admin/users" class="navbar-item">
                                    <span>Manage Users</span>
                            </RouterLink>
                        </div>
                    </div>
                </div>

                <div class="navbar-end">
                    <div class="navbar-item">
                        <div class="buttons">
                            <RouterLink to="/signup" class="button is-primary">
                                <span>Sign up</span>
                                <span class="icon">
                                    <i class="fas fa-user-plus"></i>
                                </span>
                            </RouterLink>
                            
                            <div class="navbar-item has-dropdown"
                                 :class="{ 'is-active': isLoginDropdownActive }">
                                <a class="button is-light" @click.prevent="toggleDropdown('login')">
                                    <span>Log in</span>
                                    <span class="icon">
                                        <i class="fas fa-sign-in-alt"></i>
                                    </span>
                                </a>
                                <div class="navbar-dropdown is-right">
                                    <RouterLink to="/login" class="navbar-item">ADMIN</RouterLink>
                                    <RouterLink to="/login/" class="navbar-item">Jack Lin</RouterLink>
                                    <RouterLink to="/login/" class="navbar-item">John Doe</RouterLink>
                                    <hr class="navbar-divider">
                                    <RouterLink to="/password-reset" class="navbar-item">Forgot Password?</RouterLink>
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

/* New styles for button with icon */
.button {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.button .icon {
    margin-left: 0.5em;
}

/* Remove is-hoverable class styles as we're using click now */
.navbar-item.has-dropdown .navbar-link {
    cursor: pointer;
}

.navbar-link .icon {
    margin-left: 0.5em;
}

/* Add styles for icon spacing in navbar items */
.navbar-item .icon {
    margin-right: 0.3em;
}

/* Fix icon alignment in admin dropdown */
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
</style>