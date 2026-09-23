// controllers/authController.js
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { AVATAR_DIR } = require('../middleware/upload');

function publicUser(user) {
  if (!user) return user;
  return { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl || null };
}

// POST /api/auth/register — pendaftaran publik KHUSUS murid (SISWA).
// Akun guru hanya bisa dibuat oleh admin lewat /api/admin/teachers.
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'SISWA',
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registrasi berhasil',
      token,
      user: publicUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal registrasi', error: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: publicUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal login', error: error.message });
  }
};

// GET /api/auth/me — profil sendiri (tanpa password)
exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    res.json({ user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil profil', error: error.message });
  }
};

// POST /api/auth/avatar — unggah foto profil (multipart: avatar, maks 2 MB)
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File foto wajib diunggah' });

    const current = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!current) {
      fs.unlink(path.join(AVATAR_DIR, req.file.filename), () => {});
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    // Hapus foto lama agar folder avatars tidak menumpuk
    if (current.avatarUrl) {
      const oldName = current.avatarUrl.split('/').pop();
      if (oldName && oldName !== req.file.filename) {
        fs.unlink(path.join(AVATAR_DIR, oldName), () => {});
      }
    }

    const updated = await prisma.user.update({
      where: { id: req.user.userId },
      data: { avatarUrl: `/uploads/avatars/${req.file.filename}` },
    });

    res.json({ message: 'Foto profil diperbarui', user: publicUser(updated) });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengunggah foto profil', error: error.message });
  }
};