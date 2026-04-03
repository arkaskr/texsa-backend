const express = require('express');
const router = express.Router();
const {
  createSale,
  getMySales,
  checkModelStatus,
  getEmployeeStock,
} = require('../controllers/saleController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createSale);
router.get('/my', protect, getMySales);
router.get('/check-model/:modelNumber', protect, checkModelStatus);
router.get('/employee-stock', protect, getEmployeeStock);

module.exports = router;
