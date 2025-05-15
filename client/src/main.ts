import "./assets/main.css";
import { createApp } from "vue";
import { createPinia } from "pinia"; // Pinia is the official state management library for Vue
import App from "./App.vue";
import router from "./router";
import Oruga from '@oruga-ui/oruga-next';
import Buefy from "buefy";

// Create the Vue application instance
const app = createApp(App);

// Initialize Pinia for state management across components
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(Buefy, {defaultIconPack: 'fas',})
app.use(Oruga);

app.mount("#app");
