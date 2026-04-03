const express = require('express');
const router = express.Router();
const {
  getProducts,
  createProduct,
  createBulkProducts,
  updateProduct,
  deleteProduct,
  markProductAsSold,
  getSoldProducts,
  markProductsAsSoldBulk
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getProducts);
router.get('/sold', protect, admin, getSoldProducts);
router.post('/', protect, admin, createProduct);
router.post('/bulk', protect, admin, createBulkProducts);
router.post('/:id/sold', protect, admin, markProductAsSold);
router.post('/sold-bulk', protect, admin, markProductsAsSoldBulk);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
