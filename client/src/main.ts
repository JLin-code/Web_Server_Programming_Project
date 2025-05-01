import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './assets/main.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

// Add global error handler
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global error caught:', { message, source, lineno, colno, error });
  return false;
};

// Create and mount the app with error handling
const app = createApp(App);

app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error handler:', err);
  console.error('Error details:', { instance, info });
};

app.use(router);

// Mount with console logging for debugging
console.log('Mounting Vue application...');
app.mount('#app');
console.log('Vue application mounted');
