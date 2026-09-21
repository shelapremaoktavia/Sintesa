const prisma = require('../config/db');

exports.getAllMaterials = async (req, res) => {
  try {
    const { jenjang } = req.query;
    const materials = await prisma.material.findMany({
      where: jenjang ? { jenjang } : undefined,
      include: { subject: true, assets: true, class: { select: { id: true, name: true, code: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data materi', error: error.message });
  }
};

exports.getMaterialById = async (req, res) => {
  try {
    const material = await prisma.material.findUnique({
      where: { id: req.params.id },
      include: { subject: true, assets: true, class: { select: { id: true, name: true, code: true } } },
    });
    if (!material) {
      return res.status(404).json({ message: 'Materi tidak ditemukan' });
    }
    res.json(material);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil detail materi', error: error.message });
  }
};

exports.assignToClass = async (req, res) => {
  try {
    const { classId } = req.body;
    if (!classId) return res.status(400).json({ message: 'classId wajib diisi' });

    const targetClass = await prisma.class.findUnique({ where: { id: classId } });
    if (!targetClass) return res.status(404).json({ message: 'Kelas tidak ditemukan' });
    if (targetClass.teacherId !== req.user.userId) {
      return res.status(403).json({ message: 'Kamu bukan guru pemilik kelas ini' });
    }

    const material = await prisma.material.update({
      where: { id: req.params.id },
      data: { classId },
      include: { subject: true, assets: true, class: true },
    });
    res.json(material);
  } catch (error) {
    res.status(500).json({ message: 'Gagal menugaskan materi', error: error.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { completed = false } = req.body;
    const material = await prisma.material.findUnique({ where: { id: req.params.id } });

    if (!material) return res.status(404).json({ message: 'Materi tidak ditemukan' });
    if (!material.classId) {
      return res.status(400).json({ message: 'Materi ini belum dimasukkan ke kelas' });
    }

    const enrollment = await prisma.classEnrollment.findUnique({
      where: {
        studentId_classId: {
          studentId: req.user.userId,
          classId: material.classId,
        },
      },
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'Kamu belum bergabung di kelas materi ini' });
    }

    const progress = await prisma.studentProgress.upsert({
      where: {
        studentId_materialId: {
          studentId: req.user.userId,
          materialId: material.id,
        },
      },
      create: {
        studentId: req.user.userId,
        materialId: material.id,
        completed: Boolean(completed),
        viewedAt: new Date(),
      },
      update: {
        completed: Boolean(completed),
        viewedAt: new Date(),
      },
    });

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Gagal menyimpan progress', error: error.message });
  }
};
