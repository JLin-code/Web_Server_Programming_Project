import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Add default error handler for Supabase auth events
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    console.log('User signed out from Supabase');
  } else if (event === 'SIGNED_IN') {
    console.log('User signed in to Supabase');
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('Supabase token refreshed');
  }
});
