const { createClient } = require('@supabase/supabase-js');
const { CustomError, statusCodes } = require('./errors');

function connect() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
        throw new CustomError('Supabase credentials not configured', statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
}

module.exports = {
    connect
}