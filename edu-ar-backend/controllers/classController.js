const prisma = require('../config/db');

function generateClassCode() {
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `KELAS-${random}`;
}

exports.createClass = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Nama kelas wajib diisi' });
    }

    let code;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = generateClassCode();
      const existing = await prisma.class.findUnique({ where: { code: candidate } });
      if (!existing) {
        code = candidate;
        break;
      }
    }

    if (!code) {
      return res.status(500).json({ message: 'Gagal membuat kode kelas unik' });
    }

    const newClass = await prisma.class.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        code,
        teacherId: req.user.userId,
      },
    });

    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat kelas', error: error.message });
  }
};

exports.getMyClasses = async (req, res) => {
  try {
    const classes = await prisma.class.findMany({
      where: { teacherId: req.user.userId },
      include: {
        materials: { include: { subject: true, assets: true } },
        enrollments: { include: { student: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data kelas', error: error.message });
  }
};

exports.joinClass = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code?.trim()) {
      return res.status(400).json({ message: 'Kode kelas wajib diisi' });
    }

    const classData = await prisma.class.findUnique({
      where: { code: code.trim().toUpperCase() },
      select: { id: true, name: true, code: true },
    });

    if (!classData) {
      return res.status(404).json({ message: 'Kode kelas tidak ditemukan' });
    }

    const existing = await prisma.classEnrollment.findUnique({
      where: {
        studentId_classId: {
          studentId: req.user.userId,
          classId: classData.id,
        },
      },
    });

    if (existing) {
      return res.status(409).json({ message: 'Kamu sudah bergabung di kelas ini' });
    }

    await prisma.classEnrollment.create({
      data: { studentId: req.user.userId, classId: classData.id },
    });

    res.status(201).json({ message: `Berhasil bergabung ke kelas ${classData.name}`, class: classData });
  } catch (error) {
    res.status(500).json({ message: 'Gagal bergabung ke kelas', error: error.message });
  }
};

exports.getStudentClasses = async (req, res) => {
  try {
    const enrollments = await prisma.classEnrollment.findMany({
      where: { studentId: req.user.userId },
      include: {
        class: {
          include: {
            teacher: { select: { id: true, name: true } },
            materials: {
              include: { subject: true, assets: true },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    const materialIds = enrollments.flatMap((item) => item.class.materials.map((material) => material.id));
    const progressRows = materialIds.length
      ? await prisma.studentProgress.findMany({
          where: { studentId: req.user.userId, materialId: { in: materialIds } },
        })
      : [];

    const progressMap = new Map(progressRows.map((row) => [row.materialId, row]));

    const result = enrollments.map(({ class: classData, joinedAt }) => ({
      id: classData.id,
      name: classData.name,
      description: classData.description,
      code: classData.code,
      joinedAt,
      teacher: classData.teacher,
      materials: classData.materials.map((material) => ({
        ...material,
        progress: progressMap.get(material.id) || {
          completed: false,
          viewedAt: null,
        },
      })),
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil kelas siswa', error: error.message });
  }
};

exports.getClassById = async (req, res) => {
  try {
    const classData = await prisma.class.findUnique({
      where: { id: req.params.id },
      include: {
        materials: { include: { assets: true, subject: true }, orderBy: { createdAt: 'desc' } },
        enrollments: { include: { student: { select: { id: true, name: true, email: true } } } },
        teacher: { select: { id: true, name: true, email: true } },
      },
    });

    if (!classData) {
      return res.status(404).json({ message: 'Kelas tidak ditemukan' });
    }

    const isTeacher = classData.teacher.id === req.user.userId;
    const isStudent = await prisma.classEnrollment.findUnique({
      where: { studentId_classId: { studentId: req.user.userId, classId: classData.id } },
    });

    if (!isTeacher && !isStudent && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Kamu bukan anggota kelas ini' });
    }

    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil detail kelas', error: error.message });
  }
};
