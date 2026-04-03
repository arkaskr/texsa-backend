const express = require('express');
const router = express.Router();
const { getDashboardAnalytics, getEmployeeReport } = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, admin, getDashboardAnalytics);
router.get('/employee-report/:employeeId', protect, admin, getEmployeeReport);

module.exports = router;
