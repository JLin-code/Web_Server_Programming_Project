import { createClient } from '@supabase/supabase-js';

// Define types
export interface SupabaseUser {
  email: string;
  id?: string;
}

export interface SupabaseSession {
  user: SupabaseUser;
}

export interface SupabaseAuthResponse {
  data: {
    session: SupabaseSession | null;
    user: SupabaseUser | null;
  };
  error: SupabaseError | null;
}

export interface SupabaseError {
  message: string;
  details?: unknown;
}

export interface SupabaseQueryResponse<T> {
  data: T | null;
  error: SupabaseError | null;
}

// Initialize Supabase client with environment variables and fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://chuhfxkepvakwgmhiuep.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-key';

console.log('Supabase Client Configuration:');
console.log(`- URL defined: ${!!supabaseUrl}`);
console.log(`- KEY defined: ${!!supabaseAnonKey}`);
console.log(`- URL: ${supabaseUrl}`);
console.log(`- KEY: ${supabaseAnonKey ? '***' + supabaseAnonKey.substring(supabaseAnonKey.length-5) : 'undefined'}`);

// Create a custom Supabase client with error handling
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    },
    global: {
      headers: {
        'x-application-name': 'fitness-tracker-client'
      },
    }
  }
);

// Also export as default for flexibility
export default supabase;

// Test connection with better error handling
async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection from client...');
    const startTime = performance.now();
    const { data, error } = await supabase.from('users').select('count').limit(1);
    const duration = performance.now() - startTime;
    
    if (error) {
      console.error(`❌ Supabase connection failed (${duration.toFixed(2)}ms):`, error);
      console.error('Please check your .env file and make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly.');
      return false;
    }
    
    console.log(`✅ Supabase connection successful (${duration.toFixed(2)}ms):`, data);
    return true;
  } catch (err) {
    console.error('❌ Critical Supabase connection error:', err);
    console.error('This could indicate network issues or invalid credentials.');
    return false;
  }
}

// Run test immediately
testSupabaseConnection();

// User methods using Supabase
export const supabaseUsers = {
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
    
    return { items: data, total: data.length };
  },
  
  async getById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
    
    return data;
  },
  
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, 
        first_name, 
        last_name, 
        email, 
        role, 
        created_at
      `)
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
    
    return data;
  }
};
