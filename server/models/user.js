const { supabase } = require('../utils/supabaseClient');
const DEBUG = process.env.DEBUG_DATABASE_QUERIES === 'true';

const userModel = {
  /**
   * Get all users from the database
   * @returns {Promise<Array>} List of users
   */
  async getAll() {
    if (DEBUG) console.log('[User Model] Getting all users');
    
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, profile_picture_url, created_at');
      
    if (error) {
      console.error('[User Model] Database error in getAll:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (DEBUG) console.log(`[User Model] Retrieved ${data?.length || 0} users`);
    return data;
  },

  /**
   * Get a user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} User data
   */
  async getById(id) {
    if (DEBUG) console.log(`[User Model] Getting user by ID: ${id}`);
    
    if (id === 'current') {
      console.warn('[User Model] Attempted to get user with ID "current" - this should be handled by the auth controller');
      return null;
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, profile_picture_url, created_at')
      .eq('id', id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`[User Model] No user found with ID: ${id}`);
        return null; // No match found
      }
      console.error(`[User Model] Database error getting user ${id}:`, error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (DEBUG && data) console.log(`[User Model] Retrieved user: ${data.first_name} ${data.last_name}`);
    return data;
  },

  /**
   * Get a user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User data
   */
  async getByEmail(email) {
    if (DEBUG) console.log(`[User Model] Getting user by email: ${email}`);
    
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, profile_picture_url, created_at')
      .eq('email', email)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`[User Model] No user found with email: ${email}`);
        return null; // No match found
      }
      console.error(`[User Model] Database error getting user by email ${email}:`, error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (DEBUG && data) console.log(`[User Model] Retrieved user by email: ${data.first_name} ${data.last_name}`);
    return data;
  },

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async create(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        password_hash: userData.password_hash,
        role: userData.role || 'user'
      }])
      .select()
      .single();
      
    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return data;
  },

  /**
   * Update user data
   * @param {string} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user
   */
  async update(id, userData) {
    try {
      // Filter out any undefined values
      const updateData = Object.fromEntries(
        Object.entries(userData).filter(([_, v]) => v !== undefined)
      );
      
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw new Error(`Failed to update user: ${error.message}`);
      
      if (DEBUG) console.log(`[User Model] Updated user: ${id}`);
      return data;
    } catch (err) {
      console.error(`[User Model] Error updating user ${id}:`, err);
      throw err;
    }
  },

  /**
   * Change user role
   * @param {string} id - User ID
   * @param {string} role - New role ('user' or 'admin')
   * @returns {Promise<Object>} Updated user
   */
  async changeRole(id, role) {
    if (role !== 'user' && role !== 'admin') {
      throw new Error('Invalid role. Must be "user" or "admin"');
    }
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw new Error(`Failed to change user role: ${error.message}`);
      
      if (DEBUG) console.log(`[User Model] Changed user role: ${id} to ${role}`);
      return data;
    } catch (err) {
      console.error(`[User Model] Error changing role for user ${id}:`, err);
      throw err;
    }
  },

  /**
   * Delete a user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
        
      if (error) throw new Error(`Failed to delete user: ${error.message}`);
      
      if (DEBUG) console.log(`[User Model] Deleted user: ${id}`);
      return true;
    } catch (err) {
      console.error(`[User Model] Error deleting user ${id}:`, err);
      throw err;
    }
  },
  
  /**
   * Get user statistics
   * @param {string} id - User ID
   * @returns {Promise<Object>} User statistics
   */
  async getStatistics(id) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_statistics_with_periods', { user_id_param: id });
        
      if (error) throw new Error(`Failed to get user statistics: ${error.message}`);
      
      if (DEBUG) console.log(`[User Model] Retrieved statistics for user: ${id}`);
      return data || {
        user: {},
        today: {},
        week: {},
        month: {},
        all_time: {}
      };
    } catch (err) {
      console.error(`[User Model] Error getting statistics for user ${id}:`, err);
      // Return empty data rather than throwing to prevent UI breaks
      return {
        user: {},
        today: {},
        week: {},
        month: {},
        all_time: {}
      };
    }
  },
  
  /**
   * Get global platform statistics
   * @returns {Promise<Object>} Global statistics
   */
  async getGlobalStatistics() {
    try {
      const { data, error } = await supabase
        .rpc('get_global_statistics_with_periods');
        
      if (error) throw new Error(`Failed to get global statistics: ${error.message}`);
      
      if (DEBUG) console.log('[User Model] Retrieved global statistics');
      return data || {
        total_users: 0,
        periods: {
          today: { activities: 0, comments: 0, likes: 0 },
          week: { activities: 0, comments: 0, likes: 0 },
          month: { activities: 0, comments: 0, likes: 0 },
          all_time: { activities: 0, comments: 0, likes: 0 }
        },
        activity_type_distribution: {}
      };
    } catch (err) {
      console.error('[User Model] Error getting global statistics:', err);
      // Return empty data rather than throwing to prevent UI breaks
      return {
        total_users: 0,
        periods: {
          today: { activities: 0, comments: 0, likes: 0 },
          week: { activities: 0, comments: 0, likes: 0 },
          month: { activities: 0, comments: 0, likes: 0 },
          all_time: { activities: 0, comments: 0, likes: 0 }
        },
        activity_type_distribution: {}
      };
    }
  }
};

module.exports = userModel;
