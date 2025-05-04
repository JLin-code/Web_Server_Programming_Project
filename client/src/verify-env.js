/**
 * Client Environment Variable Checker
 * 
 * This script checks if the client-side environment variables are correctly set
 */

// Define the required environment variables for the client
const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

// Function to check client environment
function checkClientEnvironment() {
  console.log('=== CLIENT ENVIRONMENT VARIABLE CHECK ===\n');
  
  let allPassed = true;
  
  // Check each required variable
  requiredVars.forEach(varName => {
    const value = import.meta.env[varName];
    
    if (!value) {
      console.error(`❌ Missing required environment variable: ${varName}`);
      allPassed = false;
      console.log(`   - This should be defined in your .env file in the client directory`);
    } else {
      const maskedValue = varName.includes('KEY') ? 
        `${value.substring(0, 8)}...${value.substring(value.length - 4)}` : 
        value;
      
      console.log(`✅ ${varName} is set: ${maskedValue}`);
    }
  });
  
  console.log('\n=== SUMMARY ===');
  
  if (allPassed) {
    console.log('✅ All required environment variables are set');
    console.log('Client should be able to connect to Supabase');
  } else {
    console.error('❌ Some environment variables are missing');
    console.error('The client will not be able to connect to Supabase without these');
    console.error('Please check your .env file in the client directory');
  }
}

// Run the check
checkClientEnvironment();

// Export for use in other files
export { checkClientEnvironment };
