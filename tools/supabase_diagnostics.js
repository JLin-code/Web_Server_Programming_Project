require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dns = require('dns');
const { promisify } = require('util');
const resolveDns = promisify(dns.resolve);

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const LOG_FILE = path.join(__dirname, '../logs/supabase-diagnostic.log');

// Create logs directory if it doesn't exist
if (!fs.existsSync(path.dirname(LOG_FILE))) {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
}

// Set up logging
function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${message}`;
  
  console[isError ? 'error' : 'log'](formattedMessage);
  
  // Also log to file
  fs.appendFileSync(LOG_FILE, formattedMessage + '\n');
}

console.log('=============================================');
console.log('🔍 SUPABASE CONNECTION DIAGNOSTIC TOOL');
console.log('=============================================');

// Check environment variables
log('\n📋 Environment Variables Check:');
log(`SUPABASE_URL: ${SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
log(`SUPABASE_KEY: ${SUPABASE_KEY ? '✅ Set (length: ' + SUPABASE_KEY.length + ')' : '❌ Missing'}`);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  log('❌ Cannot proceed: Missing Supabase credentials', true);
  log('Please check your .env file and ensure both SUPABASE_URL and SUPABASE_KEY are properly set.', true);
  process.exit(1);
}

// Validate URL format
function validateUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return {
      valid: true,
      protocol: parsedUrl.protocol,
      hostname: parsedUrl.hostname,
      pathname: parsedUrl.pathname,
      url: parsedUrl.href
    };
  } catch (err) {
    return {
      valid: false,
      error: err.message
    };
  }
}

// Create Supabase client with improved options
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
  global: { 
    fetch: (url, options) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      
      return fetch(url, { 
        ...options, 
        signal: controller.signal,
        headers: {
          ...options.headers,
          'User-Agent': 'Supabase-Diagnostic-Tool/1.0'
        }
      })
        .then(response => {
          clearTimeout(timeout);
          return response;
        })
        .catch(error => {
          clearTimeout(timeout);
          throw error;
        });
    }
  }
});

// Test DNS resolution
async function testDnsResolution() {
  log('\n🔄 Testing DNS resolution...');
  
  try {
    const urlInfo = validateUrl(SUPABASE_URL);
    
    if (!urlInfo.valid) {
      log(`❌ Invalid URL format: ${urlInfo.error}`, true);
      return false;
    }
    
    log(`URL Components:`);
    log(`- Protocol: ${urlInfo.protocol}`);
    log(`- Hostname: ${urlInfo.hostname}`);
    log(`- Path: ${urlInfo.pathname}`);
    
    const startTime = Date.now();
    const dnsResult = await resolveDns(urlInfo.hostname);
    const duration = Date.now() - startTime;
    
    log(`✅ DNS resolution successful (${duration}ms)`);
    log(`- IP addresses: ${dnsResult.join(', ')}`);
    
    return true;
  } catch (err) {
    log(`❌ DNS resolution failed: ${err.message}`, true);
    log('This indicates a problem with the hostname in your Supabase URL', true);
    return false;
  }
}

