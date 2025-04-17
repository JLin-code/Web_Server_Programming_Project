const { CustomError, statusCodes } = require('./errors');
const { connect } = require('./supabase');

const TABLE_NAME = 'users';

async function getAll() {
    const { data, error, count } = await connect().from(TABLE_NAME).select('*', { count: 'exact' });
    
    if (error) {
        throw new CustomError(error.message, statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    return {
        items: data,
        total: count
    };
}

async function get(id) {
    const { data, error } = await connect().from(TABLE_NAME).select('*').eq('id', id).single();
    
    if (error) {
        throw new CustomError(error.message, statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    if (!data) {
        throw new CustomError('User not found', statusCodes.NOT_FOUND);
    }
    
    return data;
}

async function getByEmail(email) {
    const { data, error } = await connect()
        .from(TABLE_NAME)
        .select('*')
        .eq('email', email)
        .single();
    
    if (error) {
        throw new CustomError(error.message, statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    if (!data) {
        throw new CustomError('User not found', statusCodes.NOT_FOUND);
    }
    
    return data;
}

async function create(user) {
    // Validate user data
    if (!user.email || !user.first_name || !user.last_name) {
        throw new CustomError('Missing required user fields', statusCodes.BAD_REQUEST);
    }
    
    const { data, error } = await connect().from(TABLE_NAME).insert([user]).select();
    
    if (error) {
        if (error.code === '23505') { // Unique constraint violation
            throw new CustomError('Email already in use', statusCodes.BAD_REQUEST);
        }
        throw new CustomError(error.message, statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    return data[0];
}

async function update(id, updates) {
    const { data: existing } = await connect().from(TABLE_NAME).select('*').eq('id', id).single();
    
    if (!existing) {
        throw new CustomError('User not found', statusCodes.NOT_FOUND);
    }
    
    const { data, error } = await connect()
        .from(TABLE_NAME)
        .update(updates)
        .eq('id', id)
        .select();
    
    if (error) {
        throw new CustomError(error.message, statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    return data[0];
}

async function remove(id) {
    const { data: existing } = await connect().from(TABLE_NAME).select('*').eq('id', id).single();
    
    if (!existing) {
        throw new CustomError('User not found', statusCodes.NOT_FOUND);
    }
    
    const { data, error } = await connect()
        .from(TABLE_NAME)
        .delete()
        .eq('id', id)
        .select();
    
    if (error) {
        throw new CustomError(error.message, statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    return data[0];
}

module.exports = {
    getAll,
    get,
    getByEmail,
    create,
    update,
    remove
};