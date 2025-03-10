"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityStore = void 0;
var vue_1 = require("vue");
// Create a reactive array to store activities
var activities = (0, vue_1.ref)([]);
var loading = (0, vue_1.ref)(true);
var error = (0, vue_1.ref)('');
// Initialize with mock data
var initializeActivities = function () {
    setTimeout(function () {
        activities.value = [
            {
                id: 1,
                user: {
                    id: 102,
                    name: "Major Major",
                    avatar: 'https://i.pravatar.cc/150?img=33'
                },
                type: 'workout',
                title: 'Morning Run',
                description: 'Started the day with a refreshing 5K run',
                date: '2023-11-12T07:30:00',
                metrics: { distance: '5km', time: '28min', pace: '5:36/km' },
                likes: 28,
                comments: 2,
                image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            },
            {
                id: 2,
                user: {
                    id: 102,
                    name: "John Doe",
                    avatar: 'https://i.pravatar.cc/150?img=52'
                },
                type: 'goal',
                title: 'Monthly Fitness Goal',
                description: 'On track to complete my monthly fitness goal!',
                date: '2023-11-10T12:45:00',
                metrics: { completion: '75%', daysLeft: 8 },
                likes: 8,
                comments: 3,
                image: null
            },
            {
                id: 3,
                user: {
                    id: 102,
                    name: "Jane Smith",
                    avatar: 'https://i.pravatar.cc/150?img=5'
                },
                type: 'normal',
                title: 'Personal Reflection',
                description: 'Was able to reflect on what I am grateful for today',
                date: '2023-11-08T18:20:00',
                metrics: { duration: '30 minutes', focus: 'Mindfulness' },
                likes: 13,
                comments: 5,
                image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
            {
                id: 4,
                user: {
                    id: 102,
                    name: "Laura Green",
                    avatar: 'https://i.pravatar.cc/150?img=23'
                },
                type: 'achievement',
                title: 'New Weight Record',
                description: 'Set a new personal record for weight lifting today!',
                date: '2023-11-09T16:45:00',
                metrics: { weight: '225 lbs', reps: '10 reps', sets: '3 sets' },
                likes: 32,
                comments: 6,
                image: "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?q=80&w=1988&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            },
            {
                id: 5,
                user: {
                    id: 102,
                    name: "Major Major",
                    avatar: 'https://i.pravatar.cc/150?img=33'
                },
                type: 'workout',
                title: 'Cycling Session',
                description: 'Completed a 20-mile cycling session along the coastal route',
                date: '2023-11-07T15:20:00',
                metrics: { distance: '20mi', time: '1h 15min', elevation: '320ft' },
                likes: 15,
                comments: 4,
                image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3'
            },
            {
                id: 6,
                user: {
                    id: 106,
                    name: "Jane Smith",
                    avatar: 'https://i.pravatar.cc/150?img=5'
                },
                type: 'workout',
                title: 'Mountain Hike',
                description: 'Spent the afternoon hiking up Sunset Peak — breathtaking views at the top!',
                date: '2023-11-16T14:30:00',
                metrics: { distance: '8km', time: '3h', elevation: '2,000ft' },
                likes: 64,
                comments: 4,
                image: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3'
            },
            {
                id: 7,
                user: {
                    id: 104,
                    name: "John Doe",
                    avatar: 'https://i.pravatar.cc/150?img=52'
                },
                type: 'achievement',
                title: '5K Swim Milestone',
                description: 'Proud to have completed my first 5K swim without stopping!',
                date: '2023-11-14T08:00:00',
                metrics: { distance: '5km', time: '1h 30min', strokes: 'Freestyle' },
                likes: 30,
                comments: 5,
                image: 'https://plus.unsplash.com/premium_photo-1663089983823-b69bb7ccd4f6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            },
        ];
        loading.value = false;
    }, 500);
};
// Actions
var deleteActivity = function (id) {
    activities.value = activities.value.filter(function (a) { return a.id !== id; });
};
var likeActivity = function (id) {
    var activity = activities.value.find(function (a) { return a.id === id; });
    if (activity) {
        activity.likes++;
    }
};
// Format date helper
var formatDate = function (dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
exports.activityStore = {
    activities: activities,
    loading: loading,
    error: error,
    initializeActivities: initializeActivities,
    deleteActivity: deleteActivity,
    likeActivity: likeActivity,
    formatDate: formatDate
};
