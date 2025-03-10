"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = import("vue");
var userStore_1 = import("../stores/userStore");
var vue_router_1 = import("vue-router");
var router = (0, vue_router_1.useRouter)();
var isActive = (0, vue_1.ref)(false);
var isLoginDropdownActive = (0, vue_1.ref)(false);
var isAdminDropdownActive = (0, vue_1.ref)(false);
var isLoggedIn = (0, vue_1.ref)(false);
var attemptedRoute = (0, vue_1.ref)('');
var currentUser = (0, vue_1.ref)({
    name: '',
    isAdmin: false
});
(0, vue_1.onMounted)(function () {
    isLoggedIn.value = userStore_1.userStore.isLoggedIn();
    if (isLoggedIn.value) {
        currentUser.value.name = userStore_1.userStore.currentUser();
        currentUser.value.isAdmin = currentUser.value.name === 'ADMIN';
    }
});
// Toggles dropdown while ensuring only one is open at a time
function toggleDropdown(dropdown) {
    if (dropdown === 'login') {
        isLoginDropdownActive.value = !isLoginDropdownActive.value;
        isAdminDropdownActive.value = false;
    }
    else if (dropdown === 'admin') {
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
function checkLoginBeforeNav(route) {
    if (!isLoggedIn.value) {
        attemptedRoute.value = route;
        isLoginDropdownActive.value = true;
        return false;
    }
    return true;
}
function login(username, admin) {
    if (admin === void 0) { admin = false; }
    currentUser.value.name = username;
    currentUser.value.isAdmin = admin;
    isLoggedIn.value = true;
    isLoginDropdownActive.value = false;
    userStore_1.userStore.login(username);
    if (attemptedRoute.value) {
        router.push(attemptedRoute.value);
        attemptedRoute.value = '';
    }
}
function logout() {
    isLoggedIn.value = false;
    currentUser.value.name = '';
    currentUser.value.isAdmin = false;
    userStore_1.userStore.logout();
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
// Remove unused variables
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
/** @type {__VLS_StyleScopedClasses['button']} */ ;
/** @type {__VLS_StyleScopedClasses['button']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['has-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-link']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-link']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-link']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-link']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-text']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-brand']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['has-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['login-dropdown-container']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['login-dropdown-container']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['login-dropdown-container']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['login-dropdown-container']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['login-dropdown-container']} */ ;
/** @type {__VLS_StyleScopedClasses['login-dropdown-container']} */ ;
/** @type {__VLS_StyleScopedClasses['button']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['button']} */ ;
/** @type {__VLS_StyleScopedClasses['login-dropdown-container']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['login-dropdown-container']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['login-dropdown-container']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['login-dropdown-container']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['login-dropdown-container']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['login-dropdown-container']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['login-dropdown-container']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['login-dropdown-container']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['login-dropdown-container']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-divider']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)(__assign(__assign({ onClick: (__VLS_ctx.closeDropdowns) }, { class: "navbar is-info" }), { role: "navigation", 'aria-label': "main navigation" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "container" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "navbar-brand" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)(__assign({ onClick: function () {
        __VLS_ctx.router.push('/');
    } }, { class: "navbar-item" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)(__assign(__assign({ alt: "Vue logo" }, { class: "logo" }), { src: "@/assets/logo.svg", width: "30" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)(__assign({ onClick: function () {
        __VLS_ctx.checkLoginBeforeNav('/') && __VLS_ctx.router.push('/my-activity');
    } }, { class: "navbar-item is-hidden-mobile" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "icon-text" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "icon" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)(__assign({ class: "fas fa-running" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)(__assign({ onClick: function () {
        __VLS_ctx.router.push('/');
    } }, { class: "navbar-item is-hidden-mobile" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "icon-text" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "icon" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)(__assign({ class: "fas fa-chart-bar" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)(__assign({ onClick: function () {
        __VLS_ctx.checkLoginBeforeNav('/friends') && __VLS_ctx.router.push('/friend-activity');
    } }, { class: "navbar-item is-hidden-mobile" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "icon-text" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "icon" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)(__assign({ class: "fas fa-users" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)(__assign(__assign(__assign(__assign({ onClick: (__VLS_ctx.toggleBurger) }, { role: "button" }), { class: "navbar-burger" }), { 'aria-label': "menu", 'aria-expanded': "false" }), { class: ({ 'is-active': __VLS_ctx.isActive }) }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    'aria-hidden': "true",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    'aria-hidden': "true",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    'aria-hidden': "true",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    'aria-hidden': "true",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "navbar-menu" }, { class: ({ 'is-active': __VLS_ctx.isActive }) }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "navbar-start" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)(__assign({ onClick: function () {
        __VLS_ctx.checkLoginBeforeNav('/') && __VLS_ctx.router.push('/my-activity');
    } }, { class: "navbar-item is-hidden-tablet" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "icon-text" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "icon" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)(__assign({ class: "fas fa-running" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)(__assign({ onClick: function () {
        __VLS_ctx.router.push('/');
    } }, { class: "navbar-item is-hidden-tablet" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "icon-text" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "icon" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)(__assign({ class: "fas fa-chart-bar" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)(__assign({ onClick: function () {
        __VLS_ctx.checkLoginBeforeNav('/friends') && __VLS_ctx.router.push('/friends');
    } }, { class: "navbar-item is-hidden-tablet" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "icon-text" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "icon" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)(__assign({ class: "fas fa-users" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)(__assign({ onClick: function () {
        __VLS_ctx.checkLoginBeforeNav('/search') && __VLS_ctx.router.push('/people-search');
    } }, { class: "navbar-item" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "icon-text" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "icon" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)(__assign({ class: "fas fa-search" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
if (__VLS_ctx.isLoggedIn && __VLS_ctx.currentUser.isAdmin) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "navbar-item has-dropdown" }, { class: ({ 'is-active': __VLS_ctx.isAdminDropdownActive }) }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)(__assign({ onClick: function () {
        if (!(__VLS_ctx.isLoggedIn && __VLS_ctx.currentUser.isAdmin))
            return;
        __VLS_ctx.toggleDropdown('admin');
    } }, { class: "navbar-link" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "navbar-dropdown" }));
    var __VLS_0 = {}.RouterLink;
    // @ts-expect-error
    var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0(__assign({ to: "/manage-users" }, { class: "navbar-item" })));
    /* eslint-disable @typescript-eslint/no-unused-vars */
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ to: "/manage-users" }, { class: "navbar-item" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
    /* eslint-enable @typescript-eslint/no-unused-vars */
    // Use the slots to fix unused expression
    var __VLS_3 = { slots: { default: function() {} } };
    __VLS_3.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "navbar-end" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "navbar-item" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "buttons" }));
