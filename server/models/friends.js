const { CustomError, statusCodes } = require('./errors');
const { connect } = require('./supabase');

const TABLE_NAME = 'friends';

async function getFriends(userId) {
    // Query to get all friends of a user
    const { data, error } = await connect()
        .from(TABLE_NAME)
        .select('friend_id')
        .eq('user_id', userId);
    
    if (error) {
        throw new CustomError(error.message, statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    // Get the detailed user information for each friend
    const friendIds = data.map(f => f.friend_id);
    
    if (friendIds.length === 0) {
        return { items: [], total: 0 };
    }
    
    const { data: friends, error: friendsError } = await connect()
        .from('users')
        .select('*')
        .in('id', friendIds);
        
    if (friendsError) {
        throw new CustomError(friendsError.message, statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    return {
        items: friends,
        total: friends.length
    };
}

async function addFriend(userId, friendId) {
    // Check if users exist
    const { data: user } = await connect().from('users').select('id').eq('id', userId).single();
    const { data: friend } = await connect().from('users').select('id').eq('id', friendId).single();
    
    if (!user || !friend) {
        throw new CustomError('User or friend not found', statusCodes.NOT_FOUND);
    }
    
    // Check if already friends
    const { data: existing } = await connect()
        .from(TABLE_NAME)
        .select('*')
        .eq('user_id', userId)
        .eq('friend_id', friendId)
        .single();
    
    if (existing) {
        throw new CustomError('Already friends', statusCodes.BAD_REQUEST);
    }
    
    // Add friend relationship
    const { data, error } = await connect()
        .from(TABLE_NAME)
        .insert([{ user_id: userId, friend_id: friendId }])
        .select();
    
    if (error) {
        throw new CustomError(error.message, statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    return data[0];
}

async function removeFriend(userId, friendId) {
    const { data, error } = await connect()
        .from(TABLE_NAME)
        .delete()
        .eq('user_id', userId)
        .eq('friend_id', friendId)
        .select();
    
    if (error) {
        throw new CustomError(error.message, statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    if (!data || data.length === 0) {
        throw new CustomError('Friend relationship not found', statusCodes.NOT_FOUND);
    }
    
    return data[0];
}

module.exports = {
    getFriends,
    addFriend,
    removeFriend
};
