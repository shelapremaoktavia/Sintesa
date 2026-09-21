// lib/gamification.js
// Aturan gamifikasi terpusat: XP, level, badge. Selaras dengan backend
// (controllers/gamificationController.js) agar HOME, dashboard, dan materi konsisten.
//
// ATURAN:
// - Materi selesai: +100 XP · dilihat: +10 XP
// - Tugas guru: +poin tugas (assignment.points), dihitung SEKALI per tugas
// - Arsip Library mandiri: +0 XP (murni penyimpanan, tanpa XP)
import { apiFetch } from './api';

export const XP_RULES = {
  materialCompleted: 100,
  materialViewed: 10,
  libraryFile: 0,
  defaultTaskPoints: 100,
};

export const LEVELS = [
  { level: 1, title: 'Penjelajah Baru', minXp: 0, nextAt: 150, icon: '🌱' },
  { level: 2, title: 'Penjelajah Muda', minXp: 150, nextAt: 300, icon: '🧭' },
  { level: 3, title: 'Penjelajah Aktif', minXp: 300, nextAt: 500, icon: '🚀' },
  { level: 4, title: 'Penjelajah Mahir', minXp: 500, nextAt: 800, icon: '🧊' },
  { level: 5, title: 'Penjelajah Elite', minXp: 800, nextAt: 1200, icon: '⭐' },
  { level: 6, title: 'Master AR', minXp: 1200, nextAt: null, icon: '🏆' },
];

export function levelForXp(xp = 0) {
  const value = Number(xp) || 0;
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (value >= lvl.minXp) current = lvl;
  }
  const progress = current.nextAt
    ? Math.min(100, Math.round(((value - current.minXp) / (current.nextAt - current.minXp)) * 100))
    : 100;
  return { ...current, xp: value, progress };
}

export function xpFromProgress(materials = [], submissionCount = 0) {
  // Arsip tidak memberi XP; parameter dipertahankan agar kompatibel.
  void submissionCount;
  const completed = materials.filter((m) => m?.progress?.completed).length;
  const viewed = materials.filter((m) => m?.progress?.viewedAt).length;
  const xp =
    completed * XP_RULES.materialCompleted +
    Math.max(0, viewed - completed) * XP_RULES.materialViewed;
  return { xp, completed, viewed, ...levelForXp(xp) };
}

/**
 * Hitung XP lokal dari materi + daftar tugas. Arsip Library (+0 XP) diabaikan.
 * - assignments: array dari /assignments/my (siswa) — tugas dianggap selesai
 *   bila submissions.length > 0, XP = points (sekali per tugas).
 * - archiveCount: hanya untuk info tampilan, tidak menambah XP.
 */
export function xpFromTasks(materials = [], assignments = [], archiveCount = 0) {
  const completed = materials.filter((m) => m?.progress?.completed).length;
  const viewed = materials.filter((m) => m?.progress?.viewedAt).length;
  const tasksDone = assignments.filter((a) => a?.submissions?.length > 0).length;
  const assignmentXP = assignments.reduce((sum, a) => {
    if (!a?.submissions?.length) return sum;
    const pts = Number(a.points);
    return sum + (Number.isFinite(pts) ? pts : XP_RULES.defaultTaskPoints);
  }, 0);
  const libraryXP = 0;
  void archiveCount;
  const xp =
    completed * XP_RULES.materialCompleted +
    Math.max(0, viewed - completed) * XP_RULES.materialViewed +
    assignmentXP +
    libraryXP;
  return { xp, completed, viewed, tasksDone, assignmentXP, libraryXP, ...levelForXp(xp) };
}

export const BADGES = [
  { id: 'langkah-pertama', name: 'Langkah Pertama', icon: '🌱', hint: 'Selesaikan 1 materi' },
  { id: 'penjelajah-3d', name: 'Penjelajah 3D', icon: '🧊', hint: 'Selesaikan 3 materi' },
  { id: 'master-materi', name: 'Master Materi', icon: '🏆', hint: 'Selesaikan 5 materi' },
  { id: 'pengumpul-tugas', name: 'Pengumpul Tugas', icon: '📚', hint: 'Kumpulkan 1 tugas guru' },
  { id: 'pejuang-tugas', name: 'Pejuang Tugas', icon: '🗂️', hint: 'Kumpulkan 3 tugas guru' },
  { id: 'bintang-ar', name: 'Bintang AR', icon: '⭐', hint: 'Capai 500 XP' },
];

export async function fetchMyGamification() {
  const { response, data } = await apiFetch('/gamification/me');
  if (!response.ok) return null;
  return data;
}

export async function fetchLeaderboard() {
  try {
    const { response, data } = await apiFetch('/gamification/leaderboard');
    if (!response.ok) return [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
