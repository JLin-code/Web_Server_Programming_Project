require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const API_URL = process.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

console.log('=============================================');
console.log('🔍 FITNESS TRACKER DIAGNOSTIC TOOL');
console.log('=============================================');

// Check environment variables
console.log('\n📋 Environment Variables Check:');
console.log(`API_URL: ${API_URL ? '✅ Set' : '❌ Missing'}`);
console.log(`SUPABASE_URL: ${SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
console.log(`SUPABASE_KEY: ${SUPABASE_KEY ? '✅ Set (length: ' + SUPABASE_KEY.length + ')' : '❌ Missing'}`);
console.log(`SUPABASE_SERVICE_KEY: ${process.env.SUPABASE_SERVICE_KEY ? '✓ Found' : '✗ Missing'}`);

// Test direct Supabase connection
async function testSupabaseConnection() {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.log('\n❌ Cannot test Supabase connection: Missing credentials');
        return false;
    }
    
    console.log('\n🔄 Testing direct Supabase connection...');
    
    const isServiceRole = SUPABASE_KEY.includes('service_role') || 
                          process.env.SUPABASE_SERVICE_KEY === SUPABASE_KEY;

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const startTime = Date.now();
        const { data, error } = await supabase.from('users').select('count');
        const duration = Date.now() - startTime;
        
        if (error) {
            console.log(`❌ Supabase connection failed (${duration}ms):`);
            console.log(`   Error: ${error.message}`);
            console.log(`   Code: ${error.code}`);
            return false;
        }
        
        console.log(`✅ Supabase connection successful (${duration}ms)`);
        console.log(`   Response:`, data);
        return true;
    } catch (err) {
        console.log('❌ Supabase connection error:');
        console.log(`   ${err.message}`);
        return false;
    }
}

// Test server API endpoints
async function testApiEndpoints() {
    console.log('\n🔄 Testing API endpoints...');
    
    const endpoints = [
        { url: '/health', name: 'Health Check' },
        { url: '/auth/demo-users', name: 'Demo Users' },
        { url: '/users', name: 'Users List' },
        { url: '/activities', name: 'Activities List' }
    ];
    
    let success = 0;
    
    for (const endpoint of endpoints) {
        try {
            console.log(`Testing ${endpoint.name} (${API_URL}${endpoint.url})...`);
            const startTime = Date.now();
            const response = await axios.get(`${API_URL}${endpoint.url}`);
            const duration = Date.now() - startTime;
            
            console.log(`✅ ${endpoint.name}: Success (${duration}ms)`);
            console.log(`   Status: ${response.status}`);
            console.log(`   Data sample:`, typeof response.data);
            success++;
        } catch (error) {
            console.log(`❌ ${endpoint.name}: Failed`);
            console.log(`   Status: ${error.response?.status || 'No response'}`);
            console.log(`   Error: ${error.message}`);
            if (error.response?.data) {
                console.log(`   Response:`, error.response.data);
            }
        }
    }
    
    return { total: endpoints.length, success };
}

// Run tests
async function runDiagnostics() {
    const supabaseConnected = await testSupabaseConnection();
    const apiResults = await testApiEndpoints();
    
    console.log('\n=============================================');
    console.log('📊 DIAGNOSTIC RESULTS SUMMARY');
    console.log('=============================================');
    console.log(`Supabase Connection: ${supabaseConnected ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`API Endpoints: ${apiResults.success}/${apiResults.total} working`);
    
    if (!supabaseConnected) {
        console.log('\n🔧 SUPABASE TROUBLESHOOTING TIPS:');
        console.log('1. Verify your SUPABASE_URL and SUPABASE_KEY in .env file');
        console.log('2. Make sure you are using the anon key, not the service key');
        console.log('3. Check for network restrictions (firewalls, VPNs)');
        console.log('4. Verify your Supabase project is active at https://app.supabase.com/');
    }
    
    if (apiResults.success < apiResults.total) {
        console.log('\n🔧 API TROUBLESHOOTING TIPS:');
        console.log('1. Make sure your server is running');
        console.log('2. Check server logs for errors');
        console.log('3. Verify the API_URL in .env is correct');
        console.log('4. Check for CORS issues if client is on a different domain');
    }
}

runDiagnostics().catch(err => {
    console.error('Diagnostic tool error:', err);
});
