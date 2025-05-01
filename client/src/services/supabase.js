import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.')
}

// Create a custom Supabase client
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
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
)

// Also export as default for flexibility
export default supabase;

// Test connection
async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection from client...')
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('❌ Supabase connection failed:', error)
      return false
    }
    
    console.log('✅ Supabase connection successful:', data)
    return true
  } catch (err) {
    console.error('❌ Supabase connection error:', err)
    return false
  }
}

// Run test immediately
testSupabaseConnection()

// User methods using Supabase
export const supabaseUsers = {
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
    
    if (error) {
      console.error('Error fetching users:', error)
      throw error
    }
    
    return { items: data, total: data.length }
  },
  
  async getById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching user:', error)
      throw error
    }
    
    return data
  }
}
