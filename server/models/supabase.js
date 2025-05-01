const { createClient } = require('@supabase/supabase-js');
const { CustomError, statusCodes } = require('./errors');

function connect() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
        throw new CustomError('Supabase credentials not configured', statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
}

async function testConnection() {
    const supabase = connect();
    try {
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        if (error) throw new CustomError(`Supabase connection test failed: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
        return true;
    } catch (err) {
        throw new CustomError(`Supabase connection test failed: ${err.message}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    connect,
    testConnection
}