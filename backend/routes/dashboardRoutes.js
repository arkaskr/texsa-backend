const express = require('express');
const router = express.Router();
const { getStats, getRecentActivities, getRecentSales } = require('../controllers/dashboardController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getStats);
router.get('/activities', protect, admin, getRecentActivities);
router.get('/sales', protect, admin, getRecentSales);

module.exports = router;
