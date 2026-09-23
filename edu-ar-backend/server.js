// server.js
// Titik masuk (entry point) backend. Jalankan dengan: npm run dev

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const prisma = require('./config/db');
const materialRoutes = require('./routes/materialRoutes');
const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const gamificationRoutes = require('./routes/gamificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET belum diisi di .env — auth (login/register) akan gagal. Salin dari .env.example.');
}

// Middleware dasar
app.use(cors());          // supaya frontend (localhost:3000) boleh akses backend ini
app.use(express.json());  // supaya Express bisa baca body JSON dari request

// Folder upload library (gambar, PDF, Word, dsb) disajikan statis
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// Route paling sederhana — untuk mengecek server hidup
app.get('/', (req, res) => {
  res.send('Backend Sintesa berjalan! 🚀');
});

// Semua endpoint terkait materi pembelajaran, mis:
// GET /api/materials             -> daftar semua materi
// GET /api/materials/:id         -> detail satu materi
// PATCH /api/materials/:id/assign -> tugaskan materi ke kelas (khusus GURU)
app.use('/api/materials', materialRoutes);

// Endpoint autentikasi: /api/auth/register dan /api/auth/login
app.use('/api/auth', authRoutes);

// Endpoint kelas: buat kelas, lihat kelas milik guru, detail kelas
app.use('/api/classes', classRoutes);

// Endpoint tugas: guru membuat tugas per kelas, siswa melihat tugas kelasnya
// POST /api/assignments, GET /api/assignments/my, GET /api/assignments/class/:classId
app.use('/api/assignments', assignmentRoutes);

// Endpoint library: upload & kelola hasil tugas (gambar, PDF, Word, dsb)
// POST /api/library/upload, GET /api/library, GET /api/library/stats
app.use('/api/library', libraryRoutes);

// Endpoint gamifikasi: XP, level, badge, leaderboard
// GET /api/gamification/me, GET /api/gamification/leaderboard
app.use('/api/gamification', gamificationRoutes);

// Endpoint admin: kelola akun guru (khusus role ADMIN)
// GET /api/admin/users, POST /api/admin/teachers
app.use('/api/admin', adminRoutes);

// Route untuk mengecek koneksi ke database Neon/PostgreSQL lewat Prisma.
app.get('/test-db', async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany();
    res.json({
      message: 'Koneksi ke database berhasil! ✅',
      jumlahSubject: subjects.length,
      data: subjects,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal konek ke database ❌',
      error: error.message,
    });
  }
});

// 404 JSON untuk path /api yang tidak dikenal (mencegah respons HTML kosong)
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

const PORT = process.env.PORT || 5000;

// Penanganan error terpusat (termasuk error upload multer) agar respons selalu JSON.
// WAJIB didaftarkan sebelum app.listen agar semua request melewatinya.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'Ukuran file maksimal 15 MB' });
  }
  if (err) {
    return res.status(400).json({ message: err.message || 'Terjadi kesalahan pada server' });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});