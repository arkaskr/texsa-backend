const express = require('express');
const router = express.Router();
const {
  markAttendance,
  checkTodayAttendance,
  getAllAttendance,
  getUserAttendance,
} = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, markAttendance);
router.get('/today', protect, checkTodayAttendance);
router.get('/all', protect, admin, getAllAttendance);
router.get('/user/:userId', protect, getUserAttendance);

module.exports = router;
