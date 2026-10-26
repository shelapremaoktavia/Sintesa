// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, getMe, updateMe, uploadAvatar } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.post('/avatar', protect, uploadAvatar);

module.exports = router;
