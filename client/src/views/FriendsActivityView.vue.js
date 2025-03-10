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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
import vue_1 from "vue";
import activityStore_1 from "../stores/activityStore";
var page = 'Friends Activity';
(0, vue_1.onMounted)(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            if (activityStore_1.activityStore.activities.value.length === 0) {
                activityStore_1.activityStore.initializeActivities();
            }
        }
        catch (err) {
            activityStore_1.activityStore.error.value = 'Failed to load activities';
            console.error(err);
        }
        return [2 /*return*/];
    });
}); });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-image']} */ ;
/** @type {__VLS_StyleScopedClasses['engagement-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-small']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-button']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)(__assign({ class: "title" }));
(__VLS_ctx.page);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "activities-container" }));
if (__VLS_ctx.activityStore.loading.value) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "loading" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
else if (__VLS_ctx.activityStore.error.value) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "error" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.activityStore.error.value);
}
else if (__VLS_ctx.activityStore.activities.value.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "empty-state" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign({ class: "btn" }));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "activities-list" }));
    var _loop_1 = function (activity) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ key: (activity.id) }, { class: "activity-card card" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(__VLS_ctx.activityStore.loading.value))
                    return;
                if (!!(__VLS_ctx.activityStore.error.value))
                    return;
                if (!!(__VLS_ctx.activityStore.activities.value.length === 0))
                    return;
                __VLS_ctx.activityStore.deleteActivity(activity.id);
            } }, { class: "delete-button" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "user-info" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img, __VLS_intrinsicElements.img)(__assign({ src: (activity.user.avatar), alt: (activity.user.name) }, { class: "user-avatar" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)(__assign({ class: "user-name" }));
        (activity.user.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "activity-date" }));
        (__VLS_ctx.activityStore.formatDate(activity.date));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "activity-content" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)(__assign({ class: "activity-title" }));
        (activity.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "activity-description" }));
        (activity.description);
        if (activity.image) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "activity-image-container" }));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img, __VLS_intrinsicElements.img)(__assign({ src: (activity.image), alt: (activity.title) }, { class: "activity-image" }));
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "activity-metrics" }));
        for (var _b = 0, _c = __VLS_getVForSourceType((activity.metrics)); _b < _c.length; _b++) {
            var _d = _c[_b], value = _d[0], key = _d[1];
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ key: (key) }, { class: "metric" }));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "metric-value" }));
            (value);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "metric-label" }));
            (key);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "activity-engagement" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "engagement-stats" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (activity.likes);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (activity.comments);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "engagement-actions" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(__VLS_ctx.activityStore.loading.value))
                    return;
                if (!!(__VLS_ctx.activityStore.error.value))
                    return;
                if (!!(__VLS_ctx.activityStore.activities.value.length === 0))
                    return;
                __VLS_ctx.activityStore.likeActivity(activity.id);
            } }, { class: "engagement-btn" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign({ class: "engagement-btn" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign({ class: "btn-small" }));
    };
    for (var _i = 0, _a = __VLS_getVForSourceType((__VLS_ctx.activityStore.activities.value)); _i < _a.length; _i++) {
        var activity = _a[_i][0];
        _loop_1(activity);
    }
}
/** @type {__VLS_StyleScopedClasses['title']} */ ;
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
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            activityStore: activityStore_1.activityStore,
            page: page,
        };
    },
});
exports.default = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
