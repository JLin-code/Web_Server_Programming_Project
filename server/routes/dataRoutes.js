const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const { authenticateJWT } = require('../middleware/auth');

// Secure all routes with JWT authentication
router.use(authenticateJWT);

// Activity routes
router.get('/activities', dataController.getAllActivities);
router.get('/users/:userId/activities', dataController.getUserActivities);
router.post('/activities', dataController.createActivity);
router.post('/activities/:activityId/comments', dataController.addComment);
router.post('/activities/:activityId/likes', dataController.likeActivity);

// Friend routes
router.get('/users/:userId/friends', dataController.getUserFriends);
router.get('/users/:userId/friends/activities', dataController.getFriendActivities);

module.exports = router;
