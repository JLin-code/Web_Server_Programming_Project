const { CustomError, statusCodes } = require('./errors');
const { connect } = require('./supabase');

const TABLE_NAME = 'activities';

async function getAll() {
    const { data, error, count } = await connect()
        .from(TABLE_NAME)
        .select(`
            *,
            users!user_id (id, first_name, last_name, email, image)
        `, { count: 'exact' });
    
    if (error) {
        throw new CustomError(error.message, statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    // Format activities for client consumption
    const formattedActivities = data.map(activity => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        type: activity.type,
        date: activity.date,
        metrics: activity.metrics,
        likes: activity.likes,
        comments: activity.comments,
        image: activity.image,
        user: {
            id: activity.users.id,
            name: `${activity.users.first_name} ${activity.users.last_name}`,
            avatar: activity.users.image || `https://i.pravatar.cc/150?img=${activity.users.id}`
        }
    }));
    
    return {
        items: formattedActivities,
        total: count
    };
}

async function get(id) {
    const { data, error } = await connect()
        .from(TABLE_NAME)
        .select(`
            *,
            users!user_id (id, first_name, last_name, email, image)
        `)
        .eq('id', id)
        .single();
    
    if (error) {
        throw new CustomError(error.message, statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    if (!data) {
        throw new CustomError('Activity not found', statusCodes.NOT_FOUND);
    }
    
    // Format activity for client consumption
    return {
        id: data.id,
        title: data.title,
        description: data.description,
        type: data.type,
        date: data.date,
        metrics: data.metrics,
        likes: data.likes,
        comments: data.comments,
        image: data.image,
        user: {
            id: data.users.id,
            name: `${data.users.first_name} ${data.users.last_name}`,
            avatar: data.users.image || `https://i.pravatar.cc/150?img=${data.users.id}`
        }
    };
}

async function create(activity) {
    // Validate activity data
    if (!activity.title || !activity.description || !activity.type || !activity.user_id || !activity.metrics) {
        throw new CustomError('Missing required activity fields', statusCodes.BAD_REQUEST);
    }
    
    // Prepare data for insertion
    const activityData = {
        user_id: activity.user_id,
        title: activity.title,
        description: activity.description,
        type: activity.type,
        date: activity.date || new Date().toISOString(),
        metrics: activity.metrics,
        likes: activity.likes || 0,
        comments: activity.comments || 0,
        image: activity.image
    };
    
    const { data, error } = await connect().from(TABLE_NAME).insert([activityData]).select();
    
    if (error) {
        throw new CustomError(error.message, statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    // Return the newly created activity with user info
    return await get(data[0].id);
}

async function update(id, updates) {
    const { data: existing } = await connect().from(TABLE_NAME).select('*').eq('id', id).single();
    
    if (!existing) {
        throw new CustomError('Activity not found', statusCodes.NOT_FOUND);
    }
    
    const { data, error } = await connect()
        .from(TABLE_NAME)
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();
    
    if (error) {
        throw new CustomError(error.message, statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    // Return the updated activity with user info
    return await get(data[0].id);
}

async function remove(id) {
    const { data: existing } = await connect().from(TABLE_NAME).select('*').eq('id', id).single();
    
    if (!existing) {
        throw new CustomError('Activity not found', statusCodes.NOT_FOUND);
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

async function getByUserId(userId) {
    const { data, error, count } = await connect()
        .from(TABLE_NAME)
        .select(`
            *,
            users!user_id (id, first_name, last_name, email, image)
        `, { count: 'exact' })
        .eq('user_id', userId);
    
    if (error) {
        throw new CustomError(error.message, statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    // Format activities for client consumption
    const formattedActivities = data.map(activity => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        type: activity.type,
        date: activity.date,
        metrics: activity.metrics,
        likes: activity.likes,
        comments: activity.comments,
        image: activity.image,
        user: {
            id: activity.users.id,
            name: `${activity.users.first_name} ${activity.users.last_name}`,
            avatar: activity.users.image || `https://i.pravatar.cc/150?img=${activity.users.id}`
        }
    }));
    
    return {
        items: formattedActivities,
        total: count
    };
}

module.exports = {
    getAll,
    get,
    create,
    update,
    remove,
    getByUserId
};
