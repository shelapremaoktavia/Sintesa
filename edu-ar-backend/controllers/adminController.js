// controllers/adminController.js
// Khusus ADMIN: membuat akun guru & melihat daftar pengguna.
// Pendaftaran publik (/api/auth/register) selalu menjadi SISWA.
const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

function safeUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatarUrl: u.avatarUrl || null,
    createdAt: u.createdAt,
  };
}

// GET /api/admin/users — daftar semua pengguna (dengan hitungan kelas/tugas)
exports.listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { classesTaught: true, enrollments: true, submissions: true } },
      },
    });
    res.json(
      users.map((u) => ({
        ...safeUser(u),
        kelasDiajar: u._count.classesTaught,
        kelasDiikuti: u._count.enrollments,
        fileTerkumpul: u._count.submissions,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil daftar pengguna', error: error.message });
  }
};

// POST /api/admin/teachers — admin membuat akun guru
exports.createTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password guru wajib diisi' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.trim() } });
    if (existing) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = await prisma.user.create({
      data: { name: name.trim(), email: email.trim(), password: hashedPassword, role: 'GURU' },
    });

    res.status(201).json({ message: `Akun guru “${teacher.name}” dibuat`, user: safeUser(teacher) });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat akun guru', error: error.message });
  }
};
