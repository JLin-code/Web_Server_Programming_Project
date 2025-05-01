const express = require('express');
const model = require('../models/exerciseTypes');
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
    
    .get('/popular', async (req, res, next) => {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 5;
            const data = await model.getPopularTypes(limit);
            res.json({
                status: 'success',
                items: data,
                total: data.length
            });
        } catch (error) {
            next(error);
        }
    })
    
    .get('/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const data = await model.get(id);
            res.json({
                status: 'success',
                item: data
            });
        } catch (error) {
            next(error);
        }
    })
    
    .post('/', async (req, res, next) => {
        try {
            // Add the user ID as creator if authenticated
            const exerciseTypeData = {
                ...req.body,
                created_by: req.user ? req.user.id : null
            };

            // Only admin or specific roles can create public exercise types
            if (exerciseTypeData.is_public && (!req.user || !req.user.is_admin)) {
                exerciseTypeData.is_public = false;
            }
            
            const data = await model.create(exerciseTypeData);
            
            res.status(201).json({
                status: 'success',
                message: 'Exercise type created successfully',
                item: data
            });
        } catch (error) {
            next(error);
        }
    })
    
    .patch('/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            
            // First get the existing exercise type
            const existingType = await model.get(id);
            
            // Check if user has permission to update this exercise type
            if (req.user.id !== existingType.created_by && !req.user.is_admin) {
                throw new CustomError('You do not have permission to update this exercise type', statusCodes.FORBIDDEN);
            }
            
            const data = await model.update(id, req.body);
            
            res.json({
                status: 'success',
                message: 'Exercise type updated successfully',
                item: data
            });
        } catch (error) {
            next(error);
        }
    })
    
    .delete('/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            
            // First get the existing exercise type
            const existingType = await model.get(id);
            
            // Check if user has permission to delete this exercise type
            if (req.user.id !== existingType.created_by && !req.user.is_admin) {
                throw new CustomError('You do not have permission to delete this exercise type', statusCodes.FORBIDDEN);
            }
            
            await model.remove(id);
            
            res.json({
                status: 'success',
                message: 'Exercise type deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    });

module.exports = router;
