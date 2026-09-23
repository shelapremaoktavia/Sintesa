'use client';

import Link from 'next/link';

/** CTA penutup + footer profesional. */
export default function CTAFooter({ user }) {
  return (
    <>
      <section className="landing-cta">
        <div className="landing-container landing-cta-card">
          <div>
            <div className="landing-eyebrow light">🚀 SIAP BERMAIN SAMBIL BELAJAR?</div>
            <h2>Buat kelas pertamamu hari ini — gratis.</h2>
            <p>Guru membuat kelas dalam 30 detik. Siswa gabung dengan kode. Misi AR pertama menunggu.</p>
          </div>
          <div className="hero-cta">
            {user ? (
              <Link href={user.role === 'GURU' ? '/guru' : '/siswa'} className="btn btn-light btn-lg">Buka Dashboard →</Link>
            ) : (
              <>
                <Link href="/register" className="btn btn-light btn-lg">Daftar Gratis →</Link>
                <Link href="/login" className="btn btn-outline-light btn-lg">Masuk</Link>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container footer-grid">
          <div>
            <div className="brand"><span className="brand-mark">✦</span><span>Sin<span>tesa</span></span></div>
            <p>Platform pembelajaran gamifikasi berbasis 3D & Augmented Reality untuk Kelas 10 SMK jurusan RPL.</p>
          </div>
          <div>
            <strong>Platform</strong>
            <Link href="/ar">Misi AR</Link>
            <Link href="#gamifikasi">Gamifikasi</Link>
            <Link href="/tugas">Tugas</Link>
            <Link href="/library">Library Arsip</Link>
          </div>
          <div>
            <strong>Akun</strong>
            <Link href="/login">Masuk</Link>
            <Link href="/register">Daftar</Link>
            <Link href="/siswa">Dashboard Siswa</Link>
            <Link href="/guru">Dashboard Guru</Link>
          </div>
          <div>
            <strong>Misi AR Populer</strong>
            <span>🤖 Sistem Komputer</span>
            <span>🛰️ Jaringan Komputer</span>
            <span>🪖 Keamanan Data</span>
          </div>
        </div>
        <div className="landing-container footer-bottom">
          <span>© 2026 Sintesa · Belajar · Bermain · Berkreasi</span>
          <span>XP · Badge · Leaderboard · AR · Library</span>
        </div>
      </footer>
    </>
  );
}
