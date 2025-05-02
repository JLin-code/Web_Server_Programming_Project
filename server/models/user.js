const { supabase } = require('../utils/supabaseClient');

const userModel = {
  /**
   * Get all users from the database
   * @returns {Promise<Array>} List of users
   */
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role, created_at')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  /**
   * Get a user by ID
   * @param {string|number} id - User ID
   * @returns {Promise<Object>} User data
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role, created_at')
      .eq('id', id)
      .single();
    
    if (error) throw error;
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
    
    if (error) throw error;
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
      .insert([userData])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  /**
   * Update user data
   * @param {string|number} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user
   */
  async update(id, userData) {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  /**
   * Delete a user
   * @param {string|number} id - User ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  /**
   * Get user activities
   * @param {string|number} userId - User ID
   * @returns {Promise<Array>} User activities
   */
  async getUserActivities(userId) {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        user:user_id (
          id, first_name, last_name, email, role
        ),
        comments:activity_comments (
          id, user_id, comment, created_at,
          user:user_id (
            id, first_name, last_name
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  /**
   * Change user role
   * @param {string|number} userId - User ID
   * @param {string} role - New role ('user' or 'admin')
   * @returns {Promise<Object>} Updated user
   */
  async changeRole(userId, role) {
    if (role !== 'user' && role !== 'admin') {
      throw new Error('Invalid role specified');
    }
    
    return this.update(userId, { role });
  }
};

module.exports = userModel;
