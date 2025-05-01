const express = require('express');
const model = require('../models/users');
const { CustomError, statusCodes } = require('../models/errors');
const router = express.Router();

router
  .get('/', async (req, res, next) => {
    try {
      // Admin-only endpoint or include filtering to show only public profiles
      if (!req.user.is_admin) {
        // Regular users can only see limited user information
        const data = await model.getAll();
        // Filter out sensitive info for non-admins
        const filteredData = data.map(user => ({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          handle: user.handle,
          created_at: user.created_at
        }));
        
        return res.json({
          status: 'success',
          items: filteredData,
          total: filteredData.length
        });
      }
      
      const data = await model.getAll();
      res.json({
        status: 'success',
        items: data,
        total: data.length
      });
    } catch (error) {
      next(error);
    }
  })
  
  .get('/stats/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Users can only view their own stats unless they're admin
      if (req.user.id !== id && !req.user.is_admin) {
        throw new CustomError('Permission denied', statusCodes.FORBIDDEN);
      }
      
      const stats = await model.getUserStats(id);
      res.json({
        status: 'success',
        item: stats
      });
    } catch (error) {
      next(error);
    }
  })
  
  .get('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await model.get(id);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json({
        status: 'success',
        item: userWithoutPassword
      });
    } catch (error) {
      next(error);
    }
  })
  
  .post('/', async (req, res, next) => {
    try {
      // Only admins can create users through this endpoint
      if (!req.user.is_admin) {
        throw new CustomError('Admin access required', statusCodes.FORBIDDEN);
      }
      
      const newUser = await model.create(req.body);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json({
        status: 'success',
        message: 'User created successfully',
        item: userWithoutPassword
      });
    } catch (error) {
      next(error);
    }
  })
  
  .patch('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Users can only update their own profile unless they're admin
      if (req.user.id !== id && !req.user.is_admin) {
        throw new CustomError('Permission denied', statusCodes.FORBIDDEN);
      }
      
      const updatedUser = await model.update(id, req.body);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json({
        status: 'success',
        message: 'User updated successfully',
        item: userWithoutPassword
      });
    } catch (error) {
      next(error);
    }
  })
  
  .patch('/:id/password', async (req, res, next) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      
      // Users can only update their own password unless they're admin
      if (req.user.id !== id && !req.user.is_admin) {
        throw new CustomError('Permission denied', statusCodes.FORBIDDEN);
      }
      
      if (!newPassword || newPassword.length < 6) {
        throw new CustomError('Password must be at least 6 characters', statusCodes.BAD_REQUEST);
      }
      
      await model.updatePassword(id, newPassword);
      
      res.json({
        status: 'success',
        message: 'Password updated successfully'
      });
    } catch (error) {
      next(error);
    }
  })
  
  .delete('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Users can only delete their own account unless they're admin
      if (req.user.id !== id && !req.user.is_admin) {
        throw new CustomError('Permission denied', statusCodes.FORBIDDEN);
      }
      
      await model.remove(id);
      
      res.json({
        status: 'success',
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  });

module.exports = router;