import { createRouter, createWebHistory } from 'vue-router'
import { userStore } from '../stores/userStore'
import HomeView from '../views/HomeView.vue'
import MyActivityView from '../views/MyActivityView.vue'
import FriendsActivityView from '../views/FriendsActivityView.vue'
import PeopleSearchView from '../views/PeopleSearchView.vue'
import ManageUsersView from '../views/ManageUsersView.vue'
import SignUpView from '../views/SignUpView.vue'
import ExerciseTypesView from '../views/ExerciseTypesView.vue'
import LoginView from '../views/LoginView.vue'
import FriendsView from '../views/FriendsView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import ProfileView from '../views/ProfileView.vue'

// Auth guard for protected routes
const requireAuth = async (to, from, next) => {
  // Initialize user store if needed
  if (!userStore.isAuthenticated.value && !userStore.isLoading.value) {
    await userStore.initializeStore();
  }
  
  if (userStore.isAuthenticated.value) {
    next()
  } else {
    next({
      path: '/login', 
      query: { redirect: to.fullPath }
    });
  }
}

// Admin guard for admin-only routes
const requireAdmin = async (to, from, next) => {
  // Initialize user store if needed
  if (!userStore.isAuthenticated.value && !userStore.isLoading.value) {
    await userStore.initializeStore();
  }
  
  if (userStore.isAuthenticated.value && userStore.currentUser.value?.isAdmin) {
    next()
  } else if (userStore.isAuthenticated.value) {
    // User is logged in but not an admin
    next({ path: '/' });
  } else {
    // User is not logged in
    next({
      path: '/login', 
      query: { redirect: to.fullPath }
    });
  }
}

// Guest only routes (like login, signup)
const guestOnly = async (to, from, next) => {
  // Initialize user store if needed
  if (!userStore.isLoading.value) {
    await userStore.initializeStore();
  }
  
  if (userStore.isAuthenticated.value) {
    // If already logged in, redirect to home
    next({ path: '/' })
  } else {
    next()
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      beforeEnter: guestOnly
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUpView,
      beforeEnter: guestOnly
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      beforeEnter: requireAuth
    },
    {
      path: '/my-activity',
      name: 'myActivity',
      component: MyActivityView,
      beforeEnter: requireAuth
    },
    {
      path: '/friend-activity',
      name: 'friendActivity',
      component: FriendsActivityView,
      beforeEnter: requireAuth
    },
    {
      path: '/friends',
      name: 'friends',
      component: FriendsView,
      beforeEnter: requireAuth
    },
    {
      path: '/people-search',
      name: 'peopleSearch',
      component: PeopleSearchView,
      beforeEnter: requireAuth
    },
    {
      path: '/exercise-types',
      name: 'exerciseTypes',
      component: ExerciseTypesView,
      beforeEnter: requireAuth
    },
    {
      path: '/manage-users',
      name: 'manageUsers',
      component: ManageUsersView,
      beforeEnter: requireAdmin
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView
    }
  ]
})

export default router