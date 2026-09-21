// controllers/gamificationController.js
// Menghitung XP, level, badge, dan leaderboard dari progress + submission.
// ATURAN XP (satu sumber kebenaran, selaras dengan frontend lib/gamification.js):
// - Materi selesai: +100 XP
// - Materi dilihat (belum selesai): +10 XP
// - Tugas guru dikumpulkan: +poin tugas (assignment.points, cth 150 XP) — dihitung
//   SEKALI per tugas agar upload berulang tidak farming XP.
// - Arsip Library mandiri (tanpa tugas): +0 XP (murni penyimpanan, tanpa XP).
const prisma = require('../config/db');

const XP_COMPLETED = 100;
const XP_VIEWED = 10;
const XP_LIBRARY_FILE = 0;
const DEFAULT_TASK_POINTS = 100;

function levelForXp(xp) {
  if (xp >= 1200) return { level: 6, title: 'Master AR', nextAt: null };
  if (xp >= 800) return { level: 5, title: 'Penjelajah Elite', nextAt: 1200 };
  if (xp >= 500) return { level: 4, title: 'Penjelajah Mahir', nextAt: 800 };
  if (xp >= 300) return { level: 3, title: 'Penjelajah Aktif', nextAt: 500 };
  if (xp >= 150) return { level: 2, title: 'Penjelajah Muda', nextAt: 300 };
  return { level: 1, title: 'Penjelajah Baru', nextAt: 150 };
}

function badgesFor({ completed, tasksDone = 0, submissions = 0, xp }) {
  const badges = [];
  if (completed >= 1) badges.push({ id: 'langkah-pertama', name: 'Langkah Pertama', icon: '🌱' });
  if (completed >= 3) badges.push({ id: 'penjelajah-3d', name: 'Penjelajah 3D', icon: '🧊' });
  if (completed >= 5) badges.push({ id: 'master-materi', name: 'Master Materi', icon: '🏆' });
  if (tasksDone >= 1) badges.push({ id: 'pengumpul-tugas', name: 'Pengumpul Tugas', icon: '📚' });
  if (tasksDone >= 3) badges.push({ id: 'pejuang-tugas', name: 'Pejuang Tugas', icon: '🗂️' });
  if (xp >= 500) badges.push({ id: 'bintang-ar', name: 'Bintang AR', icon: '⭐' });
  return badges;
}

async function buildStudentScore(studentId) {
  const [progress, submissions] = await Promise.all([
    prisma.studentProgress.findMany({ where: { studentId } }),
    prisma.submission.findMany({
      where: { studentId },
      select: { id: true, assignmentId: true, assignment: { select: { points: true } } },
    }),
  ]);
  const completed = progress.filter((p) => p.completed).length;
  const viewed = progress.length;

  // XP tugas: satu tugas dihitung sekali dengan poin dari guru.
  const seenTasks = new Map();
  let libraryFiles = 0;
  for (const s of submissions) {
    if (s.assignmentId) {
      if (!seenTasks.has(s.assignmentId)) {
        const pts = Number(s.assignment?.points);
        seenTasks.set(s.assignmentId, Number.isFinite(pts) ? pts : DEFAULT_TASK_POINTS);
      }
    } else {
      libraryFiles += 1;
    }
  }
  const tasksDone = seenTasks.size;
  const assignmentXP = [...seenTasks.values()].reduce((a, b) => a + b, 0);
  const libraryXP = libraryFiles * XP_LIBRARY_FILE;
  const taskFiles = submissions.filter((s) => s.assignmentId).length;

  const xp = completed * XP_COMPLETED + Math.max(0, viewed - completed) * XP_VIEWED + assignmentXP + libraryXP;
  return {
    completed,
    viewed,
    submissions: submissions.length,
    tasksDone,
    taskFiles,
    libraryFiles,
    assignmentXP,
    libraryXP,
    xp,
  };
}

// GET /api/gamification/me  (SISWA)
exports.getMyGamification = async (req, res) => {
  try {
    const score = await buildStudentScore(req.user.userId);
    const level = levelForXp(score.xp);
    const badges = badgesFor(score);
    res.json({ ...score, ...level, badges });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data gamifikasi', error: error.message });
  }
};

// GET /api/gamification/leaderboard  (public untuk landing, top 10)
exports.getLeaderboard = async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'SISWA' },
      select: { id: true, name: true },
      take: 50,
    });

    const scored = await Promise.all(
      students.map(async (s) => {
        const score = await buildStudentScore(s.id);
        return { id: s.id, name: s.name, ...score, ...levelForXp(score.xp) };
      })
    );

    scored.sort((a, b) => b.xp - a.xp);
    res.json(scored.slice(0, 10));
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil leaderboard', error: error.message });
  }
};

module.exports.levelForXp = levelForXp;
