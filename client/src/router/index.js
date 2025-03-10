"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vue_router_1 = require("vue-router");
var HomeView_vue_1 = require("../views/HomeView.vue");
var PeopleSearchView_vue_1 = require("../views/PeopleSearchView.vue");
var MyActivityView_vue_1 = require("../views/MyActivityView.vue");
var ManageUsersView_vue_1 = require("../views/ManageUsersView.vue");
var SignUpView_vue_1 = require("../views/SignUpView.vue");
var FriendsActivityView_vue_1 = require("../views/FriendsActivityView.vue");
var router = (0, vue_router_1.createRouter)({
    history: (0, vue_router_1.createWebHistory)(''),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView_vue_1.default,
        },
        {
            path: '/friend-activity',
            name: 'friendActivity',
            component: FriendsActivityView_vue_1.default,
        },
        {
            path: '/friends-activity',
            name: 'friendsActivity',
            component: FriendsActivityView_vue_1.default,
        },
        {
            path: '/my-activity',
            name: 'myActivity',
            component: MyActivityView_vue_1.default,
        },
        {
            path: '/people-search',
            name: 'peopleSearch',
            component: PeopleSearchView_vue_1.default,
        },
        {
            path: '/manage-users',
            name: 'manageUsers',
            component: ManageUsersView_vue_1.default,
        },
        {
            path: '/signup',
            name: 'signup',
            component: SignUpView_vue_1.default,
        },
    ],
});
exports.default = router;
