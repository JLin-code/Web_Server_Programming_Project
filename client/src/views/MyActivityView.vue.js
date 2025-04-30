import { ref, computed, onMounted } from 'vue';
import { activitiesService } from '../services/activitiesApi';
import { authService } from '../services/api';
import AddActivityForm from '../components/AddActivityForm.vue';
const page = 'My Activity';
const showAddForm = ref(false);
const activities = ref([]); // Add proper type annotation
const loading = ref(true);
const error = ref('');
const currentUser = ref({ id: null, name: '' });
// Format date helper
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
// Computed property to filter activities based on current user's name
const filteredActivities = computed(() => {
    return activities.value.filter(activity => activity.user.name === currentUser.value.name);
});
// Delete activity function
const deleteActivity = async (id) => {
    try {
        await activitiesService.delete(id);
        activities.value = activities.value.filter(a => a.id !== id);
    }
    catch (err) {
        console.error('Failed to delete activity:', err);
        error.value = 'Failed to delete activity';
    }
};
// Add a like function to handle activity likes
const likeActivity = async (id) => {
    try {
        const activity = activities.value.find(a => a.id === id);
        if (!activity)
            return;
        await activitiesService.update(id, { likes: activity.likes + 1 });
        activity.likes++;
    }
    catch (err) {
        console.error('Failed to like activity:', err);
        error.value = 'Failed to like activity';
    }
};
onMounted(async () => {
    try {
        loading.value = true;
        // Get current user
        const userResponse = await authService.getCurrentUser();
        currentUser.value = {
            id: userResponse.user.id,
            name: `${userResponse.user.first_name} ${userResponse.user.last_name}`
        };
        // Get activities
        const response = await activitiesService.getAll();
        activities.value = response.items || [];
    }
    catch (err) {
        error.value = 'Failed to load your activities';
        console.error(err);
    }
    finally {
        loading.value = false;
    }
});
const toggleAddForm = () => {
    showAddForm.value = !showAddForm.value;
};
const handleActivityAdded = () => {
    showAddForm.value = false;
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-image']} */ ;
/** @type {__VLS_StyleScopedClasses['engagement-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-small']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-button']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "title" },
});
(__VLS_ctx.page);
if (!__VLS_ctx.showAddForm) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.toggleAddForm) },
        ...{ class: "btn-primary" },
    });
}
if (__VLS_ctx.showAddForm) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    /** @type {[typeof AddActivityForm, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(AddActivityForm, new AddActivityForm({
        ...{ 'onActivityAdded': {} },
        ...{ 'onCancel': {} },
    }));
    const __VLS_1 = __VLS_0({
        ...{ 'onActivityAdded': {} },
        ...{ 'onCancel': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    let __VLS_3;
    let __VLS_4;
    let __VLS_5;
    const __VLS_6 = {
        onActivityAdded: (__VLS_ctx.handleActivityAdded)
    };
    const __VLS_7 = {
        onCancel: (__VLS_ctx.toggleAddForm)
    };
    var __VLS_2;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "activities-container" },
    });
    if (__VLS_ctx.loading) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "loading" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    }
    else if (__VLS_ctx.error) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "error" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.error);
    }
    else if (__VLS_ctx.filteredActivities.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-state" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.currentUser.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.toggleAddForm) },
            ...{ class: "btn" },
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "activities-list" },
        });
        for (const [activity] of __VLS_getVForSourceType((__VLS_ctx.filteredActivities))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (activity.id),
                ...{ class: "activity-card card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.showAddForm))
                            return;
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.error))
                            return;
                        if (!!(__VLS_ctx.filteredActivities.length === 0))
                            return;
                        __VLS_ctx.deleteActivity(Number(activity.id));
                    } },
                ...{ class: "delete-button" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "user-info" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img, __VLS_intrinsicElements.img)({
                src: (activity.user.avatar),
                alt: (activity.user.name),
                ...{ class: "user-avatar" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
                ...{ class: "user-name" },
            });
            (activity.user.name);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "activity-date" },
            });
            (__VLS_ctx.formatDate(activity.date));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "activity-content" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
                ...{ class: "activity-title" },
            });
            (activity.title);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "activity-description" },
            });
            (activity.description);
            if (activity.image) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "activity-image-container" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.img, __VLS_intrinsicElements.img)({
                    src: (activity.image),
                    alt: (activity.title),
                    ...{ class: "activity-image" },
                });
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "activity-metrics" },
            });
            for (const [value, key] of __VLS_getVForSourceType((activity.metrics))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (key),
                    ...{ class: "metric" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "metric-value" },
                });
                (value);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "metric-label" },
                });
                (key);
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "activity-engagement" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "engagement-stats" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (activity.likes);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (activity.comments);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "engagement-actions" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.showAddForm))
                            return;
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!!(__VLS_ctx.error))
                            return;
                        if (!!(__VLS_ctx.filteredActivities.length === 0))
                            return;
                        __VLS_ctx.likeActivity(Number(activity.id));
                    } },
                ...{ class: "engagement-btn" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ class: "engagement-btn" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ class: "btn-small" },
            });
        }
    }
}
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['activities-container']} */ ;
/** @type {__VLS_StyleScopedClasses['loading']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['activities-list']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-button']} */ ;
/** @type {__VLS_StyleScopedClasses['user-info']} */ ;
/** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['user-name']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-date']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-content']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-title']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-description']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-image-container']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-image']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-metrics']} */ ;
/** @type {__VLS_StyleScopedClasses['metric']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-value']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-label']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-engagement']} */ ;
/** @type {__VLS_StyleScopedClasses['engagement-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['engagement-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['engagement-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['engagement-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-small']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AddActivityForm: AddActivityForm,
            page: page,
            showAddForm: showAddForm,
            loading: loading,
            error: error,
            currentUser: currentUser,
            formatDate: formatDate,
            filteredActivities: filteredActivities,
            deleteActivity: deleteActivity,
            likeActivity: likeActivity,
            toggleAddForm: toggleAddForm,
            handleActivityAdded: handleActivityAdded,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=MyActivityView.vue.js.map