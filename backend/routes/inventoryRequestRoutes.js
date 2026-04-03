const express = require('express');
const router = express.Router();
const {
  createInventoryRequest,
  getInventoryRequests,
  getUserInventoryRequests,
  updateInventoryRequestStatus,
} = require('../controllers/inventoryRequestController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, createInventoryRequest);
router.get('/my', protect, getUserInventoryRequests);
router.get('/', protect, admin, getInventoryRequests);
router.put('/:id', protect, admin, updateInventoryRequestStatus);

module.exports = router;
