const express = require('express');
const router = express.Router();
const {
  assignTarget,
  getAllTargets,
  getMyTarget,
} = require('../controllers/targetController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/my', getMyTarget);

router.use(admin);

router.post('/', assignTarget);
router.get('/', getAllTargets);

module.exports = router;
