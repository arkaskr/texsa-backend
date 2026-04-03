const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  createEmployee,
  createAdmin,
  getUsers,
  updateUser,
  deleteUser,
  updateUserProfile,
  updateUserPassword,
  updateFcmToken,
  getUserProfile,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/signup', registerUser);
router.post('/login', authUser);
router.post('/create-employee', protect, admin, createEmployee);
router.post('/create-admin', createAdmin);
router.get('/users', protect, admin, getUsers);
router.put('/users/:id', protect, admin, updateUser);
router.delete('/users/:id', protect, admin, deleteUser);

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, updateUserPassword);
router.put('/fcm-token', protect, updateFcmToken);

module.exports = router;
