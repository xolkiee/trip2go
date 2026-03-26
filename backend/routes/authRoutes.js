const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword, resetPassword } = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// PUT /api/auth/reset-password
router.put('/reset-password', resetPassword);

module.exports = router;
