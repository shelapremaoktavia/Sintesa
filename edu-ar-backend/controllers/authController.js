// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { verifyOwnedBlob, deleteBlobIfVercelUrl } = require('../services/blobStorage');

function publicUser(user) {
  if (!user) return user;
  return { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl || null };
}

const passwordResetRequests = new Map();
const PASSWORD_RESET_WINDOW_MS = 15 * 60 * 1000;
const PASSWORD_RESET_MAX_REQUESTS = 3;
const PASSWORD_RESET_RESPONSE = 'Jika email terdaftar, tautan reset akan dikirim.';

function consumePasswordResetAttempt(key) {
  const now = Date.now();
  const recent = (passwordResetRequests.get(key) || []).filter((time) => now - time < PASSWORD_RESET_WINDOW_MS);
  if (recent.length >= PASSWORD_RESET_MAX_REQUESTS) {
    passwordResetRequests.set(key, recent);
    return false;
  }
  recent.push(now);
  passwordResetRequests.set(key, recent);
  if (passwordResetRequests.size > 2000) {
    for (const [entryKey, times] of passwordResetRequests) {
      if (!times.some((time) => now - time < PASSWORD_RESET_WINDOW_MS)) passwordResetRequests.delete(entryKey);
    }
  }
  return true;
}

function escapeHtml(value) {
  const escaped = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(value).replace(/[&<>"']/g, (character) => escaped[character]);
}

// POST /api/auth/forgot-password — kirim tautan reset ke email akun.
exports.forgotPassword = async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Masukkan alamat email yang valid.' });
  }

  if (!process.env.JWT_SECRET || !process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
    return res.status(503).json({ message: 'Fitur lupa sandi belum diaktifkan. Hubungi administrator.' });
  }

  const ip = String(req.ip || req.socket?.remoteAddress || 'unknown');
  if (!consumePasswordResetAttempt('email:' + email) || !consumePasswordResetAttempt('ip:' + ip)) {
    return res.status(429).json({ message: 'Terlalu banyak permintaan. Coba lagi dalam 15 menit.' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    if (!user) return res.json({ message: PASSWORD_RESET_RESPONSE });

    const token = jwt.sign(
      { userId: user.id, purpose: 'password-reset', updatedAt: user.updatedAt.getTime() },
      process.env.JWT_SECRET,
      { expiresIn: '15m' },
    );
    const frontendUrl = (process.env.FRONTEND_URL || 'https://sintesa-chi.vercel.app').replace(/\/+$/, '');
    const resetUrl = new URL('/reset-password', frontendUrl);
    resetUrl.searchParams.set('token', token);
    const safeName = escapeHtml(user.name);
    const url = escapeHtml(resetUrl.toString());
    const html = '<p>Halo ' + safeName + ',</p>'
      + '<p>Kami menerima permintaan untuk mengatur ulang password akun Sintesa kamu.</p>'
      + '<p><a href="' + url + '">Buat password baru</a></p>'
      + '<p>Tautan berlaku selama 15 menit dan hanya dapat digunakan sekali. Abaikan email ini jika kamu tidak meminta reset password.</p>';
    const text = 'Halo ' + user.name + ', buka tautan berikut untuk membuat password baru: '
      + resetUrl.toString() + '\n\nTautan berlaku selama 15 menit dan hanya dapat digunakan sekali.';

    try {
      const mailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM,
          to: [user.email],
          subject: 'Atur ulang password Sintesa',
          html,
          text,
        }),
      });
      if (!mailResponse.ok) console.error('Password reset email provider returned status', mailResponse.status);
    } catch (mailError) {
      console.error('Password reset email could not be sent:', mailError.message);
    }
    return res.json({ message: PASSWORD_RESET_RESPONSE });
  } catch (error) {
    console.error('Password reset request failed:', error.message);
    return res.status(500).json({ message: 'Belum bisa memproses permintaan. Coba lagi nanti.' });
  }
};

// POST /api/auth/reset-password — token tanda tangan, 15 menit, sekali pakai.
exports.resetPassword = async (req, res) => {
  const token = String(req.body?.token || '');
  const password = String(req.body?.password || '');
  if (!token || token.length > 4096) {
    return res.status(400).json({ message: 'Tautan reset tidak valid atau sudah kedaluwarsa.' });
  }
  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ message: 'Password baru harus 8–72 byte.' });
  }
  if (!process.env.JWT_SECRET) {
    return res.status(503).json({ message: 'Layanan reset sandi belum siap. Hubungi administrator.' });
  }

  let claims;
  try {
    claims = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(400).json({ message: 'Tautan reset tidak valid atau sudah kedaluwarsa.' });
  }
  if (claims.purpose !== 'password-reset' || typeof claims.userId !== 'string' || !Number.isFinite(Number(claims.updatedAt))) {
    return res.status(400).json({ message: 'Tautan reset tidak valid atau sudah kedaluwarsa.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: claims.userId } });
    if (!user || user.updatedAt.getTime() !== Number(claims.updatedAt)) {
      return res.status(400).json({ message: 'Tautan reset tidak valid atau sudah digunakan. Minta tautan baru.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const updated = await prisma.user.updateMany({
      where: { id: user.id, updatedAt: user.updatedAt },
      data: { password: hashedPassword },
    });
    if (updated.count !== 1) {
      return res.status(400).json({ message: 'Tautan reset tidak valid atau sudah digunakan. Minta tautan baru.' });
    }
    return res.json({ message: 'Password berhasil diubah. Silakan masuk.' });
  } catch (error) {
    console.error('Password reset failed:', error.message);
    return res.status(500).json({ message: 'Belum bisa mengubah password. Coba lagi nanti.' });
  }
};

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

// PATCH /api/auth/me — ubah nama dan/atau password sendiri
exports.updateMe = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const data = {};

    if (name !== undefined) {
      if (!name?.trim()) return res.status(400).json({ message: 'Nama tidak boleh kosong' });
      data.name = name.trim().slice(0, 80);
    }

    if (newPassword !== undefined && newPassword !== '') {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Password lama wajib diisi untuk ganti password' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password baru minimal 6 karakter' });
      }
      const current = await prisma.user.findUnique({ where: { id: req.user.userId } });
      if (!current) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
      const ok = await bcrypt.compare(currentPassword, current.password);
      if (!ok) return res.status(401).json({ message: 'Password lama salah' });
      data.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Tidak ada perubahan' });
    }

    const updated = await prisma.user.update({ where: { id: req.user.userId }, data });
    res.json({ message: 'Profil diperbarui', user: publicUser(updated) });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui profil', error: error.message });
  }
};

// POST /api/auth/avatar — simpan metadata foto yang sudah diunggah ke Blob.
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.body?.file) return res.status(400).json({ message: 'File foto wajib diunggah' });

    const current = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!current) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });

    const blob = await verifyOwnedBlob(req.body.file, {
      userId: req.user.userId,
      scope: 'avatar',
    });
    const updated = await prisma.user.update({
      where: { id: req.user.userId },
      data: { avatarUrl: blob.url },
    });

    if (current.avatarUrl && current.avatarUrl !== blob.url) {
      await deleteBlobIfVercelUrl(current.avatarUrl);
    }
    res.json({ message: 'Foto profil diperbarui', user: publicUser(updated) });
  } catch (error) {
    res.status(error.status || 500).json({ message: 'Gagal mengunggah foto profil', error: error.message });
  }
};
