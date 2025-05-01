const { CustomError, statusCodes } = require('./errors');
const { connect } = require('./supabase');

const TABLE_NAME = 'activities';

async function getAll() {
    const supabase = connect();
    try {
        console.log(`Fetching all activities from ${TABLE_NAME} table`);
        
        // Join with users table to get user information
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select(`
                *,
                user:user_id (
                    id, first_name, last_name, email
                )
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform data for frontend consumption
        const items = data.map(activity => ({
            ...activity,
            user: {
                id: activity.user?.id,
                name: `${activity.user?.first_name || ''} ${activity.user?.last_name || ''}`.trim(),
                email: activity.user?.email
            }
        }));
        
        console.log(`Successfully retrieved ${items.length} activities`);
        return { 
            success: true, 
            items,
            count: items.length
        };
    } catch (error) {
        console.error(`Error fetching activities:`, error);
        throw new CustomError(`Failed to retrieve activities: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function get(id) {
    const supabase = connect();
    try {
        console.log(`Fetching activity with ID: ${id}`);
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select(`
                *,
                user:user_id (
                    id, first_name, last_name, email
                )
            `)
            .eq('id', id)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                throw new CustomError(`Activity with ID ${id} not found`, statusCodes.NOT_FOUND);
            }
            throw error;
        }
        
        // Transform for frontend
        const activity = {
            ...data,
            user: {
                id: data.user?.id,
                name: `${data.user?.first_name || ''} ${data.user?.last_name || ''}`.trim(),
                email: data.user?.email
            }
        };
        
        return activity;
    } catch (error) {
        if (error instanceof CustomError) throw error;
        console.error(`Error fetching activity ${id}:`, error);
        throw new CustomError(`Failed to retrieve activity: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function create(activity) {
    const supabase = connect();
    try {
        console.log(`Creating new activity:`, activity);
        
        // Ensure created_at is set
        const activityWithTimestamp = {
            ...activity,
            created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([activityWithTimestamp])
            .select()
            .single();
        
        if (error) throw error;
        
        console.log(`Activity created with ID: ${data.id}`);
        return data;
    } catch (error) {
        console.error(`Error creating activity:`, error);
        throw new CustomError(`Failed to create activity: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function update(id, updates) {
    const supabase = connect();
    try {
        console.log(`Updating activity ${id} with:`, updates);
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        
        if (!data) {
            throw new CustomError(`Activity with ID ${id} not found`, statusCodes.NOT_FOUND);
        }
        
        return data;
    } catch (error) {
        if (error instanceof CustomError) throw error;
        console.error(`Error updating activity ${id}:`, error);
        throw new CustomError(`Failed to update activity: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function remove(id) {
    const supabase = connect();
    try {
        console.log(`Deleting activity with ID: ${id}`);
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        
        if (!data) {
            throw new CustomError(`Activity with ID ${id} not found`, statusCodes.NOT_FOUND);
        }
        
        return { success: true, message: `Activity ${id} deleted successfully` };
    } catch (error) {
        if (error instanceof CustomError) throw error;
        console.error(`Error deleting activity ${id}:`, error);
        throw new CustomError(`Failed to delete activity: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getByUserId(userId) {
    const supabase = connect();
    try {
        console.log(`Fetching activities for user ID: ${userId}`);
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select(`
                *,
                user:user_id (
                    id, first_name, last_name, email
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform for frontend
        const items = data.map(activity => ({
            ...activity,
            user: {
                id: activity.user?.id,
                name: `${activity.user?.first_name || ''} ${activity.user?.last_name || ''}`.trim(),
                email: activity.user?.email
            }
        }));
        
        return { 
            success: true, 
            items,
            count: items.length
        };
    } catch (error) {
        console.error(`Error fetching activities for user ${userId}:`, error);
        throw new CustomError(`Failed to retrieve activities: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    getAll,
    get,
    create,
    update,
    remove,
    getByUserId
};
