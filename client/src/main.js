import './assets/main.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import { supabase } from './services/supabase';
import { checkSupabaseConnection } from './utils/networkDiagnostics';

const app = createApp(App);

checkSupabaseConnection(supabase).then(status => {
  if (status.reachable) {
    console.log('✅ Supabase connection established successfully!');
  } else {
    console.error('❌ Failed to connect to Supabase:', status.error);
    console.warn('The app will use mock data as a fallback.');
  }
});

app.use(router);
app.mount('#app');
//# sourceMappingURL=main.js.map