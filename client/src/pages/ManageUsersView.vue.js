import { ref, onMounted } from 'vue';
import { userService } from '../services/api';
const page = ref('Manage Users');
const users = ref([]);
const loading = ref(true);
const error = ref('');
onMounted(async () => {
    try {
        loading.value = true;
        const response = await userService.getAll();
        users.value = response.items.map((user) => ({
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            handle: user.handle || `@${user.first_name.toLowerCase()}`,
            isAdmin: user.role === 'admin'
        }));
    }
    catch (err) {
        error.value = 'Failed to load users';
        console.error(err);
    }
    finally {
        loading.value = false;
    }
});
async function editUser(user) {
    console.log('Edit user:', user);
    alert(`Editing user: ${user.firstName} ${user.lastName}`);
    // Implement actual edit functionality
}
async function deleteUser(user) {
    console.log('Delete user:', user);
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
        try {
            await userService.delete(user.id);
            users.value = users.value.filter(u => u.id !== user.id);
            console.log('User deleted');
        }
        catch (err) {
            console.error(`Failed to delete user:`, err);
        }
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['button']} */ ;
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['button']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "title" },
});
(__VLS_ctx.page);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
    ...{ class: "table is-fullwidth is-striped is-hoverable" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
for (const [user, index] of __VLS_getVForSourceType((__VLS_ctx.users))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
        key: (index),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    (user.firstName);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    (user.lastName);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    (user.email);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    (user.handle);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tag" },
        ...{ class: (user.isAdmin ? 'is-success' : 'is-warning') },
    });
    (user.isAdmin ? 'Yes' : 'No');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "buttons" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.editUser(user);
            } },
        ...{ class: "button is-small is-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-edit" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.deleteUser(user);
            } },
        ...{ class: "button is-small is-danger" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "fas fa-trash-alt" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['is-fullwidth']} */ ;
/** @type {__VLS_StyleScopedClasses['is-striped']} */ ;
/** @type {__VLS_StyleScopedClasses['is-hoverable']} */ ;
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
/** @type {__VLS_StyleScopedClasses['buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['button']} */ ;
/** @type {__VLS_StyleScopedClasses['is-small']} */ ;
/** @type {__VLS_StyleScopedClasses['is-info']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-edit']} */ ;
/** @type {__VLS_StyleScopedClasses['button']} */ ;
/** @type {__VLS_StyleScopedClasses['is-small']} */ ;
/** @type {__VLS_StyleScopedClasses['is-danger']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-trash-alt']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            page: page,
            users: users,
            editUser: editUser,
            deleteUser: deleteUser,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=ManageUsersView.vue.js.map