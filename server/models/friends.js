const { CustomError, statusCodes } = require('./errors');
const { supabase, executeQuery } = require('./db');

const TABLE_NAME = 'friendships';

async function getFriends(userId) {
  // Get friend IDs
  const friendships = await executeQuery(() => 
    supabase.from(TABLE_NAME)
      .select('friend_id')
      .eq('user_id', userId)
  );
  
  if (!friendships || friendships.length === 0) {
    return [];
  }
  
  // Get full user data for each friend
  const friendIds = friendships.map(f => f.friend_id);
  
  return executeQuery(() => 
    supabase.from('users')
      .select('id, first_name, last_name, email, handle, created_at')
      .in('id', friendIds)
  );
}

async function addFriend(userId, friendId) {
  // Check if friendship already exists
  const existing = await executeQuery(() => 
    supabase.from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .eq('friend_id', friendId)
  );
  
  if (existing && existing.length > 0) {
    throw new CustomError('Friendship already exists', statusCodes.CONFLICT);
  }
  
  // Check that friend exists
  const friend = await executeQuery(() => 
    supabase.from('users')
      .select('id')
      .eq('id', friendId)
      .single()
  );
  
  if (!friend) {
    throw new CustomError('Friend not found', statusCodes.NOT_FOUND);
  }
  
  // Create friendship
  return executeQuery(() => 
    supabase.from(TABLE_NAME)
      .insert({
        user_id: userId,
        friend_id: friendId,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
  );
}

async function removeFriend(userId, friendId) {
  return executeQuery(() => 
    supabase.from(TABLE_NAME)
      .delete()
      .eq('user_id', userId)
      .eq('friend_id', friendId)
  );
}

module.exports = {
  getFriends,
  addFriend,
  removeFriend
};
