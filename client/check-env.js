// Simple script to check if environment variables are properly loaded
import { config } from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory name correctly in ESM
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env file
config();

console.log('=== Environment Variables Check ===');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL || 'undefined');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'is set' : 'is NOT set');
console.log('NODE_SUPABASE_URL:', process.env.NODE_SUPABASE_URL || 'undefined');
console.log('NODE_SUPABASE_ANON_KEY:', process.env.NODE_SUPABASE_ANON_KEY ? 'is set' : 'is NOT set');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL || 'undefined');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'is set' : 'is NOT set');
console.log('\nNote: VITE_ prefixed variables are meant for the Vite build system and may not be available in Node.js scripts.');
