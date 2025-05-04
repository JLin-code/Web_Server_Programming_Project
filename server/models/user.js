const { supabase } = require('../utils/supabaseClient');

const userModel = {
  /**
   * Get all users from the database
   * @returns {Promise<Array>} List of users
   */
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, created_at');
      
    if (error) throw new Error(`Database error: ${error.message}`);
    return data;
  },

  /**
   * Get a user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} User data
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, created_at')
      .eq('id', id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No match found
      }
      throw new Error(`Database error: ${error.message}`);
    }
    
    return data;
  },

  /**
   * Get a user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User data
   */
  async getByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No match found
      }
      throw new Error(`Database error: ${error.message}`);
    }
    
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
    return data;
  },

  /**
   * Delete a user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
      
    if (error) throw new Error(`Failed to delete user: ${error.message}`);
    return true;
  },
  
  /**
   * Get user statistics
   * @param {string} id - User ID
   * @returns {Promise<Object>} User statistics
   */
  async getStatistics(id) {
    const { data, error } = await supabase
      .rpc('get_user_statistics_with_periods', { user_id_param: id });
      
    if (error) throw new Error(`Failed to get user statistics: ${error.message}`);
    return data;
  },
  
  /**
   * Get global platform statistics
   * @returns {Promise<Object>} Global statistics
   */
  async getGlobalStatistics() {
    const { data, error } = await supabase
      .rpc('get_global_statistics_with_periods');
      
    if (error) throw new Error(`Failed to get global statistics: ${error.message}`);
    return data;
  }
};

module.exports = userModel;
