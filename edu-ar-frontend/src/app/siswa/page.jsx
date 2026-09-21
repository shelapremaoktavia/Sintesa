'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppHeader from '../../components/ui/AppHeader';
import { XPBadge } from '../../components/ui/badges';
import { getSavedUser } from '../../lib/api';
import { BADGES, fetchLeaderboard, fetchMyGamification, levelForXp } from '../../lib/gamification';

const MEDALS = ['🥇', '🥈', '🥉'];

/**
 * Dashboard Siswa — KHUSUS sistem gamifikasi (XP, level, badge, leaderboard).
 * Materi AR & kelas pindah ke halaman /ar, tugas ke /tugas, arsip ke /library.
 */
export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [gami, setGami] = useState(null);
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = getSavedUser();
    if (!token) { router.replace('/login'); return; }
    if (saved?.role !== 'SISWA') { router.replace('/guru'); return; }
    setUser(saved);
    (async () => {
      try {
        const [myGami, lb] = await Promise.all([
          fetchMyGamification().catch(() => null),
          fetchLeaderboard().catch(() => []),
        ]);
        setGami(myGami);
        setBoard(lb);
      } catch {
        setError('Tidak bisa terhubung ke server. Pastikan backend berjalan.');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const xp = gami?.xp ?? 0;
  const lvl = levelForXp(xp);
  const earnedIds = useMemo(() => {
    if (gami?.badges) return new Set(gami.badges.map((b) => b.id));
    return new Set();
  }, [gami]);

  if (loading) return <main className="page-loading">Memuat progres gamifikasi…</main>;

  return (
    <div className="page-shell">
      <AppHeader active="dashboard" />

      <div className="container hero">
        <section className="hero-card">
          <p className="text-sm font-semibold text-white/75">🎮 DASHBOARD GAMIFIKASI</p>
          <h1 className="hero-title">Halo, {user?.name?.split(' ')[0] || 'Siswa'} 👋<br />Level {lvl.level} — {lvl.title}</h1>
          <p className="hero-text">Semua progres game-mu ada di sini: XP, badge, dan peringkat. Mainkan misi di halaman AR, kumpulkan tugas untuk naik level.</p>
          <div className="hero-stat">
            <span className="stat-pill">⚡ {xp} XP</span>
            <span className="stat-pill">🏅 {earnedIds.size}/{BADGES.length} badge</span>
            <span className="stat-pill">📌 {gami?.tasksDone ?? 0} tugas selesai</span>
            <span className="stat-pill">✅ {gami?.completed ?? 0} materi selesai</span>
          </div>
          <div className="quick-links mt-3">
            <Link href="/ar" className="btn btn-light btn-sm">🧊 Mainkan Misi AR</Link>
            <Link href="/tugas" className="btn btn-light btn-sm">📌 Kumpulkan Tugas</Link>
            <Link href="/library" className="btn btn-outline-light btn-sm">🗂️ Arsipku</Link>
          </div>
        </section>
      </div>

      <main className="container section">
        {error && <div className="toast-error">{error}</div>}

        <section className="gami-strip">
          <XPBadge xp={xp} />
          <div className="panel gami-card">
            <span className="gami-icon" style={{ background: '#fef3c7' }}>⚡</span>
            <div>
              <div className="gami-num">{gami?.assignmentXP ?? 0} XP</div>
              <div className="gami-label">dari {gami?.tasksDone ?? 0} tugas guru (poin guru, sekali per tugas)</div>
            </div>
          </div>
          <div className="panel gami-card">
            <span className="gami-icon" style={{ background: '#e0f2fe' }}>🧊</span>
            <div>
              <div className="gami-num">{(gami?.completed ?? 0) * 100} XP</div>
              <div className="gami-label">dari {gami?.completed ?? 0} materi AR selesai (+100/materi)</div>
            </div>
          </div>
        </section>

        <section className="mb-3">
          <div className="section-head">
            <div>
              <h2 className="section-title">🏅 Badge Koleksiku</h2>
              <p className="section-subtitle">Selesaikan misi & tugas untuk membuka semuanya.</p>
            </div>
          </div>
          <div className="panel p-5">
            <div className="badge-row" style={{ marginTop: 0 }}>
              {BADGES.map((b) => (
                <span key={b.id} title={`${b.name} — ${b.hint}`} className={`badge-pill ${earnedIds.has(b.id) ? '' : 'badge-locked'}`}>
                  {b.icon} {b.name}
                </span>
              ))}
            </div>
            <div className="text-xs text-slate-500 mt-3">
              💡 Pengumpul Tugas = 1 tugas · Pejuang Tugas = 3 tugas · Bintang AR = 500 XP. Arsip Library tidak memberi XP/badge.
            </div>
          </div>
        </section>

        <section className="mb-3">
          <div className="section-head">
            <div>
              <h2 className="section-title">🏆 Leaderboard</h2>
              <p className="section-subtitle">Peringkat XP seluruh siswa.</p>
            </div>
          </div>
          <div className="panel board-card">
            {board.length === 0 ? (
              <div className="empty" style={{ padding: 20 }}>Belum ada data peringkat. Selesaikan 1 misi untuk masuk papan! 🚀</div>
            ) : (
              <ol className="board-list">
                {board.slice(0, 10).map((r, i) => (
                  <li key={`${r.id || r.name}-${i}`} className="board-row">
                    <span className="board-rank">{MEDALS[i] || `#${i + 1}`}</span>
                    <span className="board-avatar">{(r.name || '?').charAt(0).toUpperCase()}</span>
                    <span className="board-name">
                      <strong>{r.name}</strong>
                      <small>Lv.{r.level} · {r.title}</small>
                    </span>
                    <span className="board-xp">{r.xp} XP</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>

        <section>
          <div className="section-head">
            <div>
              <h2 className="section-title">🗺️ Lanjut ke Mana?</h2>
              <p className="section-subtitle">Dashboard ini khusus progres. Aktivitas ada di halaman masing-masing.</p>
            </div>
          </div>
          <div className="class-grid">
            <Link href="/ar" className="panel class-card no-underline text-inherit">
              <div className="class-body">
                <div className="text-4xl mb-2">🧊</div>
                <strong>Misi AR</strong>
                <p className="text-sm text-slate-500">6 misi + materi & soal latihan. Materi kelas dari gurumu juga ada di sini.</p>
                <span className="text-sm font-extrabold text-blue-600">Mainkan →</span>
              </div>
            </Link>
            <Link href="/tugas" className="panel class-card no-underline text-inherit">
              <div className="class-body">
                <div className="text-4xl mb-2">📌</div>
                <strong>Tugas Guru</strong>
                <p className="text-sm text-slate-500">Kumpulkan file per tugas, raih XP sebesar poin guru.</p>
                <span className="text-sm font-extrabold text-blue-600">Kumpulkan →</span>
              </div>
            </Link>
            <Link href="/library" className="panel class-card no-underline text-inherit">
              <div className="class-body">
                <div className="text-4xl mb-2">🗂️</div>
                <strong>Arsip Library</strong>
                <p className="text-sm text-slate-500">Penyimpanan file bebas (tanpa XP, tanpa nilai).</p>
                <span className="text-sm font-extrabold text-blue-600">Buka arsip →</span>
              </div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