// Test network connectivity to Supabase domain with improved tests
async function testNetworkConnectivity() {
  log('\n🔄 Testing network connectivity to Supabase domain...');
  
  try {
    // First validate the URL format
    const urlInfo = validateUrl(SUPABASE_URL);
    if (!urlInfo.valid) {
      log(`❌ Invalid Supabase URL format: ${urlInfo.error}`, true);
      log('Please check your SUPABASE_URL in the .env file', true);
      return false;
    }
    
    // Extract just the hostname part
    const supabaseDomain = urlInfo.hostname;
    
    // Test basic connection to the domain root
    const startTime = Date.now();
    
    // Try direct API endpoint format that should work for Supabase
    const apiTestUrl = `${SUPABASE_URL}/rest/v1/`;
    log(`Testing API endpoint at: ${apiTestUrl}`);
    
    const response = await fetch(apiTestUrl, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    const duration = Date.now() - startTime;
    
    if (response.status === 404) {
      log(`⚠️ Got 404 response (${duration}ms) but this may be expected for the root endpoint`, false);
      log(`Status: ${response.status} ${response.statusText}`);
      
      // Continue with additional specific endpoint test
      log('\n🔄 Testing specific Supabase API endpoint...');
      const healthCheckUrl = `${SUPABASE_URL}/rest/v1/healthcheck`;
      const healthResponse = await fetch(healthCheckUrl, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      
      if (healthResponse.ok) {
        log(`✅ API endpoint test successful: ${healthResponse.status} ${healthResponse.statusText}`);
        return true;
      } else {
        log(`❌ API endpoint test failed: ${healthResponse.status} ${healthResponse.statusText}`, true);
        if (healthResponse.status === 401) {
          log('Authentication error - your API key may be incorrect or expired', true);
        }
      }
    } else if (response.ok) {
      log(`✅ Network connectivity test successful (${duration}ms)`);
      log(`Response status: ${response.status} ${response.statusText}`);
      return true;
    } else {
      log(`⚠️ Network connectivity test returned status ${response.status} (${duration}ms)`, true);
      log(`Response status: ${response.status} ${response.statusText}`);
      
      if (response.status === 401) {
        log('Authentication error - your API key may be incorrect or expired', true);
      } else if (response.status === 403) {
        log('Permission denied - check if your API key has the proper permissions', true);
      } else if (response.status >= 500) {
        log('Server error - the Supabase service may be experiencing issues', true);
      }
    }
    
    // Check if the URL ends with .supabase.co
    if (!supabaseDomain.endsWith('.supabase.co')) {
      log('⚠️ Warning: Your Supabase URL does not end with .supabase.co', true);
      log('Standard Supabase URLs should look like: https://your-project-id.supabase.co', true);
    }
    
    return false;
  } catch (err) {
    log(`❌ Network connectivity error: ${err.message}`, true);
    
    log('\n🔧 TROUBLESHOOTING SUGGESTIONS:');
    log('1. Check if your internet connection is working');
    log('2. Verify if any firewall or VPN is blocking outgoing connections');
    log('3. Check if the Supabase service is down (visit status.supabase.com)');
    log('4. Confirm your SUPABASE_URL is correct');
    
    if (err.code === 'ENOTFOUND') {
      log('\n🔍 SPECIFIC ERROR: Domain name not found');
      log('The domain in your SUPABASE_URL does not exist or cannot be resolved.');
      log(`Current URL: ${SUPABASE_URL}`);
      log('Make sure your project ID is correct in the URL.');
    }
    
    return false;
  }
}

// Test direct connection to Supabase
async function testConnection() {
  log('\n🔄 Testing direct Supabase connection...');
  
  try {
    const startTime = Date.now();
    const { data, error } = await supabase.from('users').select('count');
    const duration = Date.now() - startTime;
    
    if (error) {
      log(`❌ Supabase connection failed (${duration}ms):`, true);
      log(`   Error: ${error.message}`, true);
      log(`   Code: ${error.code}`, true);
      
      // Additional checks for specific error codes
      if (error.code === 'PGRST301') {
        log('This error indicates the database resource was not found', true);
        log('Check if your Supabase project URL is correct', true);
      } else if (error.code === 'PGRST401') {
        log('This error indicates authentication failure', true);
        log('Check if your Supabase anon key is correct and not expired', true);
      }
      
      return false;
    }
    
    log(`✅ Supabase connection successful (${duration}ms)`);
    log(`   Response: ${JSON.stringify(data)}`);
    
    return true;
  } catch (err) {
    log(`❌ Supabase connection error: ${err.message}`, true);
    return false;
  }
}

// Test if SQL functions can be created
async function testSqlFunctionCreation() {
  log('\n🔄 Testing if SQL functions can be created...');
  
  try {
    // Create a simple test function 
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION test_diagnostic_function()
        RETURNS boolean
        LANGUAGE sql
        AS $$
          SELECT true;
        $$;
      `
    });
    
    if (error) {
      if (error.code === '42883') {
        log('❌ The exec_sql function does not exist in your database', true);
        log('Your account may not have SQL execution privileges', true);
        return false;
      }
      
      log(`❌ Error creating test function: ${error.message}`, true);
      log(`Code: ${error.code}`, true);
      return false;
    }
    
    log(`✅ Test function creation successful`);
    return true;
    
  } catch (err) {
    log(`❌ Function creation error: ${err.message}`, true);
    if (err.message.includes('permission denied')) {
      log('Your API key does not have permission to create functions', true);
      log('This is expected if you are using the anon key - you would need service_role key to run the setup script', true);
    }
    return false;
  }
}

// Check client configuration files
async function checkClientConfigFiles() {
  log('\n🔄 Checking client configuration files...');
  const clientEnvPath = path.join(__dirname, '../client/.env');
  const clientEnvExamplePath = path.join(__dirname, '../client/.env.example');
  
  if (fs.existsSync(clientEnvPath)) {
    log(`✅ Client .env file exists`);
    const content = fs.readFileSync(clientEnvPath, 'utf8');
    
    // Check for required variables without exposing values
    const hasSupabaseUrl = content.includes('VITE_SUPABASE_URL');
    const hasSupabaseKey = content.includes('VITE_SUPABASE_ANON_KEY');
    
    log(`   VITE_SUPABASE_URL: ${hasSupabaseUrl ? '✅ Defined' : '❌ Missing'}`);
    log(`   VITE_SUPABASE_ANON_KEY: ${hasSupabaseKey ? '✅ Defined' : '❌ Missing'}`);
    
    if (!hasSupabaseUrl || !hasSupabaseKey) {
      log('❌ Client .env file is missing required variables', true);
      return false;
    }
  } else {
    log(`❌ Client .env file doesn't exist`, true);
    
    if (fs.existsSync(clientEnvExamplePath)) {
      log('   TIP: Copy .env.example to .env and fill in the required values');
    }
    
    return false;
  }
  
  return true;
}

// Test Supabase schema match with our SQL
async function testSchemaValidation() {
  log('\n🔄 Validating database schema...');
  
  try {
    // Test if tables exist
    const requiredTables = ['users', 'activities', 'activity_comments', 'activity_likes', 'friends'];
    const { data: tableData, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', requiredTables);
    
    if (tableError) {
      log(`❌ Schema validation error: ${tableError.message}`, true);
      return false;
    }
    
    const existingTables = tableData.map(t => t.table_name);
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));
    
    if (missingTables.length > 0) {
      log(`❌ Missing tables: ${missingTables.join(', ')}`, true);
      return false;
    }
    
    log(`✅ All required tables exist: ${requiredTables.join(', ')}`);
    
    // Test if functions exist
    const requiredFunctions = [
      'increment_comment_count', 
      'increment_like_count',
      'get_user_statistics',
      'get_user_activity_by_period',
      'get_user_statistics_with_periods',
      'get_global_statistics',
      'get_global_statistics_with_periods'
    ];
    
    const { data: functionData, error: functionError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_schema', 'public')
      .in('routine_name', requiredFunctions);
    
    if (functionError) {
      log(`❌ Function validation error: ${functionError.message}`, true);
      return false;
    }
    
    const existingFunctions = functionData.map(f => f.routine_name);
    const missingFunctions = requiredFunctions.filter(f => !existingFunctions.includes(f));
    
    if (missingFunctions.length > 0) {
      log(`❌ Missing functions: ${missingFunctions.join(', ')}`, true);
      return false;
    }
    
    log(`✅ All required functions exist: ${requiredFunctions.join(', ')}`);
    return true;
    
  } catch (err) {
    log(`❌ Schema validation critical error: ${err.message}`, true);
    return false;
  }
}

// Test RPC functions
async function testRpcFunctions() {
  log('\n🔄 Testing Supabase RPC functions...');
  
  try {
    const { data, error } = await supabase.rpc('get_global_statistics');
    
    if (error) {
      log(`❌ RPC function test failed:`, true);
      log(`   Error: ${error.message}`, true);
      log(`   Code: ${error.code}`, true);
      return false;
    }
    
    log(`✅ RPC functions working properly`);
    log(`   Sample response: ${JSON.stringify(data).substring(0, 200)}...`);
    
    return true;
  } catch (err) {
    log(`❌ RPC function test error: ${err.message}`, true);
    return false;
  }
}

// Run all tests
async function runDiagnostics() {
  let dnsOk = false;
  let networkOk = false;
  let connectionOk = false;
  let schemaOk = false;
  let rpcOk = false;
  let clientConfigOk = false;
  let sqlExecutionOk = false;
  
  try {
    // Check URL format first
    const urlInfo = validateUrl(SUPABASE_URL);
    if (!urlInfo.valid) {
      log(`❌ Invalid Supabase URL format: ${urlInfo.error}`, true);
      log(`Current URL: ${SUPABASE_URL}`, true);
      log('A valid Supabase URL should look like: https://your-project-id.supabase.co', true);
    } else {
      log(`✅ Supabase URL format is valid: ${urlInfo.url}`);
      
      // Begin with DNS test
      dnsOk = await testDnsResolution();
      
      if (dnsOk) {
        networkOk = await testNetworkConnectivity();
        
        if (networkOk) {
          connectionOk = await testConnection();
          
          if (connectionOk) {
            schemaOk = await testSchemaValidation();
            rpcOk = await testRpcFunctions();
          }
          
          // Try SQL execution test
          sqlExecutionOk = await testSqlFunctionCreation();
        }
      }
    }
    
    clientConfigOk = await checkClientConfigFiles();
    
    // Summary
    log('\n=============================================');
    log('📊 DIAGNOSTIC RESULTS SUMMARY');
    log('=============================================');
    log(`URL Format: ${urlInfo?.valid ? '✅ VALID' : '❌ INVALID'}`);
    log(`DNS Resolution: ${dnsOk ? '✅ WORKING' : '❌ FAILED'}`);
    log(`Network Connectivity: ${networkOk ? '✅ WORKING' : '❌ FAILED'}`);
    log(`Supabase Connection: ${connectionOk ? '✅ WORKING' : '❌ FAILED'}`);
    log(`Schema Validation: ${schemaOk ? '✅ WORKING' : '❌ FAILED'}`);
    log(`RPC Functions: ${rpcOk ? '✅ WORKING' : '❌ FAILED'}`);
    log(`SQL Execution: ${sqlExecutionOk ? '✅ WORKING' : '❌ FAILED'}`);
    log(`Client Config: ${clientConfigOk ? '✅ WORKING' : '❌ FAILED'}`);
    
    // Provide troubleshooting recommendations
    if (!urlInfo?.valid || !dnsOk || !networkOk || !connectionOk || !schemaOk || !rpcOk || !clientConfigOk) {
      log('\n🔧 TROUBLESHOOTING RECOMMENDATIONS:', true);
      
      if (!urlInfo?.valid) {
        log('• URL format issues detected:', true);
        log('  1. Check your SUPABASE_URL environment variable', true);
        log('  2. It should look like: https://your-project-id.supabase.co', true);
        log('  3. Make sure to include the https:// protocol', true);
        log(`  4. Current URL: ${SUPABASE_URL}`, true);
      }
      
      if (!dnsOk && urlInfo?.valid) {
        log('• DNS resolution issues detected:', true);
        log('  1. The hostname in your Supabase URL could not be resolved', true);
        log('  2. Check if the project ID in the URL is correct', true);
        log('  3. Verify that your Supabase project has not been deleted', true);
        log('  4. Check if you can access the Supabase dashboard for this project', true);
      }
      
      if (!networkOk && dnsOk) {
        log('• Network connectivity issues detected:', true);
        log('  1. Your device can resolve the Supabase hostname but cannot connect', true);
        log('  2. Check your internet connection', true);
        log('  3. Verify no firewalls or proxies are blocking access', true);
        log('  4. Check if Supabase is down: https://status.supabase.com', true);
      }
      
      if (!connectionOk && networkOk) {
        log('• Supabase connection issues detected:', true);
        log('  1. Network is working but the Supabase client cannot connect', true);
        log('  2. Verify SUPABASE_KEY is correct (check in Supabase dashboard)', true);
        log('  3. Make sure your Supabase project is active and not paused', true);
        log('  4. Try generating a new API key in the Supabase dashboard', true);
      }
      
      if (!schemaOk && connectionOk) {
        log('• Schema issues detected:', true);
        log('  1. Connection works but required tables/functions are missing', true);
        log('  2. You need to run the setup SQL script to create the schema', true);
        log('  3. Use the SUPABASE_KEY with service_role permissions to run the setup', true);
        log('  4. Command: npm run supabase:setup', true);
      }
      
      if (!clientConfigOk) {
        log('• Client configuration issues detected:', true);
        log('  1. Make sure client/.env file exists with proper variables', true);
        log('  2. Copy from client/.env.example if needed', true);
        log('  3. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set', true);
      }
      
      // Specific recommendations for 404 error
      if (networkOk === false) {
        log('\n🛠 SPECIFIC RECOMMENDATIONS FOR 404 ERROR:', true);
        log('  1. Your URL might be incorrect - compare with Supabase dashboard', true);
        log('  2. Ensure the URL has no trailing slash', true);
        log('  3. Make sure the URL includes "/rest/v1" if testing API endpoints directly', true);
        log('  4. Check project status in dashboard - it might be disabled or deleted', true);
        log(`  5. Current URL: ${SUPABASE_URL}`, true);
      }
    }
    
    // Save diagnostics results to file
    const diagnosticsResults = {
      timestamp: new Date().toISOString(),
      urlFormatValid: urlInfo?.valid,
      dnsOk,
      networkOk,
      connectionOk,
      schemaOk,
      rpcOk,
      sqlExecutionOk,
      clientConfigOk,
      supabaseUrl: SUPABASE_URL ? SUPABASE_URL.replace(/^(https?:\/\/[^.]+).*$/, '$1...') : null,
      supabaseKey: SUPABASE_KEY ? '***' : null
    };
    
    fs.writeFileSync(
      path.join(__dirname, '../logs/supabase-diagnostic-results.json'), 
      JSON.stringify(diagnosticsResults, null, 2)
    );
    
    log('\n✏️ Log file saved to: ' + LOG_FILE);
    log('✏️ Results saved to: ' + path.join(__dirname, '../logs/supabase-diagnostic-results.json'));
    
  } catch (error) {
    log(`❌ Unexpected error during diagnostics: ${error.message}`, true);
  }
}

// Run the diagnostics
runDiagnostics().catch(err => {
  log(`Fatal error: ${err.message}`, true);
  process.exit(1);
});
