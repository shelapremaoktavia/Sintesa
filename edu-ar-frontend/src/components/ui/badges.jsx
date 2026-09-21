'use client';

import { levelForXp } from '../../lib/gamification';

/** Lencana XP/level ringkas untuk dashboard & HOME. */
export function XPBadge({ xp = 0, compact = false }) {
  const lvl = levelForXp(xp);
  if (compact) {
    return (
      <span className="xp-chip" title={`${lvl.title} — ${xp} XP`}>
        <span aria-hidden="true">{lvl.icon}</span> Lv.{lvl.level} · {xp} XP
      </span>
    );
  }
  return (
    <div className="xp-card">
      <div className="xp-top">
        <span className="xp-level-icon">{lvl.icon}</span>
        <div>
          <div className="xp-level">Level {lvl.level} — {lvl.title}</div>
          <div className="xp-sub">{xp} XP {lvl.nextAt ? `· ${lvl.nextAt - xp} XP lagi naik level` : '· level maksimal 🎉'}</div>
        </div>
      </div>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${lvl.progress}%` }} /></div>
    </div>
  );
}

/** Judul seksi konsisten di seluruh landing. */
export function SectionHeading({ eyebrow, title, subtitle, align = 'center' }) {
  return (
    <div className={`landing-head landing-head-${align}`}>
      <div className="landing-eyebrow">{eyebrow}</div>
      <h2 className="landing-title">{title}</h2>
      {subtitle && <p className="landing-subtitle">{subtitle}</p>}
    </div>
  );
}
