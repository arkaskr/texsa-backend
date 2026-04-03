const express = require('express');
const router = express.Router();
const {
  submitLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} = require('../controllers/leaveController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, submitLeave);
router.get('/me', protect, getMyLeaves);
router.get('/all', protect, admin, getAllLeaves);
router.patch('/:id/status', protect, admin, updateLeaveStatus);

module.exports = router;
