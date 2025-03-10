import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PeopleSearchView from '../views/PeopleSearchView.vue'
import MyActivityView from '../views/MyActivityView.vue'
import ManageUsersView from '../views/ManageUsersView.vue'
import SignUpView from '../views/SignUpView.vue'
import FriendsActivityView from '../views/FriendsActivityView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/friend-activity',
      name: 'friendActivity',
      component: FriendsActivityView,
    },
    {
      path: '/friends-activity',
      name: 'friendsActivity',
      component: FriendsActivityView,
    },
    {
      path: '/my-activity',
      name: 'myActivity',
      component: MyActivityView,
    },
    {
      path: '/people-search',
      name: 'peopleSearch',
      component: PeopleSearchView,
    },
    {
      path: '/manage-users',
      name: 'manageUsers',
      component: ManageUsersView,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUpView,
    },
  ],
})

export default router