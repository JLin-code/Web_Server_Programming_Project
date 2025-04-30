import { ref, reactive } from 'vue';
import { activitiesService } from '../services/activitiesApi';
import { authService } from '../services/api';
// Define emits
const emit = defineEmits(['activityAdded', 'cancel']);
// Form state
const formData = reactive({
    title: '',
    description: '',
    type: 'workout', // Default type
    image: '',
    metrics: {}
});
// For handling dynamic metrics
const metricKeys = ref(['']); // Start with one empty metric
const metricValues = ref(['']); // Start with one empty value
// Form validation
const errors = ref({
    title: '',
    description: '',
    type: '',
    metrics: ''
});
// Activity types
const activityTypes = [
    { value: 'workout', label: 'Workout' },
    { value: 'goal', label: 'Goal' },
    { value: 'achievement', label: 'Achievement' },
    { value: 'normal', label: 'General' }
];
// Handle adding a new metric field
const addMetricField = () => {
    metricKeys.value.push('');
    metricValues.value.push('');
};
// Handle removing a metric field
const removeMetricField = (index) => {
    metricKeys.value.splice(index, 1);
    metricValues.value.splice(index, 1);
};
// Submit form handler
const submitForm = async () => {
    // Reset errors
    errors.value = {
        title: '',
        description: '',
        type: '',
        metrics: ''
    };
    // Validate form
    let isValid = true;
    if (!formData.title.trim()) {
        errors.value.title = 'Title is required';
        isValid = false;
    }
    if (!formData.description.trim()) {
        errors.value.description = 'Description is required';
        isValid = false;
    }
    if (!formData.type) {
        errors.value.type = 'Activity type is required';
        isValid = false;
    }
    // Build metrics object from key-value pairs
    const metrics = {};
    for (let i = 0; i < metricKeys.value.length; i++) {
        const key = metricKeys.value[i].trim();
        const value = metricValues.value[i].trim();
        if (key && value) {
            metrics[key] = value;
        }
    }
    if (Object.keys(metrics).length === 0) {
        errors.value.metrics = 'At least one metric is required';
        isValid = false;
    }
    if (!isValid) {
        return;
    }
    // Get current user
    try {
        const userResponse = await authService.getCurrentUser();
        if (!userResponse || !userResponse.user) {
            console.error('User not logged in');
            return;
        }
        const userId = userResponse.user.id;
        const imageUrl = formData.image.trim() || null;
        // Create activity object
        const newActivity = {
            user_id: userId,
            title: formData.title,
            description: formData.description,
            type: formData.type,
            metrics,
            image: imageUrl
        };
        // Submit to API
        const response = await activitiesService.create(newActivity);
        // Reset form
        formData.title = '';
        formData.description = '';
        formData.type = 'workout';
        formData.image = '';
        metricKeys.value = [''];
        metricValues.value = [''];
        // Emit event to parent component
        emit('activityAdded', response);
    }
    catch (error) {
        console.error('Failed to add activity:', error);
    }
};
const cancelForm = () => {
    emit('cancel');
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "add-activity-form card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
    ...{ onSubmit: (__VLS_ctx.submitForm) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "title",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    id: "title",
    value: (__VLS_ctx.formData.title),
    type: "text",
    placeholder: "e.g. Morning Run",
    ...{ class: ({ 'error': __VLS_ctx.errors.title }) },
});
if (__VLS_ctx.errors.title) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "error-message" },
    });
    (__VLS_ctx.errors.title);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "description",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
    id: "description",
    value: (__VLS_ctx.formData.description),
    placeholder: "Describe your activity...",
    ...{ class: ({ 'error': __VLS_ctx.errors.description }) },
});
if (__VLS_ctx.errors.description) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "error-message" },
    });
    (__VLS_ctx.errors.description);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "type",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    id: "type",
    value: (__VLS_ctx.formData.type),
    ...{ class: ({ 'error': __VLS_ctx.errors.type }) },
});
for (const [option] of __VLS_getVForSourceType((__VLS_ctx.activityTypes))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        key: (option.value),
        value: (option.value),
    });
    (option.label);
}
if (__VLS_ctx.errors.type) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "error-message" },
    });
    (__VLS_ctx.errors.type);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    for: "image",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    id: "image",
    value: (__VLS_ctx.formData.image),
    type: "text",
    placeholder: "https://example.com/image.jpg",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.addMetricField) },
    type: "button",
    ...{ class: "btn-small" },
});
if (__VLS_ctx.errors.metrics) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "error-message" },
    });
    (__VLS_ctx.errors.metrics);
}
for (const [_, index] of __VLS_getVForSourceType((__VLS_ctx.metricKeys))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (`metric-${index}`),
        ...{ class: "metric-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric-key" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        value: (__VLS_ctx.metricKeys[index]),
        type: "text",
        placeholder: "Metric name (e.g. Distance)",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric-value" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        value: (__VLS_ctx.metricValues[index]),
        type: "text",
        placeholder: "Value (e.g. 5km)",
    });
    if (index > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(index > 0))
                        return;
                    __VLS_ctx.removeMetricField(index);
                } },
            type: "button",
            ...{ class: "btn-icon" },
        });
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.cancelForm) },
    type: "button",
    ...{ class: "btn-secondary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    type: "submit",
    ...{ class: "btn-primary" },
});
/** @type {__VLS_StyleScopedClasses['add-activity-form']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-small']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-row']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-key']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-value']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formData: formData,
            metricKeys: metricKeys,
            metricValues: metricValues,
            errors: errors,
            activityTypes: activityTypes,
            addMetricField: addMetricField,
            removeMetricField: removeMetricField,
            submitForm: submitForm,
            cancelForm: cancelForm,
        };
    },
    emits: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=AddActivityForm.vue.js.map