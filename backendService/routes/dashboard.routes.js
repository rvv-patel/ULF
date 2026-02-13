const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics and analytics
 * @access  Private
 */
router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;
