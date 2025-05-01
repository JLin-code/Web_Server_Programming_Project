import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { userStore } from './stores/userStore'

import './assets/main.css'

// Create Vue app
const app = createApp(App)

// Initialize the user store before mounting the app
userStore.initializeStore().finally(() => {
  // Use router
  app.use(router)
  
  // Mount app
  app.mount('#app')
})
