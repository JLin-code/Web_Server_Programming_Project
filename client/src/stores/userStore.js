import { ref } from 'vue';
// Create a reactive state
const currentUser = ref(null);
const isAuthenticated = ref(false);
const error = ref('');
// Export the store
export const userStore = {
    currentUser,
    isAuthenticated,
    error,
    // Add more methods as needed
    setCurrentUser(user) {
        currentUser.value = user;
        isAuthenticated.value = !!user;
    },
    clearUser() {
        currentUser.value = null;
        isAuthenticated.value = false;
    }
};
//# sourceMappingURL=userStore.js.map