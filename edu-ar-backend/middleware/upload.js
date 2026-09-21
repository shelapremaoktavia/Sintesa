// middleware/upload.js
// Konfigurasi upload file Library (gambar, PDF, Word, dsb) memakai multer.
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIMES = new Set([
  // gambar
  'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml',
  // dokumen
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv',
  // arsip & media ringan
  'application/zip', 'application/x-zip-compressed',
  'video/mp4', 'audio/mpeg',
]);

const ALLOWED_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg',
  '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.csv',
  '.zip', '.mp4', '.mp3',
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = (file.originalname || 'file').replace(/[^a-zA-Z0-9.\-_ ]/g, '').slice(-80) || 'file';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safe}`;
    cb(null, unique);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (ALLOWED_MIMES.has(file.mimetype) || ALLOWED_EXT.has(ext)) return cb(null, true);
  cb(new Error('Tipe file tidak didukung. Gunakan gambar, PDF, Word, PPT, Excel, TXT, ZIP, MP4, atau MP3.'));
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
});

module.exports = { upload, UPLOAD_DIR, ALLOWED_EXT };

// ============ UPLOAD FOTO PROFIL (avatar, khusus gambar ringan) ============
const AVATAR_DIR = path.join(UPLOAD_DIR, 'avatars');

if (!fs.existsSync(AVATAR_DIR)) {
  fs.mkdirSync(AVATAR_DIR, { recursive: true });
}

const AVATAR_MIMES = new Set([
  'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif',
]);

const AVATAR_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, AVATAR_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    cb(null, `${req.user.userId}-${Date.now()}${ext}`);
  },
});

function avatarFilter(req, file, cb) {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (AVATAR_MIMES.has(file.mimetype) || AVATAR_EXT.has(ext)) return cb(null, true);
  cb(new Error('Foto profil harus gambar (PNG, JPG, WEBP, atau GIF).'));
}

const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: avatarFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

module.exports.avatarUpload = avatarUpload;
module.exports.AVATAR_DIR = AVATAR_DIR;

// ============ LAMPIRAN TUGAS GURU (PDF, video, gambar, dsb — opsional) ============
// Memakai whitelist yang sama dengan Library agar konsisten di seluruh aplikasi.
const TASK_DIR = path.join(UPLOAD_DIR, 'tasks');

if (!fs.existsSync(TASK_DIR)) {
  fs.mkdirSync(TASK_DIR, { recursive: true });
}

const taskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TASK_DIR),
  filename: (req, file, cb) => {
    const safe = (file.originalname || 'file').replace(/[^a-zA-Z0-9.\-_ ]/g, '').slice(-80) || 'file';
    cb(null, `tugas-${Date.now()}-${Math.round(Math.random() * 1e9)}-${safe}`);
  },
});

function taskFilter(req, file, cb) {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (ALLOWED_MIMES.has(file.mimetype) || ALLOWED_EXT.has(ext)) return cb(null, true);
  cb(new Error('Tipe file tidak didukung. Gunakan gambar, PDF, Word, PPT, Excel, TXT, ZIP, MP4, atau MP3.'));
}

const taskUpload = multer({
  storage: taskStorage,
  fileFilter: taskFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
});

module.exports.taskUpload = taskUpload;
module.exports.TASK_DIR = TASK_DIR;
