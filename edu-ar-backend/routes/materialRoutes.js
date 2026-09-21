const express = require('express');
const router = express.Router();
const {
  getAllMaterials,
  getMaterialById,
  assignToClass,
  updateProgress,
} = require('../controllers/materialController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

router.get('/', getAllMaterials);
router.get('/:id', getMaterialById);
router.patch('/:id/assign', protect, allowRoles('GURU'), assignToClass);
router.patch('/:id/progress', protect, allowRoles('SISWA'), updateProgress);

module.exports = router;
