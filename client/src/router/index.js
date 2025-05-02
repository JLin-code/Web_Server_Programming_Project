import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../pages/HomeView.vue';
import PeopleSearchView from '../pages/PeopleSearchView.vue';
import MyActivityView from '../pages/MyActivityView.vue';
import ManageUsersView from '../pages/ManageUsersView.vue';
import SignUpView from '../pages/SignUpView.vue';
import FriendsActivityView from '../pages/FriendsActivityView.vue';
const router = createRouter({
    history: createWebHistory(''),
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
});
export default router;
//# sourceMappingURL=index.js.map