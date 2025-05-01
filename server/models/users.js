const { CustomError, statusCodes } = require('./errors');
const { supabase, executeQuery } = require('./db');
const bcrypt = require('bcrypt');

const TABLE_NAME = 'users';

async function getAll() {
  return executeQuery(() => 
    supabase.from(TABLE_NAME)
      .select('id, first_name, last_name, email, handle, is_admin, created_at, updated_at')
  );
}

async function get(id) {
  const data = await executeQuery(() => 
    supabase.from(TABLE_NAME)
      .select('id, first_name, last_name, email, handle, is_admin, created_at, updated_at')
      .eq('id', id)
      .single()
  );
  
  if (!data) {
    throw new CustomError(`User with ID ${id} not found`, statusCodes.NOT_FOUND);
  }
  
  return data;
}

async function getByEmail(email) {
  const data = await executeQuery(() => 
    supabase.from(TABLE_NAME)
      .select('*')
      .eq('email', email.toLowerCase())
      .single()
  );
  
  if (!data) {
    throw new CustomError(`User with email ${email} not found`, statusCodes.NOT_FOUND);
  }
  
  return data;
}

async function create(userData) {
  // Validate required fields
  if (!userData.first_name || !userData.last_name || !userData.email || !userData.password) {
    throw new CustomError('Missing required fields', statusCodes.BAD_REQUEST);
  }
  
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);
  
  // Create the user object to save
  const user = {
    first_name: userData.first_name,
    last_name: userData.last_name,
    email: userData.email.toLowerCase(),
    password: hashedPassword,
    handle: userData.handle || `${userData.first_name.toLowerCase()}${Math.floor(Math.random() * 1000)}`,
    is_admin: userData.is_admin || false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  return executeQuery(() => 
    supabase.from(TABLE_NAME)
      .insert(user)
      .select('id, first_name, last_name, email, handle, is_admin, created_at, updated_at')
      .single()
  );
}

async function update(id, userData) {
  // Don't allow direct password updates through this function
  if (userData.password) {
    delete userData.password;
  }
  
  const updatedData = {
    ...userData,
    updated_at: new Date().toISOString()
  };
  
  return executeQuery(() => 
    supabase.from(TABLE_NAME)
      .update(updatedData)
      .eq('id', id)
      .select('id, first_name, last_name, email, handle, is_admin, created_at, updated_at')
      .single()
  );
}

async function updatePassword(id, newPassword) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  
  return executeQuery(() => 
    supabase.from(TABLE_NAME)
      .update({ 
        password: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
  );
}

async function remove(id) {
  return executeQuery(() => 
    supabase.from(TABLE_NAME)
      .delete()
      .eq('id', id)
  );
}

async function getUserStats(userId) {
  // Custom function to get user's fitness statistics
  const userData = await get(userId);
  
  // Get activity summaries for this user
  const activities = await executeQuery(() => 
    supabase.from('activities')
      .select('*')
      .eq('user_id', userId)
  );
  
  // Calculate stats from activities
  const totalActivities = activities.length;
  let totalCalories = 0;
  let totalDistance = 0;
  let totalDuration = 0;
  
  activities.forEach(activity => {
    if (activity.metrics) {
      if (activity.metrics.calories) totalCalories += parseFloat(activity.metrics.calories);
      if (activity.metrics.distance) totalDistance += parseFloat(activity.metrics.distance);
      if (activity.metrics.duration) totalDuration += parseFloat(activity.metrics.duration);
    }
  });
  
  return {
    user: {
      id: userData.id,
      name: `${userData.first_name} ${userData.last_name}`,
      handle: userData.handle
    },
    stats: {
      activityCount: totalActivities,
      totalCalories,
      totalDistance,
      totalDuration,
      averageCaloriesPerActivity: totalActivities > 0 ? (totalCalories / totalActivities).toFixed(2) : 0
    }
  };
}

module.exports = {
  getAll,
  get,
  getByEmail,
  create,
  update,
  updatePassword,
  remove,
  getUserStats
};