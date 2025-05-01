const { createClient } = require('@supabase/supabase-js');
const { CustomError, statusCodes } = require('./errors');

// Get credentials from environment variables with fallbacks
// NOTE: These fallbacks should only be used for development. For production,
// always use environment variables.
const supabaseUrl = process.env.SUPABASE_URL || 'https://chuhfxkepvakwgmhiuep.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

// Enhanced logging for better debugging
console.log(`Supabase Configuration:`);
console.log(`- URL defined: ${!!supabaseUrl}`);
console.log(`- KEY defined: ${!!supabaseKey}`);
console.log(`- URL length: ${supabaseUrl?.length || 0}`);
console.log(`- KEY format: ${supabaseKey ? supabaseKey.substring(0, 3) + '...' + supabaseKey.substring(supabaseKey.length-3) : 'undefined'}`);

if (!supabaseUrl || !supabaseKey) {
    console.error('⚠️ CRITICAL ERROR: Supabase credentials are missing!');
    console.error('Please ensure SUPABASE_URL and SUPABASE_KEY environment variables are set.');
    console.error('Check your .env file or environment variables configuration.');
    console.error('Create a .env file in your project root with the following content:');
    console.error('SUPABASE_URL=https://chuhfxkepvakwgmhiuep.supabase.co');
    console.error('SUPABASE_KEY=your_anon_key_here');
    console.error('SUPABASE_SERVICE_KEY=your_service_role_key_here (optional, for admin operations)');
}

// Create client with better options and network handling
const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
    auth: {
        autoRefreshToken: true,
        persistSession: true
    },
    global: {
        headers: {
            'x-application-name': 'fitness-tracker'
        },
    },
    db: {
        schema: 'public',
    },
    // Add fetch options with timeout
    fetch: (url, options) => {
        const controller = new AbortController();
        const { signal } = controller;
        
        // Set timeout of 30 seconds to avoid hanging connections
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        return fetch(url, { ...options, signal })
            .then(response => {
                clearTimeout(timeoutId);
                return response;
            })
            .catch(error => {
                clearTimeout(timeoutId);
                console.error('Network request failed:', error.message);
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout: Database connection took too long to respond');
                }
                throw error;
            });
    }
});

// Create a more robust connect function
function connect() {
    if (!supabaseUrl || !supabaseKey) {
        console.error('Database connection failed: Missing credentials');
        throw new CustomError('Database connection credentials are missing', statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    return supabase;
}

// Test connection immediately with more diagnostics
(async function testConnection() {
    try {
        console.log('Testing database connection to Supabase...');
        console.log(`Using Supabase URL: ${supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'undefined'}`);
        console.log(`API Key provided: ${supabaseKey ? 'Yes (length: ' + supabaseKey.length + ')' : 'No'}`);
        
        const start = Date.now();
        
        // First check network connectivity to supabase URL (without auth)
        try {
            const urlObj = new URL(supabaseUrl);
            const pingUrl = `${urlObj.protocol}//${urlObj.host}/ping`;
            console.log(`Checking connectivity to ${pingUrl}...`);
            
            const pingResponse = await fetch(pingUrl, { 
                method: 'GET',
                timeout: 10000 
            });
            console.log(`Ping response status: ${pingResponse.status}`);
        } catch (pingError) {
            console.error('❌ Basic connectivity test failed:', pingError.message);
            console.error('  This indicates a network connectivity issue with Supabase.');
            console.error('  - Check your internet connection');
            console.error('  - Verify there are no firewall or proxy issues');
            console.error('  - Confirm the Supabase URL is correct');
        }
        
        // Now try an actual authenticated query
        const { data, error } = await supabase.from('users').select('count').limit(1);
        const duration = Date.now() - start;
        
        if (error) {
            console.error(`❌ Database connection test failed after ${duration}ms:`, error);
            console.error(`   Error code: ${error.code}, Message: ${error.message}`);
            console.error(`   Hint: Check if your DB tables are properly created and accessible`);
        } else {
            console.log(`✅ Database connection successful (${duration}ms)`);
            console.log(`   Response data:`, data);
        }
    } catch (err) {
        console.error('❌ Failed to test database connection:', err);
        console.error('   This may indicate a network problem or invalid credentials');
        console.error('   Error details:', err.message);
        
        // Check for common error patterns
        if (err.message?.includes('fetch failed')) {
            console.error('   Network connectivity issue detected. Please check:');
            console.error('   1. Your internet connection is working');
            console.error('   2. Supabase service is not down (check status.supabase.com)');
            console.error('   3. No firewall/VPN is blocking requests');
            console.error('   4. The SUPABASE_URL is correct');
        }
    }
})();

// Add a helper for direct SQL queries if needed
async function executeSql(query, params = {}) {
    try {
        const { data, error } = await supabase.rpc('exec_sql', {
            query,
            params
        });
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('SQL execution error:', error);
        throw new CustomError(`SQL execution failed: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports = { connect, supabase, executeSql };