if (!__VLS_ctx.isLoggedIn) {
    var __VLS_4 = {}.RouterLink;
    // @ts-expect-error
    var __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4(__assign({ to: "/signup" }, { class: "button is-primary" })));
    /* eslint-disable @typescript-eslint/no-unused-vars */
    var __VLS_6 = __VLS_5.apply(void 0, __spreadArray([__assign({ to: "/signup" }, { class: "button is-primary" })], __VLS_functionalComponentArgsRest(__VLS_5), false));
    /* eslint-enable @typescript-eslint/no-unused-vars */
    // Use the slots to fix unused expression
    var __VLS_7 = { slots: { default: function() {} } };
    __VLS_7.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "icon" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)(__assign({ class: "fas fa-user-plus" }));
}
if (__VLS_ctx.isLoggedIn) {
    var __VLS_8 = {}.RouterLink;
    // @ts-expect-error
    var __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8(__assign({ to: "/profile" }, { class: "button is-primary" })));
    /* eslint-disable @typescript-eslint/no-unused-vars */
    var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([__assign({ to: "/profile" }, { class: "button is-primary" })], __VLS_functionalComponentArgsRest(__VLS_9), false));
    /* eslint-enable @typescript-eslint/no-unused-vars */
    // Use the slots to fix unused expression
    var __VLS_11 = { slots: { default: function() {} } };
    __VLS_11.slots.default;
    // Fix unused expression
    var userName = __VLS_ctx.currentUser.name;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "icon" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)(__assign({ class: "fas fa-user" }));
}
if (__VLS_ctx.isLoggedIn) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)(__assign({ onClick: (__VLS_ctx.logout) }, { class: "button is-light" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "icon" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)(__assign({ class: "fas fa-sign-out-alt" }));
}
if (!__VLS_ctx.isLoggedIn) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "login-dropdown-container" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)(__assign({ onClick: function () {
        if (!(!__VLS_ctx.isLoggedIn))
            return;
        __VLS_ctx.toggleDropdown('login');
    } }, { class: "button is-light" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.attemptedRoute ? '(to access ' + __VLS_ctx.attemptedRoute + ')' : '');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "icon" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)(__assign({ class: "fas fa-sign-in-alt" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "navbar-dropdown is-right" }, { class: ({ 'is-active': __VLS_ctx.isLoginDropdownActive }) }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)(__assign({ onClick: function () {
        if (!(!__VLS_ctx.isLoggedIn))
            return;
        __VLS_ctx.login('Admin', true);
    } }, { class: "navbar-item" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)(__assign({ onClick: function () {
        if (!(!__VLS_ctx.isLoggedIn))
            return;
        __VLS_ctx.login('Jane Smith');
    } }, { class: "navbar-item" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)(__assign({ onClick: function () {
        if (!(!__VLS_ctx.isLoggedIn))
            return;
        __VLS_ctx.login('John Doe');
    } }, { class: "navbar-item" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)(__assign({ onClick: function () {
        if (!(!__VLS_ctx.isLoggedIn))
            return;
        __VLS_ctx.login('Major Major');
    } }, { class: "navbar-item" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)(__assign({ onClick: function () {
        if (!(!__VLS_ctx.isLoggedIn))
            return;
        __VLS_ctx.login('Laura Green');
    } }, { class: "navbar-item" }));
}
/** @type {__VLS_StyleScopedClasses['navbar']} */ ;
/** @type {__VLS_StyleScopedClasses['is-info']} */ ;
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-brand']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['is-hidden-mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-text']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-running']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['is-hidden-mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-text']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-chart-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['is-hidden-mobile']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-text']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-users']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-burger']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-start']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['is-hidden-tablet']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-text']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-running']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['is-hidden-tablet']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-text']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-chart-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['is-hidden-tablet']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-text']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-users']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-text']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-search']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['has-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-link']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-end']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['button']} */ ;
/** @type {__VLS_StyleScopedClasses['is-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-user-plus']} */ ;
/** @type {__VLS_StyleScopedClasses['button']} */ ;
/** @type {__VLS_StyleScopedClasses['is-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-user']} */ ;
/** @type {__VLS_StyleScopedClasses['button']} */ ;
/** @type {__VLS_StyleScopedClasses['is-light']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-sign-out-alt']} */ ;
/** @type {__VLS_StyleScopedClasses['login-dropdown-container']} */ ;
/** @type {__VLS_StyleScopedClasses['button']} */ ;
/** @type {__VLS_StyleScopedClasses['is-light']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-sign-in-alt']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['is-right']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
/** @type {__VLS_StyleScopedClasses['navbar-item']} */ ;
var __VLS_self = (await Promise.resolve().then(function () { return import('vue'); })).defineComponent({
    setup: function () {
        return {
            router: router,
            isActive: isActive,
            isLoginDropdownActive: isLoginDropdownActive,
            isAdminDropdownActive: isAdminDropdownActive,
            isLoggedIn: isLoggedIn,
            attemptedRoute: attemptedRoute,
            currentUser: currentUser,
            toggleDropdown: toggleDropdown,
            closeDropdowns: closeDropdowns,
            toggleBurger: toggleBurger,
            checkLoginBeforeNav: checkLoginBeforeNav,
            login: login,
            logout: logout,
        };
    },
});
/* eslint-disable @typescript-eslint/no-unused-vars */
exports.default = (await Promise.resolve().then(function () { return import('vue'); })).defineComponent({
    setup: function () {
        return {};
    },
});
/* eslint-enable @typescript-eslint/no-unused-vars */
; /* PartiallyEnd: #4569/main.vue */
