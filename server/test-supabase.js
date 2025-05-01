require('dotenv').config(); // Make sure you have dotenv installed
const { testConnection } = require('./models/supabase');

async function runTest() {
    try {
        await testConnection();
        console.log('✅ Supabase connection successful!');
    } catch (error) {
        console.error('❌ Supabase connection failed:', error.message);
    }
}

runTest();
