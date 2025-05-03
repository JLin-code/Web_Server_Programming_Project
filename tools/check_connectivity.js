require('dotenv').config();
const fetch = require('node-fetch');
const dns = require('dns');
const { promisify } = require('util');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const resolveDns = promisify(dns.resolve);
const lookupDns = promisify(dns.lookup);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Define SQL paths to check
const SQL_PATHS = [
    path.join(__dirname, '..', 'sql'),
    path.join(__dirname, '..', 'server', 'sql'),
    path.join(__dirname, '..', 'database')
];

async function testNetworkConnectivity() {
    console.log('=============================================');
    console.log('🔍 SUPABASE CONNECTIVITY DIAGNOSTIC TOOL');
    console.log('=============================================');
    
    // Check environment variables
    console.log('\n📋 Environment Variables Check:');
    if (!SUPABASE_URL) {
        console.error('❌ SUPABASE_URL is missing from environment variables');
        console.error('  Make sure you have a .env file with SUPABASE_URL set');
        return false;
    } else {
        console.log(`✅ SUPABASE_URL is set: ${SUPABASE_URL.substring(0, 20)}...`);
    }
    
    if (!SUPABASE_KEY) {
        console.error('❌ SUPABASE_KEY is missing from environment variables');
        console.error('  Make sure you have a .env file with SUPABASE_KEY set');
        return false;
    } else {
        console.log(`✅ SUPABASE_KEY is set (length: ${SUPABASE_KEY.length})`);
    }

    console.log(`${SUPABASE_SERVICE_KEY ? '✅' : '❌'} SUPABASE_SERVICE_KEY is ${SUPABASE_SERVICE_KEY ? 'set' : 'not set'}`);
    
    // Check for SQL files in the new location
    await checkSqlFiles();
    
    // Parse URL
    let hostname;
    try {
        const urlObj = new URL(SUPABASE_URL);
        hostname = urlObj.hostname;
        console.log(`\n📡 Checking connectivity to ${hostname}...`);
    } catch (err) {
        console.error(`❌ Invalid SUPABASE_URL format: ${err.message}`);
        return false;
    }
    
    // DNS Resolution Test
    try {
        console.log(`\n🔍 Performing DNS lookup for ${hostname}...`);
        const dnsResult = await lookupDns(hostname);
        console.log(`✅ DNS Resolution successful: ${hostname} -> ${dnsResult.address}`);
    } catch (err) {
        console.error(`❌ DNS Resolution failed: ${err.message}`);
        console.error('  This indicates a DNS resolution problem. Check your internet connection and DNS settings.');
        return false;
    }
    
    // Simple ping test (HTTP request)
    try {
        const pingUrl = `${SUPABASE_URL}/ping`;
        console.log(`\n🏓 Sending ping request to ${pingUrl}...`);
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(pingUrl, {
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeout);
        
        console.log(`✅ Received response with status code: ${response.status}`);
        try {
            const text = await response.text();
            console.log(`   Response body: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
        } catch (e) {
            console.log('   Could not read response body');
        }
    } catch (err) {
        console.error(`❌ Ping test failed: ${err.message}`);
        console.error('  This suggests network connectivity issues to the Supabase server.');
        
        if (err.name === 'AbortError') {
            console.error('  Request timed out after 10 seconds.');
        }
        
        console.error('\n🔧 TROUBLESHOOTING SUGGESTIONS:');
        console.error('1. Check if your internet connection is working');
        console.error('2. Verify if any firewall or VPN is blocking outgoing connections');
        console.error('3. Check if the Supabase service is down (visit status.supabase.com)');
        console.error('4. Confirm your SUPABASE_URL is correct');
        return false;
    }
    
    // Test actual Supabase connection
    try {
        console.log('\n🔌 Testing Supabase client connection...');
        
        // Create a client with retry logic
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: { persistSession: false },
            global: { 
                fetch: (url, options) => {
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 15000);
                    
                    return fetch(url, { 
                        ...options, 
                        signal: controller.signal 
                    }).then(response => {
                        clearTimeout(timeout);
                        return response;
                    }).catch(error => {
                        clearTimeout(timeout);
                        throw error;
                    });
                }
            }
        });
        
        console.log('   Attempting to query the database...');
        const startTime = Date.now();
        const { data, error } = await supabase.from('health').select('*').limit(1).maybeSingle();
        const duration = Date.now() - startTime;
        
        if (error && error.code !== 'PGRST116') {  // PGRST116 = table doesn't exist, which is fine
            throw error;
        }
        
        console.log(`✅ Supabase client query successful (${duration}ms)`);
        console.log('   Your connection is working properly!');
        return true;
    } catch (err) {
        console.error(`❌ Supabase client connection failed: ${err.message}`);
        console.error('   Details:', err);
        return false;
    }
}

// Function to check for SQL files in the designated paths
async function checkSqlFiles() {
    console.log('\n📂 SQL Files Check:');
    
    let totalSqlFiles = 0;
    let sqlFilesFound = [];
    
    for (const dirPath of SQL_PATHS) {
        if (fs.existsSync(dirPath)) {
            try {
                const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.sql'));
                if (files.length > 0) {
                    console.log(`✅ Found ${files.length} SQL files in ${dirPath}`);
                    files.forEach(file => {
                        const filePath = path.join(dirPath, file);
                        const stats = fs.statSync(filePath);
                        console.log(`   - ${file} (${stats.size} bytes)`);
                        sqlFilesFound.push({ name: file, path: filePath, size: stats.size });
                    });
                    totalSqlFiles += files.length;
                } else {
                    console.log(`❌ No SQL files found in ${dirPath}`);
                }
            } catch (err) {
                console.error(`❌ Error reading directory ${dirPath}: ${err.message}`);
            }
        } else {
            console.log(`❓ Directory does not exist: ${dirPath}`);
        }
    }
    
    if (totalSqlFiles === 0) {
        console.log('\n⚠️ WARNING: No SQL files found in any of the checked directories.');
        console.log('   Make sure your SQL files are in one of these locations:');
        SQL_PATHS.forEach(path => console.log(`   - ${path}`));
        console.log('   Or update this script to include your SQL file location.');
    } else {
        console.log(`\n✅ Total SQL files found: ${totalSqlFiles}`);
    }
    
    // Check specifically for the seed_data.sql and create_exec_sql.sql files
    const criticalFiles = [
        { name: 'seed_data.sql', found: false },
        { name: 'create_exec_sql.sql', found: false }
    ];
    
    for (const file of sqlFilesFound) {
        for (const criticalFile of criticalFiles) {
            if (file.name === criticalFile.name) {
                criticalFile.found = true;
                criticalFile.path = file.path;
                break;
            }
        }
    }
    
    console.log('\n🔍 Critical SQL Files Check:');
    for (const file of criticalFiles) {
        if (file.found) {
            console.log(`✅ ${file.name} found at: ${file.path}`);
        } else {
            console.log(`❌ ${file.name} not found in any directory`);
        }
    }
    
    return sqlFilesFound;
}

// Run the test
testNetworkConnectivity()
    .then(success => {
        if (success) {
            console.log('\n✅ All connectivity tests PASSED');
        } else {
            console.log('\n❌ Some connectivity tests FAILED');
            console.log('   Review the errors above and follow the troubleshooting suggestions');
        }
    })
    .catch(err => {
        console.error('\n💥 An unexpected error occurred during testing:', err);
    });
