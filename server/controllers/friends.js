const express = require('express');
const model = require('../models/friends');
const { CustomError, statusCodes } = require('../models/errors');
const router = express.Router();

router
  .get('/', async (req, res, next) => {
    try {
      // User can only get their own friends
      const userId = req.user.id;
      const data = await model.getFriends(userId);
      
      res.json({
        status: 'success',
        items: data,
        total: data.length
      });
    } catch (error) {
      next(error);
    }
  })
  
  .post('/add/:friendId', async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { friendId } = req.params;
      
      // Prevent users from adding themselves
      if (userId === friendId) {
        throw new CustomError('Cannot add yourself as a friend', statusCodes.BAD_REQUEST);
      }
      
      const data = await model.addFriend(userId, friendId);
      
      res.status(201).json({
        status: 'success',
        message: 'Friend added successfully',
        item: data
      });
    } catch (error) {
      next(error);
    }
  })
  
  .delete('/remove/:friendId', async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { friendId } = req.params;
      
      await model.removeFriend(userId, friendId);
      
      res.json({
        status: 'success',
        message: 'Friend removed successfully'
      });
    } catch (error) {
      next(error);
    }
  });

module.exports = router;
