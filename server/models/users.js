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

async function get(id) {
    const supabase = connect();
    try {
        console.log(`Fetching user with ID: ${id}`);
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                throw new CustomError(`User with ID ${id} not found`, statusCodes.NOT_FOUND);
            }
            throw error;
        }
        
        return data;
    } catch (error) {
        if (error instanceof CustomError) throw error;
        console.error(`Error fetching user ${id}:`, error);
        throw new CustomError(`Failed to retrieve user: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getByEmail(email) {
    const supabase = connect();
    try {
        console.log(`Fetching user by email: ${email}`);
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('email', email.toLowerCase())
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                throw new CustomError(`User with email ${email} not found`, statusCodes.NOT_FOUND);
            }
            throw error;
        }
        
        return data;
    } catch (error) {
        if (error instanceof CustomError) throw error;
        console.error(`Error fetching user by email ${email}:`, error);
        throw new CustomError(`Failed to retrieve user by email: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function create(user) {
    const supabase = connect();
    try {
        console.log(`Creating new user:`, { ...user, password: '[REDACTED]' });
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([user])
            .select()
            .single();
        
        if (error) throw error;
        
        console.log(`User created with ID: ${data.id}`);
        return data;
    } catch (error) {
        console.error(`Error creating user:`, error);
        if (error.code === '23505') { // Unique constraint violation
            throw new CustomError(`A user with this email already exists`, statusCodes.CONFLICT);
        }
        throw new CustomError(`Failed to create user: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function update(id, updates) {
    const supabase = connect();
    try {
        console.log(`Updating user ${id} with:`, { ...updates, password: updates.password ? '[REDACTED]' : undefined });
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        
        if (!data) {
            throw new CustomError(`User with ID ${id} not found`, statusCodes.NOT_FOUND);
        }
        
        return data;
    } catch (error) {
        if (error instanceof CustomError) throw error;
        console.error(`Error updating user ${id}:`, error);
        throw new CustomError(`Failed to update user: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function remove(id) {
    const supabase = connect();
    try {
        console.log(`Deleting user with ID: ${id}`);
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        
        if (!data) {
            throw new CustomError(`User with ID ${id} not found`, statusCodes.NOT_FOUND);
        }
        
        return { success: true, message: `User ${id} deleted successfully` };
    } catch (error) {
        if (error instanceof CustomError) throw error;
        console.error(`Error deleting user ${id}:`, error);
        throw new CustomError(`Failed to delete user: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    getAll,
    get,
    getByEmail,
    create,
    update,
    remove
};