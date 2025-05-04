// Simple utility to validate Supabase service role keys
require('dotenv').config();

// Check in all possible environment variables
const possibleKeys = [
  process.env.SUPABASE_SECRET_KEY, 
];

console.log('=== Supabase Key Validation ===');

// Test all potential keys
possibleKeys.forEach((key, index) => {
  if (!key) return;
  
  const keyNames = [
    'SUPABASE_SECRET_KEY', 
  ];
  
  console.log(`\nChecking ${keyNames[index]}:`);
  console.log(`First 15 chars: ${key.substring(0, 15)}...`);
  validateServiceRoleKey(key);
});

// Function to decode and validate JWT token
function validateServiceRoleKey(token) {
  try {
    // Simple JWT parsing (no validation needed here)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('❌ Token does not appear to be in JWT format (should have 3 parts)');
      return false;
    }
    
    const base64Payload = parts[1];
    // Handle base64url format
    const normalized = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    const padded = normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, '=');
    
    const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
    console.log('Decoded payload:', payload);
    
    // Check for proper permissions
    if (payload.role === 'service_role') {
      console.log('✅ Valid service_role key confirmed!');
      return true;
    } else {
      console.log(`❌ Not a service_role key. Found role: "${payload.role || 'none'}"`);
      return false;
    }
  } catch (error) {
    console.log('❌ Error parsing token:', error.message);
    return false;
  }
}

console.log('\n=== Environment Summary ===');
console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? '✓ Defined' : '✗ Missing'}`);
console.log(`SUPABASE_SECRET_KEY: ${process.env.SUPABASE_SECRET_KEY ? '✓ Defined' : '✗ Missing'}`);

// Always run the check and show results, don't exit early
let isValidKey = false;
if (process.env.SUPABASE_SECRET_KEY) {
  try {
    const parts = process.env.SUPABASE_SECRET_KEY.split('.');
    if (parts.length === 3) {
      const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, '=');
      const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
      
      if (payload.role === 'service_role') {
        isValidKey = true;
      }
    }
  } catch (e) {
    // Continue with false if we can't parse the token
  }
}

// Only show warning if key is invalid
if (!isValidKey) {
  console.log("\n⚠️ Supabase Configuration Issues:");
  console.log("  ❌ SUPABASE_SECRET_KEY does not appear to be a service role key");
  console.log("     Service role keys contain \"service_role\" in the JWT payload");
  console.log("     You can get this from Supabase dashboard → Project Settings → API");
  console.log("\nPlease check your .env file and update the configuration.");
} else {
  console.log("\n✅ Supabase Configuration OK");
  console.log("  Secret key has the required service_role permission");
}
