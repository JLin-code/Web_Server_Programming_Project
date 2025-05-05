import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../pages/HomeView.vue'
import WorkoutStatsPage from '../pages/WorkoutStatsPage.vue'
import ProfileView from '../pages/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/my-activity',
      name: 'my-activity',
      component: () => import('../pages/MyActivityView.vue')
    },
    {
      path: '/friend-activity',
      name: 'friend-activity',
      component: () => import('../pages/FriendsActivityView.vue')
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../pages/SignUpView.vue')
    },
    {
      path: '/workout-stats',
      name: 'WorkoutStats',
      component: WorkoutStatsPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/workout-stats/:userId',
      name: 'UserWorkoutStats',
      component: WorkoutStatsPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    },
    {
      path: '/profile/:id',
      name: 'UserProfile',
      component: ProfileView
    },
    {
      path: '/people-search',
      name: 'peopleSearch',
      component: () => import('../pages/PeopleSearchView.vue')
    },
    {
      path: '/manage-users',
      name: 'manageUsers',
      component: () => import('../pages/ManageUsersView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../pages/NotFound.vue')
    }
  ]
})

export default router