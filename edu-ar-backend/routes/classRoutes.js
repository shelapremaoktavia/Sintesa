const express = require('express');
const router = express.Router();
const {
  createClass,
  getMyClasses,
  joinClass,
  getStudentClasses,
  getClassById,
} = require('../controllers/classController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

router.post('/', protect, allowRoles('GURU'), createClass);
router.get('/my-classes', protect, allowRoles('GURU'), getMyClasses);
router.post('/join', protect, allowRoles('SISWA'), joinClass);
router.get('/student-classes', protect, allowRoles('SISWA'), getStudentClasses);
router.get('/:id', protect, getClassById);

module.exports = router;
