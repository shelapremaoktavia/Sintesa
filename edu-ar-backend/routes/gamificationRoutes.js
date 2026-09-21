const express = require('express');
const router = express.Router();
const { getMyGamification, getLeaderboard } = require('../controllers/gamificationController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

router.get('/leaderboard', getLeaderboard);
router.get('/me', protect, allowRoles('SISWA'), getMyGamification);

module.exports = router;
