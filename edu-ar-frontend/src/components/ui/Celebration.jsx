'use client';

import { useEffect, useMemo, useState } from 'react';

const CONFETTI_COLORS = ['#fde68a', '#ffffff', '#fbbf24', '#bae6fd', '#f9a8d4', '#a7f3d0'];

function useOverlayKeys(onClose) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);
}

/** Hujan konfeti CSS murni (ringan, tanpa library). Acak stabil per index. */
function Confetti({ count = 26 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const rnd = (salt) => {
          const x = Math.sin(i * 127.1 + salt * 311.7 + count * 74.7) * 43758.5453;
          return x - Math.floor(x);
        };
        return {
          left: rnd(1) * 100,
          delay: rnd(2) * 0.9,
          duration: 2.4 + rnd(3) * 1.8,
          size: 6 + rnd(4) * 8,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          round: rnd(5) > 0.6,
          drift: (rnd(6) - 0.5) * 140,
        };
      }),
    [count]
  );
  return (
    <div className="cel-confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            left: `${p.left}%`,
            width: p.round ? p.size : p.size * 0.6,
            height: p.size,
            background: p.color,
            borderRadius: p.round ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--drift': `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Layar sukses fullscreen ala referensi (lingkaran centang memantul + "Horey!").
 * Dipakai setelah tugas terkirim & misi selesai.
 */
export function SuccessOverlay({ title = 'Horey!', subtitle, xpText, buttonLabel = 'Kembali', onClose }) {
  useOverlayKeys(onClose);
  return (
    <div className="cel-backdrop cel-success" role="dialog" aria-modal="true" aria-label={title}>
      <Confetti />
      <div className="cel-card">
        <div className="cel-check" aria-hidden="true">
          <svg viewBox="0 0 72 72">
            <circle className="cel-check-ring" cx="36" cy="36" r="32" />
            <path className="cel-check-mark" d="M23 37.5 32.5 47 50 27" />
          </svg>
        </div>
        <h2 className="cel-title">{title}</h2>
        {subtitle && <p className="cel-sub">{subtitle}</p>}
        {xpText && <span className="cel-xp">⚡ {xpText}</span>}
        <button type="button" className="cel-btn" onClick={onClose} autoFocus>
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}

function BadgeFace({ badge, pos, total }) {
  return (
    <>
      <div className="cel-eyebrow">
        🎉 BADGE BARU!{total > 1 ? ` (${pos}/${total})` : ''}
      </div>
      <div className="cel-coin" key={badge.id} aria-hidden="true">
        <span className="cel-coin-icon">{badge.icon}</span>
        <span className="cel-coin-shine" />
      </div>
      <h2 className="cel-title">{badge.name}</h2>
      <p className="cel-sub">{badge.hint || 'Pencapaian dibuka!'}</p>
    </>
  );
}

/**
 * Animasi badge baru: koin raksasa "dilempar" (berputar di udara lalu mendarat
 * dengan pantulan) + kilau. Antrean beberapa badge bisa dilewati satu per satu.
 */
export function BadgeOverlay({ badges = [], onClose }) {
  useOverlayKeys(onClose);
  const [idx, setIdx] = useState(0);
  const total = badges.length;
  const current = badges[Math.min(idx, total - 1)] || { id: 'badge', icon: '🏅', name: 'Badge Baru' };
  const last = idx >= total - 1;

  return (
    <div className="cel-backdrop cel-badge-bg" role="dialog" aria-modal="true" aria-label={`Badge baru: ${current.name}`}>
      <Confetti count={20} />
      <div className="cel-card cel-card-dark">
        <BadgeFace badge={current} pos={idx + 1} total={total} />
        <button
          type="button"
          className="cel-btn cel-btn-gold"
          onClick={() => (last ? onClose() : setIdx(idx + 1))}
          autoFocus
        >
          {total > 1 && !last ? 'Lihat Berikutnya →' : 'Keren! 🎉'}
        </button>
      </div>
    </div>
  );
}

/** Selisih badge: yang ada di `next` tapi belum ada di `prev` (berdasar id). */
export function diffBadges(prev = [], next = []) {
  const ids = new Set((prev || []).map((b) => b?.id));
  return (next || []).filter((b) => b && !ids.has(b.id));
}
