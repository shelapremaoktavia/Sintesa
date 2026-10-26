// Express entry point for local development and Vercel Functions.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./config/db');
const materialRoutes = require('./routes/materialRoutes');
const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const gamificationRoutes = require('./routes/gamificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const { protect, allowRoles } = require('./middleware/authMiddleware');
const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, '');
const allowedOrigins = new Set([
  ...(process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean),
  // Keep the production frontend explicit; do not allow arbitrary *.vercel.app origins.
  'https://sintesa-chi.vercel.app',
]);

if (!process.env.JWT_SECRET) {
  const message = 'JWT_SECRET wajib diatur sebelum auth dapat digunakan.';
  if (process.env.NODE_ENV === 'production') throw new Error(message);
  console.warn('⚠️  ' + message);
}

app.set('trust proxy', 1);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(normalizeOrigin(origin))) return callback(null, true);
    return callback(new Error('Origin tidak diizinkan oleh CORS'));
  },
}));
app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
  res.send('Backend Sintesa berjalan! 🚀');
});

app.use('/api/materials', materialRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);

app.get('/test-db', protect, allowRoles('ADMIN'), async (req, res) => {
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

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'Ukuran file melebihi batas' });
  }
  if (err) {
    return res.status(err.status || 400).json({
      message: err.message || 'Terjadi kesalahan pada server',
    });
  }
  return next();
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('Server berjalan di http://localhost:' + PORT);
  });
}

module.exports = app;
