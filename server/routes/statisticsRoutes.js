const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Routes for statistics - all protected by authentication
router.get('/global', authMiddleware, dataController.getGlobalStatistics);
router.get('/user/:userId', authMiddleware, dataController.getUserStatistics);

module.exports = router;
