'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SectionHeading } from '../ui/badges';
import { fetchLeaderboard } from '../../lib/gamification';

const DEMO_BOARD = [
  { name: 'Bintang Kelas', xp: 2450, level: 3, title: 'Master Sintesa' },
  { name: 'Penjelajah Hebat', xp: 980, level: 2, title: 'Penjelajah Aktif' },
  { name: 'Pemburu XP', xp: 620, level: 2, title: 'Penjelajah Aktif' },
];

const MEDALS = ['🥇', '🥈', '🥉'];

/** Leaderboard real dari API + fallback demo agar HOME selalu hidup. */
export default function LeaderboardSection() {
  const [rows, setRows] = useState(DEMO_BOARD);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchLeaderboard();
      if (cancelled) return;
      if (data.length > 0) {
        setRows(data.slice(0, 5).map((r) => ({ name: r.name, xp: r.xp, level: r.level, title: r.title })));
        setIsLive(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="landing-section">
      <div className="landing-container landing-split">
        <div>
          <SectionHeading
            align="left"
            eyebrow="🏆 LEADERBOARD"
            title="Kompetisi sehat yang bikin nagih"
            subtitle="XP dari materi & tugas terakumulasi otomatis. Siswa berlomba naik peringkat, guru memantau motivasi kelas."
          />
          <ul className="how-list">
            <li><strong>Real-time:</strong> XP masuk detik itu juga setelah materi ditandai selesai.</li>
            <li><strong>Adil:</strong> semua peran terlihat — progres, submission, dan badge.</li>
            <li><strong>Memotivasi:</strong> selisih XP kecil antar peringkat memicu “satu misi lagi”.</li>
          </ul>
          <Link href="/register" className="btn btn-primary btn-lg mt-4">Rebut Peringkatmu →</Link>
        </div>

        <div className="board-card panel">
          <div className="board-head">
            <strong>🏆 Papan Peringkat {isLive ? '· Live' : '· Contoh'}</strong>
            <span className={`live-pill ${isLive ? 'live-on' : ''}`}>{isLive ? '● LIVE' : 'DEMO'}</span>
          </div>
          <ol className="board-list">
            {rows.map((r, i) => (
              <li key={`${r.name}-${i}`} className="board-row">
                <span className="board-rank">{MEDALS[i] || `#${i + 1}`}</span>
                <span className="board-avatar">{r.name.charAt(0).toUpperCase()}</span>
                <span className="board-name">
                  <strong>{r.name}</strong>
                  <small>Lv.{r.level} · {r.title}</small>
                </span>
                <span className="board-xp">{r.xp} XP</span>
              </li>
            ))}
          </ol>
          <p className="board-note">Selesaikan 1 materi (+100 XP) untuk masuk papan peringkat.</p>
        </div>
      </div>
    </section>
  );
}
