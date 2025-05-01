const express = require('express');
const model = require('../models/activities');
const { CustomError, statusCodes } = require('../models/errors');
const router = express.Router();

router
    .get('/', async (req, res, next) => {
        try {
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
    
    .get('/user/:userId', async (req, res, next) => {
        try {
            const { userId } = req.params;
            
            // Security check - users can only see their own activities unless they're admin
            if (userId !== req.user.id && !req.user.is_admin) {
                throw new CustomError('You do not have permission to view this user\'s activities', statusCodes.FORBIDDEN);
            }
            
            const data = await model.getByUserId(userId);
            res.json({
                status: 'success',
                items: data,
                total: data.length
            });
        } catch (error) {
            next(error);
        }
    })
    
    .get('/friends', async (req, res, next) => {
        try {
            const data = await model.getFriendActivities(req.user.id);
            res.json({
                status: 'success',
                items: data,
                total: data.length
            });
        } catch (error) {
            next(error);
        }
    })
    
    .get('/stats/:period?', async (req, res, next) => {
        try {
            const { period = 'week' } = req.params;
            const data = await model.getActivityStats(req.user.id, period);
            res.json({
                status: 'success',
                item: data
            });
        } catch (error) {
            next(error);
        }
    })
    
    .get('/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const activity = await model.get(id);
            
            // Security check - users can see their own activities or their friends' activities
            if (activity.user_id !== req.user.id) {
                const friendActivities = await model.getFriendActivities(req.user.id);
                const isFriendActivity = friendActivities.some(a => a.id === parseInt(id));
                
                if (!isFriendActivity && !req.user.is_admin) {
                    throw new CustomError('You do not have permission to view this activity', statusCodes.FORBIDDEN);
                }
            }
            
            res.json({
                status: 'success',
                item: activity
            });
        } catch (error) {
            next(error);
        }
    })
    
    .post('/', async (req, res, next) => {
        try {
            // Add the current user's ID from JWT token
            const activityData = {
                ...req.body,
                user_id: req.user.id
            };
            
            const data = await model.create(activityData);
            
            res.status(201).json({
                status: 'success',
                message: 'Activity created successfully',
                item: data
            });
        } catch (error) {
            next(error);
        }
    })
    
    .patch('/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            
            // First get the existing activity
            const existingActivity = await model.get(id);
            
            // Check if user has permission to update this activity
            if (req.user.id !== existingActivity.user_id && !req.user.is_admin) {
                throw new CustomError('You do not have permission to update this activity', statusCodes.FORBIDDEN);
            }
            
            const data = await model.update(id, req.body);
            
            res.json({
                status: 'success',
                message: 'Activity updated successfully',
                item: data
            });
        } catch (error) {
            next(error);
        }
    })
    
    .delete('/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            
            // First get the existing activity
            const existingActivity = await model.get(id);
            
            // Check if user has permission to delete this activity
            if (req.user.id !== existingActivity.user_id && !req.user.is_admin) {
                throw new CustomError('You do not have permission to delete this activity', statusCodes.FORBIDDEN);
            }
            
            await model.remove(id);
            
            res.json({
                status: 'success',
                message: 'Activity deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    });

module.exports = router;
