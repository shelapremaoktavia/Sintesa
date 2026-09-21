// controllers/assignmentController.js
// CRUD tugas (Assignment) per kelas. Guru membuat, siswa melihat tugas kelasnya.
const prisma = require('../config/db');

exports.createAssignment = async (req, res) => {
  try {
    const { title, description, classId, materialId, dueDate, points } = req.body;

    if (!title?.trim()) return res.status(400).json({ message: 'Judul tugas wajib diisi' });
    if (!classId) return res.status(400).json({ message: 'classId wajib diisi' });

    const targetClass = await prisma.class.findUnique({ where: { id: classId } });
    if (!targetClass) return res.status(404).json({ message: 'Kelas tidak ditemukan' });
    if (targetClass.teacherId !== req.user.userId) {
      return res.status(403).json({ message: 'Kamu bukan guru pemilik kelas ini' });
    }

    if (materialId) {
      const material = await prisma.material.findUnique({ where: { id: materialId } });
      if (!material) return res.status(404).json({ message: 'Materi tidak ditemukan' });
    }

    const assignment = await prisma.assignment.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        classId,
        materialId: materialId || null,
        teacherId: req.user.userId,
        dueDate: dueDate ? new Date(dueDate) : null,
        points: Number.isFinite(Number(points)) ? Math.max(10, Math.min(1000, Number(points))) : 100,
      },
      include: { class: { select: { id: true, name: true, code: true } }, material: { select: { id: true, title: true } } },
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat tugas', error: error.message });
  }
};

exports.getAssignmentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await prisma.class.findUnique({ where: { id: classId } });
    if (!classData) return res.status(404).json({ message: 'Kelas tidak ditemukan' });

    const isTeacher = classData.teacherId === req.user.userId;
    if (!isTeacher) {
      const enrollment = await prisma.classEnrollment.findUnique({
        where: { studentId_classId: { studentId: req.user.userId, classId } },
      });
      if (!enrollment) return res.status(403).json({ message: 'Kamu bukan anggota kelas ini' });
    }

    const assignments = await prisma.assignment.findMany({
      where: { classId },
      include: {
        material: { select: { id: true, title: true } },
        _count: { select: { submissions: true } },
        submissions: req.user.role === 'SISWA'
          ? { where: { studentId: req.user.userId }, orderBy: { createdAt: 'desc' } }
          : false,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil tugas', error: error.message });
  }
};

exports.getMyAssignments = async (req, res) => {
  // Untuk siswa: semua tugas dari kelas yang diikuti. Untuk guru: semua tugas buatannya.
  try {
    if (req.user.role === 'GURU') {
      const rows = await prisma.assignment.findMany({
        where: { teacherId: req.user.userId },
        include: {
          class: { select: { id: true, name: true, code: true } },
          material: { select: { id: true, title: true } },
          _count: { select: { submissions: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(rows);
    }

    const enrollments = await prisma.classEnrollment.findMany({
      where: { studentId: req.user.userId },
      select: { classId: true },
    });
    const classIds = enrollments.map((e) => e.classId);
    if (!classIds.length) return res.json([]);

    const rows = await prisma.assignment.findMany({
      where: { classId: { in: classIds } },
      include: {
        class: { select: { id: true, name: true, code: true } },
        material: { select: { id: true, title: true } },
        submissions: { where: { studentId: req.user.userId }, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil tugas', error: error.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await prisma.assignment.findUnique({ where: { id: req.params.id } });
    if (!assignment) return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    if (assignment.teacherId !== req.user.userId) {
      return res.status(403).json({ message: 'Hanya guru pembuat tugas yang boleh menghapus' });
    }
    await prisma.assignment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Tugas dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus tugas', error: error.message });
  }
};
