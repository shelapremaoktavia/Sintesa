'use client';

import Link from 'next/link';
import ViewerAR from '../ARViewer/ViewerAR';
import { AR_CATALOG } from '../../lib/arCatalog';

/** Hero HOME: profesional, gamifikasi + AR, dengan preview 3D interaktif. */
export default function HeroGamifikasi({ user }) {
  const dashboardHref = user?.role === 'GURU' ? '/guru' : '/siswa';

  return (
    <section className="landing-hero">
      <div className="landing-container landing-hero-grid">
        <div>
          <div className="hero-badge">🎮 PEMBELAJARAN GAMIFIKASI + AUGMENTED REALITY</div>
          <h1 className="landing-h1">
            Belajar Serasa <span className="grad-text">Bermain Game</span>,
            Materi Hidup dalam <span className="grad-text-alt">AR 3D</span>
          </h1>
          <p className="landing-lead">
            Sintesa mengubah mapel RPL Kelas 10 — Sistem Komputer, Jaringan, Informatika — menjadi misi seru:
            kumpulkan XP, naik level hingga MAX, rebut badge, dan hadirkan model 3D langsung ke meja belajarmu lewat kamera HP.
          </p>

          <div className="hero-cta">
            {user ? (
              <>
                <Link href={dashboardHref} className="btn btn-primary btn-lg">🚀 Lanjut ke Dashboard</Link>
                <Link href="/library" className="btn btn-ghost btn-lg">🗂️ Buka Library Tugas</Link>
              </>
            ) : (
              <>
                <Link href="/register" className="btn btn-primary btn-lg">Mulai Belajar Gratis →</Link>
                <Link href="/login" className="btn btn-ghost btn-lg">Saya Sudah Punya Akun</Link>
              </>
            )}
          </div>

          <div className="hero-proof">
            <div className="proof-item"><strong>6</strong><span>Model AR RPL</span></div>
            <div className="proof-item"><strong>10</strong><span>Kelas 10 SMK RPL</span></div>
            <div className="proof-item"><strong>100</strong><span>XP tiap misi selesai</span></div>
            <div className="proof-item"><strong>∞</strong><span>File tugas di Library</span></div>
          </div>

          <div className="hero-levels">
            <span className="mini-chip">🌱 Lv.1 Penjelajah Baru</span>
            <span className="mini-chip">🚀 Lv.2 Penjelajah Aktif</span>
            <span className="mini-chip">🏆 Lv.3 Master Sintesa · MAX</span>
          </div>
        </div>

        <div className="hero-ar-panel">
          <div className="hero-ar-head">
            <span className="live-dot" /> LIVE PREVIEW · MODEL AR ROBOT
            <span className="xp-float">+100 XP</span>
          </div>
          <div className="hero-ar-view">
            <ViewerAR glbSrc={AR_CATALOG[0].glb} usdzSrc={AR_CATALOG[0].usdz} alt="Preview AR Sistem Komputer" compact />
          </div>
          <div className="hero-ar-foot">
            <div className="hero-mission">
              <span className="mission-emoji">🤖</span>
              <div>
                <strong>Misi: Sistem Komputer</strong>
                <p>Putar model · Zoom · Ketuk “Lihat dalam AR”</p>
              </div>
            </div>
            <Link href="/ar" className="btn btn-soft">Buka 6 Misi AR (Materi + Soal) →</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
