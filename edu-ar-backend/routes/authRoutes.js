// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, getMe, updateMe, uploadAvatar } = require('../controllers/authController');
const { avatarUpload } = require('../middleware/upload');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.post('/avatar', protect, avatarUpload.single('avatar'), uploadAvatar);

module.exports = router;