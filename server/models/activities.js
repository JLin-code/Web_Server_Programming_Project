const { CustomError, statusCodes } = require('./errors');
const { supabase, executeQuery } = require('./db');

const TABLE_NAME = 'activities';

async function getAll() {
  return executeQuery(() => 
    supabase.from(TABLE_NAME)
      .select(`
        *,
        user:user_id (
          id, first_name, last_name, handle, email
        )
      `)
      .order('date', { ascending: false })
  );
}

async function get(id) {
  const data = await executeQuery(() => 
    supabase.from(TABLE_NAME)
      .select(`
        *,
        user:user_id (
          id, first_name, last_name, handle, email
        )
      `)
      .eq('id', id)
      .single()
  );
  
  if (!data) {
    throw new CustomError(`Activity with ID ${id} not found`, statusCodes.NOT_FOUND);
  }
  
  return data;
}

async function create(activity) {
  if (!activity.title || !activity.type || !activity.user_id) {
    throw new CustomError('Missing required fields', statusCodes.BAD_REQUEST);
  }
  
  const newActivity = {
    ...activity,
    date: activity.date || new Date().toISOString(),
    metrics: activity.metrics || {},
    likes: 0,
    comments: 0,
    created_at: new Date().toISOString()
  };
  
  return executeQuery(() => 
    supabase.from(TABLE_NAME)
      .insert(newActivity)
      .select(`
        *,
        user:user_id (
          id, first_name, last_name, handle, email
        )
      `)
      .single()
  );
}

async function update(id, updates) {
  const updatedActivity = {
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  return executeQuery(() => 
    supabase.from(TABLE_NAME)
      .update(updatedActivity)
      .eq('id', id)
      .select(`
        *,
        user:user_id (
          id, first_name, last_name, handle, email
        )
      `)
      .single()
  );
}

async function remove(id) {
  return executeQuery(() => 
    supabase.from(TABLE_NAME)
      .delete()
      .eq('id', id)
  );
}

async function getByUserId(userId) {
  return executeQuery(() => 
    supabase.from(TABLE_NAME)
      .select(`
        *,
        user:user_id (
          id, first_name, last_name, handle, email
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })
  );
}

async function getFriendActivities(userId) {
  // Get friends list first
  const { data: friendships } = await supabase
    .from('friendships')
    .select('friend_id')
    .eq('user_id', userId);
    
  if (!friendships || friendships.length === 0) {
    return [];
  }
  
  // Extract friend IDs
  const friendIds = friendships.map(f => f.friend_id);
  
  // Get activities from friends
  return executeQuery(() => 
    supabase.from(TABLE_NAME)
      .select(`
        *,
        user:user_id (
          id, first_name, last_name, handle, email
        )
      `)
      .in('user_id', friendIds)
      .order('date', { ascending: false })
  );
}

async function getActivityStats(userId, period = 'week') {
  // Get date range based on period
  const now = new Date();
  let startDate;
  
  switch(period) {
    case 'day':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7); // Default to week
  }
  
  const activities = await executeQuery(() => 
    supabase.from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString())
      .lte('date', now.toISOString())
  );
  
  // Calculate statistics
  let steps = 0;
  let calories = 0;
  let distance = 0;
  
  activities.forEach(activity => {
    if (activity.metrics) {
      if (activity.metrics.steps) steps += parseInt(activity.metrics.steps);
      if (activity.metrics.calories) calories += parseInt(activity.metrics.calories);
      if (activity.metrics.distance) distance += parseFloat(activity.metrics.distance);
    }
  });
  
  return {
    period,
    activities: activities.length,
    steps: steps.toLocaleString(),
    calories: calories.toLocaleString(),
    distance: distance.toFixed(1) + 'km'
  };
}

module.exports = {
  getAll,
  get,
  create,
  update,
  remove,
  getByUserId,
  getFriendActivities,
  getActivityStats
};
