import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './assets/main.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

// Create app instance
const app = createApp(App)

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Error info:', info)
  // You might want to report this to a service or display a fallback UI
}

// Use router
app.use(router)

// Mount the app
app.mount('#app')
