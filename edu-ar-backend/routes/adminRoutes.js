// routes/adminRoutes.js — endpoint khusus ADMIN
const express = require('express');
const router = express.Router();
const { listUsers, createTeacher } = require('../controllers/adminController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

router.use(protect, allowRoles('ADMIN'));

router.get('/users', listUsers);
router.post('/teachers', createTeacher);

module.exports = router;
