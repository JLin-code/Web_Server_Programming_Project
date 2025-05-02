import "./assets/main.css";
import { createApp } from "vue";
import { createPinia } from "pinia"; // Pinia is the official state management library for Vue
import App from "./App.vue";
import router from "./router";

// Create the Vue application instance
const app = createApp(App);

// Initialize Pinia for state management across components
const pinia = createPinia();
app.use(pinia);
app.use(router);

app.mount("#app");
