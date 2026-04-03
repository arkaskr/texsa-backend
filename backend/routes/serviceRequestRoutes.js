const express = require('express');
const router = express.Router();
const {
  createServiceRequest,
  getMyServiceRequests,
  getAllServiceRequests,
  assignServiceRequest,
  getEmployeeServiceRequests,
  updateServiceRequestStatus,
  verifyServiceRequest,
} = require('../controllers/serviceRequestController');
const { protect, admin } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.route('/')
  .post(protect, createServiceRequest)
  .get(protect, admin, getAllServiceRequests);

router.get('/my', protect, getMyServiceRequests);
router.get('/employee', protect, getEmployeeServiceRequests);

router.put('/:id/assign', protect, admin, assignServiceRequest);
router.put('/:id/status', protect, upload.fields([
  { name: 'failureImage', maxCount: 1 },
  { name: 'receiptImage', maxCount: 1 },
  { name: 'productImages', maxCount: 2 }
]), updateServiceRequestStatus);
router.put('/:id/verify', protect, admin, verifyServiceRequest);

module.exports = router;
