'use client';

import Link from 'next/link';

const QUICK_MENU = [
  { icon: '🧊', label: 'Misi AR', href: '#katalog-ar' },
  { icon: '⚡', label: 'Level & XP', href: '#gamifikasi' },
  { icon: '📌', label: 'Tugas', href: '/login' },
  { icon: '🗂️', label: 'Library', href: '/login' },
  { icon: '📝', label: 'Daftar', href: '/register' },
];

/**
 * Layar sambutan awal untuk pengunjung yang belum login.
 * Gaya aplikasi mobile: visual brand besar, banner promo, menu cepat,
 * dan tombol Login besar di bawah.
 */
export default function WelcomeSplash() {
  return (
    <section className="splash">
      <div className="splash-inner">
        <div className="splash-top">
          <span className="splash-welcome">👋 Selamat datang di</span>
          <Link href="/login" className="splash-help" title="Bantuan masuk">?</Link>
        </div>

        <div className="splash-visual" aria-hidden="true">
          <span className="blob blob-blue-a" />
          <span className="blob blob-yellow" />
          <span className="blob blob-blue-b" />
          <span className="blob blob-violet" />
          <div className="splash-brand">
            <span className="splash-logo">Sintesa</span>
            <span className="splash-tag">Kelas 10 SMK · RPL</span>
          </div>
          <span className="splash-chip chip-xp">⚡ +100 XP</span>
          <span className="splash-chip chip-lvl">🏆 MAX Lv.3</span>
          <span className="splash-chip chip-badge">🎖️ 6 Badge</span>
        </div>

        <Link href="/register" className="splash-banner no-underline">
          <span className="splash-banner-text">
            <strong>🎮 6 Misi AR Kelas 10 RPL menantimu!</strong>
            <small>Selesaikan misi, kumpulkan XP sampai MAX Lv.3</small>
          </span>
          <span className="splash-banner-arrow" aria-hidden="true">→</span>
        </Link>

        <nav className="splash-menu" aria-label="Menu cepat">
          {QUICK_MENU.map((m) => (
            <Link key={m.label} href={m.href} className="splash-menu-item no-underline">
              <span className="splash-menu-icon" aria-hidden="true">{m.icon}</span>
              <span>{m.label}</span>
            </Link>
          ))}
        </nav>
        <div className="splash-dots" aria-hidden="true">
          <span className="on" /><span /><span />
        </div>

        <Link href="/login" className="btn btn-primary btn-lg splash-login">
          🔐 Login
        </Link>
        <p className="splash-register">
          Belum punya akun? <Link href="/register" className="link">Daftar sebagai murid →</Link>
        </p>
      </div>
    </section>
  );
}
