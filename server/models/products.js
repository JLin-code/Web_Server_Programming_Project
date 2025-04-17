const { CustomError, statusCodes } = require('./errors');
const { connect } = require('./supabase');

const TABLE_NAME = 'products';

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
        throw new CustomError('Product not found', statusCodes.NOT_FOUND);
    }
    
    return data;
}

async function create(product) {
    // Validate product data
    if (!product.title || !product.price || !product.description) {
        throw new CustomError('Missing required product fields', statusCodes.BAD_REQUEST);
    }
    
    const { data, error } = await connect().from(TABLE_NAME).insert([product]).select();
    
    if (error) {
        throw new CustomError(error.message, statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    return data[0];
}

async function update(id, updates) {
    const { data: existing } = await connect().from(TABLE_NAME).select('*').eq('id', id).single();
    
    if (!existing) {
        throw new CustomError('Product not found', statusCodes.NOT_FOUND);
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
        throw new CustomError('Product not found', statusCodes.NOT_FOUND);
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
    create,
    update,
    remove
};