const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, deleteUserProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// /api/users/profile
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUserProfile);

module.exports = router;
