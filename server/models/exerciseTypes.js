const { CustomError, statusCodes } = require('./errors');
const { supabase, executeQuery } = require('./db');

const TABLE_NAME = 'exercise_types';

async function getAll() {
  return executeQuery(() => 
    supabase.from(TABLE_NAME)
      .select('*')
      .order('name')
  );
}

async function get(id) {
  const data = await executeQuery(() => 
    supabase.from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single()
  );
  
  if (!data) {
    throw new CustomError(`Exercise type with ID ${id} not found`, statusCodes.NOT_FOUND);
  }
  
  return data;
}

async function create(exerciseTypeData) {
  if (!exerciseTypeData.name) {
    throw new CustomError('Exercise type name is required', statusCodes.BAD_REQUEST);
  }
  
  const exerciseType = {
    name: exerciseTypeData.name,
    description: exerciseTypeData.description || '',
    metrics: exerciseTypeData.metrics || ['duration', 'sets', 'reps'],
    created_at: new Date().toISOString(),
    created_by: exerciseTypeData.created_by,
    is_public: exerciseTypeData.is_public !== undefined ? exerciseTypeData.is_public : true
  };
  
  return executeQuery(() => 
    supabase.from(TABLE_NAME)
      .insert(exerciseType)
      .select()
      .single()
  );
}

async function update(id, exerciseTypeData) {
  const updatedData = {
    ...exerciseTypeData,
    updated_at: new Date().toISOString()
  };
  
  return executeQuery(() => 
    supabase.from(TABLE_NAME)
      .update(updatedData)
      .eq('id', id)
      .select()
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

async function getPopularTypes(limit = 5) {
  // Custom function to get most popular exercise types
  const { data: activities } = await supabase
    .from('activities')
    .select('type');
    
  // Count occurrences of each type
  const typeCounts = {};
  activities.forEach(activity => {
    if (activity.type) {
      typeCounts[activity.type] = (typeCounts[activity.type] || 0) + 1;
    }
  });
  
  // Convert to array and sort
  const popularTypes = Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
    
  return popularTypes;
}

module.exports = {
  getAll,
  get,
  create,
  update,
  remove,
  getPopularTypes
};
