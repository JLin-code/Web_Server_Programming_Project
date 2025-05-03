require('dotenv').config();
const dns = require('dns');
const { promisify } = require('util');
const resolveDns = promisify(dns.resolve);
const fetch = require('node-fetch');

// Get Supabase URL from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('=============================================');
console.log('🔍 SUPABASE URL VALIDATOR');
console.log('=============================================');

// Function to validate URL
function validateUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return {
      valid: true,
      protocol: parsedUrl.protocol,
      hostname: parsedUrl.hostname,
      pathname: parsedUrl.pathname,
      url: parsedUrl.toString()
    };
  } catch (err) {
    return {
      valid: false,
      error: err.message
    };
  }
}

// Check standard Supabase URL pattern
function checkUrlPattern(url) {
  // Extract hostname
  let hostname;
  try {
    hostname = new URL(url).hostname;
  } catch (err) {
    return {
      valid: false,
      message: `Invalid URL format: ${err.message}`,
      suggestedFix: null
    };
  }
  
  // Check standard Supabase pattern
  if (!hostname.endsWith('.supabase.co')) {
    return {
      valid: false,
      message: 'URL does not match standard Supabase pattern',
      suggestedFix: `The hostname should end with '.supabase.co'`
    };
  }
  
  // Extract project ID
  const projectId = hostname.split('.')[0];
  
  if (!projectId || projectId.length < 5) {
    return {
      valid: false,
      message: 'Project ID looks too short or invalid',
      suggestedFix: null
    };
  }
  
  return {
    valid: true,
    message: 'URL matches standard Supabase pattern',
    projectId: projectId
  };
}

// Test all possible URL variants
async function testUrlVariants(baseUrl) {
  console.log('\nTrying different URL variants to find working endpoint:');
  
  // Remove trailing slash if exists
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  
  const variants = [
    cleanBaseUrl,
    `${cleanBaseUrl}/rest/v1`,
    `${cleanBaseUrl}/auth/v1`,
    `${cleanBaseUrl}/storage/v1`,
    `${cleanBaseUrl}/functions/v1`,
  ];
  
  const results = [];
  
  for (const url of variants) {
    try {
      console.log(`Testing: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: SUPABASE_KEY ? {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        } : {}
      });
      
      results.push({
        url,
        status: response.status,
        statusText: response.statusText,
        working: response.status !== 404
      });
      
      console.log(`  Status: ${response.status} ${response.statusText}`);
      
      // If we get a non-404, this might be a valid endpoint
      if (response.status !== 404) {
        console.log(`  ✅ Got response! This appears to be a valid endpoint`);
      }
      
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
      results.push({
        url,
        error: err.message,
        working: false
      });
    }
  }
  
  // Find any working URLs
  const workingUrls = results.filter(r => r.working);
  
  return {
    tested: variants.length,
    working: workingUrls.length,
    results,
    workingUrls
  };
}

async function main() {
  // Check if URL is provided
  if (!SUPABASE_URL) {
    console.error('❌ No Supabase URL found in environment variables');
    console.error('Please set SUPABASE_URL or VITE_SUPABASE_URL in your .env file');
    return;
  }
  
  console.log(`Checking URL: ${SUPABASE_URL}`);
  
  // Step 1: Validate basic URL format
  const urlInfo = validateUrl(SUPABASE_URL);
  
  if (!urlInfo.valid) {
    console.error(`❌ Invalid URL format: ${urlInfo.error}`);
    console.error('A valid URL should start with http:// or https:// and include a domain name');
    console.error('Example: https://your-project-id.supabase.co');
    return;
  }
  
  console.log('✅ URL format is valid');
  console.log('- Protocol: ' + urlInfo.protocol);
  console.log('- Hostname: ' + urlInfo.hostname);
  console.log('- Path: ' + urlInfo.pathname);
  
  // Step 2: Check if URL matches Supabase pattern
  const patternCheck = checkUrlPattern(SUPABASE_URL);
  if (!patternCheck.valid) {
    console.warn(`⚠️ Warning: ${patternCheck.message}`);
    if (patternCheck.suggestedFix) {
      console.warn(`Suggestion: ${patternCheck.suggestedFix}`);
    }
    console.warn('Standard Supabase URL format is: https://your-project-id.supabase.co');
  } else {
    console.log(`✅ URL matches Supabase pattern (Project ID: ${patternCheck.projectId})`);
  }
  
  // Step 3: Test DNS resolution
  try {
    console.log('\nTesting DNS resolution...');
    const ipAddresses = await resolveDns(urlInfo.hostname);
    console.log(`✅ DNS resolution successful`);
    console.log(`- IP addresses: ${ipAddresses.join(', ')}`);
  } catch (err) {
    console.error(`❌ DNS resolution failed: ${err.message}`);
    console.error('This means the hostname does not exist or cannot be resolved');
    console.error('Possible causes:');
    console.error('1. The project ID in the URL is incorrect');
    console.error('2. The Supabase project has been deleted');
    console.error('3. DNS resolution is blocked on your network');
    return;
  }
  
  // Step 4: Test different URL variants to find valid endpoints
  const variantsResult = await testUrlVariants(SUPABASE_URL);
  
  console.log('\n=============================================');
  console.log('RESULTS SUMMARY');
  console.log('=============================================');
  console.log(`URL tested: ${SUPABASE_URL}`);
  console.log(`Basic URL format: ${urlInfo.valid ? '✅ Valid' : '❌ Invalid'}`);
  console.log(`Matches Supabase pattern: ${patternCheck.valid ? '✅ Yes' : '⚠️ No'}`);
  console.log(`DNS resolution: ✅ Successful`);
  console.log(`Endpoints tested: ${variantsResult.tested}`);
  console.log(`Working endpoints: ${variantsResult.working}`);
  
  if (variantsResult.working > 0) {
    console.log('\n✅ WORKING ENDPOINTS:');
    variantsResult.workingUrls.forEach(item => {
      console.log(`- ${item.url} (Status: ${item.status} ${item.statusText})`);
    });
    
    if (variantsResult.workingUrls.some(item => item.url.includes('/rest/v1'))) {
      console.log('\n✅ REST API endpoint is working!');
      console.log('Your client should be able to connect to Supabase properly');
    } else {
      console.log('\n⚠️ REST API endpoint (/rest/v1) not confirmed as working');
      console.log('This might cause issues with database interactions');
    }
  } else {
    console.log('\n❌ No working endpoints found');
    console.log('RECOMMENDATIONS:');
    console.log('1. Double check your project ID in the URL');
    console.log('2. Verify your project is active in the Supabase dashboard');
    console.log('3. Try with a new API key from the dashboard');
    console.log('4. Check if your IP address is allowed in project settings');
  }
  
  // Final recommendations
  console.log('\nRECOMMENDATIONS:');
  console.log('1. Verify the URL in your .env matches exactly with the URL from your Supabase dashboard');
  console.log('2. Make sure your project is not paused or disabled');
  console.log('3. Check that your API key has not expired or been revoked');
  
  if (SUPABASE_URL.endsWith('/')) {
    console.log('\n⚠️ WARNING: Your URL ends with a trailing slash, which might cause issues');
    console.log(`Consider changing it to: ${SUPABASE_URL.replace(/\/$/, '')}`);
  }
}

main().catch(err => {
  console.error('Unexpected error:', err);
});
