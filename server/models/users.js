const { CustomError, statusCodes } = require('./errors');
const { connect } = require('./supabase');

const TABLE_NAME = 'users';

async function getAll() {
    const supabase = connect();
    try {
        console.log(`Fetching all users from ${TABLE_NAME} table`);
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*');
        
        if (error) throw error;
        
        console.log(`Successfully retrieved ${data.length} users`);
        return { 
            success: true, 
            items: data,
            count: data.length
        };
    } catch (error) {
        console.error(`Error fetching users:`, error);
        throw new CustomError(`Failed to retrieve users: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getById(id) {
    const supabase = connect();
    try {
        console.log(`Fetching user with id ${id}`);
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                throw new CustomError(`User with id ${id} not found`, statusCodes.NOT_FOUND);
            }
            throw error;
        }
        
        return { success: true, item: data };
    } catch (error) {
        console.error(`Error fetching user by ID:`, error);
        if (error instanceof CustomError) throw error;
        throw new CustomError(`Failed to retrieve user: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getByEmail(email) {
    const supabase = connect();
    try {
        console.log(`Fetching user with email ${email}`);
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('email', email)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                throw new CustomError(`User with email ${email} not found`, statusCodes.NOT_FOUND);
            }
            throw error;
        }
        
        return { success: true, item: data };
    } catch (error) {
        console.error(`Error fetching user by email:`, error);
        if (error instanceof CustomError) throw error;
        throw new CustomError(`Failed to retrieve user: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    getAll,
    getById,
    getByEmail
};