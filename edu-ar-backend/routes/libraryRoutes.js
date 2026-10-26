const express = require('express');
const router = express.Router();
const {
  uploadSubmission,
  getLibrary,
  getLibraryStats,
  deleteSubmission,
  gradeSubmission,
} = require('../controllers/libraryController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

router.post('/upload', protect, allowRoles('SISWA'), uploadSubmission);
router.get('/', protect, getLibrary);
router.get('/stats', protect, getLibraryStats);
router.delete('/:id', protect, deleteSubmission);
router.patch('/:id/grade', protect, allowRoles('GURU'), gradeSubmission);

module.exports = router;
