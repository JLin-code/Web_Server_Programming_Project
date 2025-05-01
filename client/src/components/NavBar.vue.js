import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/api';
const router = useRouter();
const isActive = ref(false);
const isLoginDropdownActive = ref(false);
const isAdminDropdownActive = ref(false);
const isLoggedIn = ref(false);
const attemptedRoute = ref('');
const demoUsers = ref([]);
const currentUser = ref({
    name: '',
    isAdmin: false
});
// Toggles the burger menu visibility
function toggleBurger() {
    isActive.value = !isActive.value;
}
onMounted(async () => {
    try {
        // Check if user is logged in
        const response = await authService.getCurrentUser();
        if (response && response.user) {
            isLoggedIn.value = true;
            currentUser.value.name = `${response.user.first_name} ${response.user.last_name}`;
            currentUser.value.isAdmin = response.user.role === 'admin';
        }
        // Fetch demo users
        const demoUsersResponse = await authService.getUsers();
        if (demoUsersResponse && demoUsersResponse.users) {
            demoUsers.value = demoUsersResponse.users;
        }
    }
    catch (error) {
        console.error('Error during initialization:', error);
        isLoggedIn.value = false;
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
function checkLoginBeforeNav(route) {
    if (!isLoggedIn.value) {
        attemptedRoute.value = route;
        isLoginDropdownActive.value = true;
        return false;
    }
    return true;
}
async function login(username, password) {
    try {
        const response = await authService.login(username, password);
        if (response.success) {
            currentUser.value.name = `${response.user.first_name} ${response.user.last_name}`;
            currentUser.value.isAdmin = response.user.role === 'admin';
            isLoggedIn.value = true;
            isLoginDropdownActive.value = false;
            if (attemptedRoute.value) {
                router.push(attemptedRoute.value);
                attemptedRoute.value = '';
            }
        }
    }
    catch (error) {
        console.error('Login failed:', error);
    }
}
async function logout() {
    try {
        await authService.logout();
    }
    catch (error) {
        console.error('Logout error:', error);
    }
    finally {
        isLoggedIn.value = false;
        currentUser.value.name = '';
        currentUser.value.isAdmin = false;
        router.push('/');
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)({
    ...{ onClick: (__VLS_ctx.closeDropdowns) },
    ...{ class: "navbar is-info" },
    role: "navigation",
    'aria-label': "main navigation",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "navbar-brand" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.router.push('/');
        } },
    ...{ class: "navbar-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    alt: "Vue logo",
    ...{ class: "logo" },
    src: "@/assets/logo.svg",
    width: "30",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.checkLoginBeforeNav('/') && __VLS_ctx.router.push('/my-activity');
        } },
    ...{ class: "navbar-item is-hidden-mobile" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "icon-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-running" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.router.push('/');
        } },
    ...{ class: "navbar-item is-hidden-mobile" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "icon-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-chart-bar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.checkLoginBeforeNav('/friends') && __VLS_ctx.router.push('/friend-activity');
        } },
    ...{ class: "navbar-item is-hidden-mobile" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "icon-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-users" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
    ...{ onClick: (__VLS_ctx.toggleBurger) },
    role: "button",
    ...{ class: "navbar-burger" },
    'aria-label': "menu",
    'aria-expanded': "false",
    ...{ class: ({ 'is-active': __VLS_ctx.isActive }) },
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    'aria-hidden': "true",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "navbar-menu" },
    ...{ class: ({ 'is-active': __VLS_ctx.isActive }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "navbar-start" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.checkLoginBeforeNav('/') && __VLS_ctx.router.push('/my-activity');
        } },
    ...{ class: "navbar-item is-hidden-tablet" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "icon-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-running" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.router.push('/');
        } },
    ...{ class: "navbar-item is-hidden-tablet" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "icon-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-chart-bar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.checkLoginBeforeNav('/friends') && __VLS_ctx.router.push('/friends');
        } },
    ...{ class: "navbar-item is-hidden-tablet" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "icon-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-users" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.checkLoginBeforeNav('/search') && __VLS_ctx.router.push('/people-search');
        } },
    ...{ class: "navbar-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "icon-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-search" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
  ...{ onClick: (...[$event]) => {
    __VLS_ctx.checkLoginBeforeNav('/exercise-types') && __VLS_ctx.router.push('/exercise-types');
  } },
  ...{ class: "navbar-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
  ...{ class: "icon-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
  ...{ class: "icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
  ...{ class: "fas fa-dumbbell" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
("Exercise Types");
if (__VLS_ctx.isLoggedIn && __VLS_ctx.currentUser.isAdmin) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "navbar-item has-dropdown" },
        ...{ class: ({ 'is-active': __VLS_ctx.isAdminDropdownActive }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isLoggedIn && __VLS_ctx.currentUser.isAdmin))
                    return;
                __VLS_ctx.toggleDropdown('admin');
            } },
        ...{ class: "navbar-link" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "navbar-dropdown" },
    });
    const __VLS_0 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        to: "/manage-users",
        ...{ class: "navbar-item" },
    }));
    const __VLS_2 = __VLS_1({
        to: "/manage-users",
        ...{ class: "navbar-item" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    var __VLS_3;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "navbar-end" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "navbar-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "buttons" },
});
if (!__VLS_ctx.isLoggedIn) {
    const __VLS_4 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        to: "/signup",
        ...{ class: "button is-primary" },
    }));
    const __VLS_6 = __VLS_5({
        to: "/signup",
        ...{ class: "button is-primary" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-user-plus" },
    });
    var __VLS_7;
}
if (__VLS_ctx.isLoggedIn) {
    const __VLS_8 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        to: "/profile",
        ...{ class: "button is-primary" },
    }));
    const __VLS_10 = __VLS_9({
        to: "/profile",
        ...{ class: "button is-primary" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_asFunctionalElement(__VLS_intrinsicElements.span)({
        ...{ class: "icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-user" },
    });
    var __VLS_11;
}
if (__VLS_ctx.isLoggedIn) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
        ...{ onClick: (__VLS_ctx.logout) },
        ...{ class: "button is-light" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-sign-out-alt" },
    });
}
if (!__VLS_ctx.isLoggedIn) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "login-dropdown-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
        ...{ onClick: (...[$event]) => {
                if (!(!__VLS_ctx.isLoggedIn))
                    return;
                __VLS_ctx.toggleDropdown('login');
            } },
        ...{ class: "button is-light" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.attemptedRoute ? '(to access ' + __VLS_ctx.attemptedRoute + ')' : '');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-sign-in-alt" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "navbar-dropdown is-right" },
        ...{ class: ({ 'is-active': __VLS_ctx.isLoginDropdownActive }) },
    });
    for (const [user] of __VLS_getVForSourceType((__VLS_ctx.demoUsers))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
            ...{ onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.isLoggedIn))
                        return;
                    __VLS_ctx.login(user.username, 'password');
                } },
            key: (user.username),
            ...{ class: "navbar-item" },
        });
        (user.displayName);
    }
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
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            router: router,
            isActive: isActive,
            isLoginDropdownActive: isLoginDropdownActive,
            isAdminDropdownActive: isAdminDropdownActive,
            isLoggedIn: isLoggedIn,
            attemptedRoute: attemptedRoute,
            demoUsers: demoUsers,
            currentUser: currentUser,
            toggleBurger: toggleBurger,
            toggleDropdown: toggleDropdown,
            closeDropdowns: closeDropdowns,
            checkLoginBeforeNav: checkLoginBeforeNav,
            login: login,
            logout: logout,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=NavBar.vue.js.map