import { ref, onMounted } from 'vue';
import { userService, friendService } from '../services/api';
const page = 'People Search';
// Users state
const users = ref([]);
const loading = ref(true);
const error = ref('');
const searchQuery = ref('');
const currentUserId = ref(null);
onMounted(async () => {
    try {
        loading.value = true;
        // Get current user
        const userResponse = await userService.getCurrentUser();
        if (userResponse && userResponse.user) {
            currentUserId.value = userResponse.user.id;
        }
        // Get all users
        const response = await userService.getAll();
        // Get friends
        let friendIds = new Set();
        if (currentUserId.value !== null) {
            const friendsResponse = await friendService.getFriends(currentUserId.value);
            friendIds = new Set(friendsResponse.items.map((friend) => friend.id));
        }
        // Mark friends in the user list
        users.value = response.items.map((user) => ({
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            handle: user.handle || `@${user.first_name.toLowerCase()}`,
            isFriend: friendIds.has(user.id)
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
function filteredUsers() {
    if (!searchQuery.value) {
        return users.value;
    }
    const query = searchQuery.value.toLowerCase();
    return users.value.filter(user => user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.handle.toLowerCase().includes(query));
}
async function addFriend(user) {
    try {
        if (!currentUserId.value)
            return;
        await friendService.addFriend(currentUserId.value, user.id);
        user.isFriend = true;
        console.log(`Added ${user.firstName} as friend`);
    }
    catch (err) {
        console.error(`Failed to add ${user.firstName} as friend:`, err);
    }
}
async function removeFriend(user) {
    if (!currentUserId.value)
        return;
    if (confirm(`Are you sure you want to remove ${user.firstName} ${user.lastName} from your friends?`)) {
        try {
            await friendService.removeFriend(currentUserId.value, user.id);
            user.isFriend = false;
            console.log(`Removed ${user.firstName} from friends`);
        }
        catch (err) {
            console.error(`Failed to remove ${user.firstName} from friends:`, err);
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "container section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "title" },
});
(__VLS_ctx.page);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "control has-icons-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
    ...{ class: "input" },
    type: "text",
    placeholder: "Search by name, email, or handle",
    value: (__VLS_ctx.searchQuery),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "icon is-small is-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-search" },
});
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
for (const [user, index] of __VLS_getVForSourceType((__VLS_ctx.filteredUsers()))) {
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
        ...{ class: (user.isFriend ? 'is-success' : 'is-danger') },
    });
    (user.isFriend ? 'Friend' : 'Not Friend');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "buttons" },
    });
    if (!user.isFriend) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(!user.isFriend))
                        return;
                    __VLS_ctx.addFriend(user);
                } },
            ...{ class: "button is-small is-primary" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: "fas fa-user-plus" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!user.isFriend))
                        return;
                    __VLS_ctx.removeFriend(user);
                } },
            ...{ class: "button is-small is-danger" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: "fas fa-user-minus" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
}
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['section']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['control']} */ ;
/** @type {__VLS_StyleScopedClasses['has-icons-left']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['is-small']} */ ;
/** @type {__VLS_StyleScopedClasses['is-left']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-search']} */ ;
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['is-fullwidth']} */ ;
/** @type {__VLS_StyleScopedClasses['is-striped']} */ ;
/** @type {__VLS_StyleScopedClasses['is-hoverable']} */ ;
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
/** @type {__VLS_StyleScopedClasses['buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['button']} */ ;
/** @type {__VLS_StyleScopedClasses['is-small']} */ ;
/** @type {__VLS_StyleScopedClasses['is-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-user-plus']} */ ;
/** @type {__VLS_StyleScopedClasses['button']} */ ;
/** @type {__VLS_StyleScopedClasses['is-small']} */ ;
/** @type {__VLS_StyleScopedClasses['is-danger']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-user-minus']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            page: page,
            searchQuery: searchQuery,
            filteredUsers: filteredUsers,
            addFriend: addFriend,
            removeFriend: removeFriend,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=PeopleSearchView.vue.js.map