import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../pages/HomeView.vue'

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
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../pages/NotFoundView.vue')
    }
  ]
})

export default router