// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Memastikan request punya token JWT yang valid (artinya: sudah login)
exports.protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Tidak ada token, akses ditolak' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // isinya: { userId, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token tidak valid atau sudah kedaluwarsa' });
  }
};

// Dipakai SETELAH "protect" — membatasi endpoint hanya untuk role tertentu.
// Contoh pemakaian: protect, allowRoles('GURU')
exports.allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Anda tidak punya akses ke fitur ini' });
    }
    next();
  };
};