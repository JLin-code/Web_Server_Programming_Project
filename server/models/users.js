const { CustomError, statusCodes } = require('./errors');
const { connect } = require('./supabase');

const TABLE_NAME = 'users';

async function getAll() {
    const supabase = connect();
    const { data, error } = await supabase.from(TABLE_NAME).select('*');
    
    if (error) {
        throw new CustomError(`Failed to get users: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    return data;
}

async function get(id) {
    const supabase = connect();
    const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('id', id).single();
    
    if (error) {
        if (error.code === 'PGRST116') {
            throw new CustomError(`User with id ${id} not found`, statusCodes.NOT_FOUND);
        }
        throw new CustomError(`Failed to get user: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    return data;
}

async function getByEmail(email) {
    const supabase = connect();
    const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('email', email).single();
    
    if (error) {
        if (error.code === 'PGRST116') {
            return null; // No user found with this email
        }
        throw new CustomError(`Failed to get user: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    return data;
}

async function create(user) {
    const supabase = connect();
    const { data, error } = await supabase.from(TABLE_NAME).insert([user]).select().single();
    
    if (error) {
        throw new CustomError(`Failed to create user: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    return data;
}

async function update(id, updates) {
    const supabase = connect();
    const { data, error } = await supabase.from(TABLE_NAME).update(updates).eq('id', id).select().single();
    
    if (error) {
        if (error.code === 'PGRST116') {
            throw new CustomError(`User with id ${id} not found`, statusCodes.NOT_FOUND);
        }
        throw new CustomError(`Failed to update user: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    return data;
}

async function remove(id) {
    const supabase = connect();
    const { data, error } = await supabase.from(TABLE_NAME).delete().eq('id', id).select().single();
    
    if (error) {
        if (error.code === 'PGRST116') {
            throw new CustomError(`User with id ${id} not found`, statusCodes.NOT_FOUND);
        }
        throw new CustomError(`Failed to delete user: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    return data;
}

module.exports = {
    getAll,
    get,
    getByEmail,
    create,
    update,
    remove
};