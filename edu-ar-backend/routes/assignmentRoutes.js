const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getAssignmentsByClass,
  getMyAssignments,
  deleteAssignment,
} = require('../controllers/assignmentController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

router.post('/', protect, allowRoles('GURU'), createAssignment);
router.get('/my', protect, getMyAssignments);
router.get('/class/:classId', protect, getAssignmentsByClass);
router.delete('/:id', protect, allowRoles('GURU'), deleteAssignment);

module.exports = router;
