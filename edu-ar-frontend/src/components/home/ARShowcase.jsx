'use client';

import { useState } from 'react';
import Link from 'next/link';
import ViewerAR from '../ARViewer/ViewerAR';
import { SectionHeading } from '../ui/badges';
import { AR_CATALOG, KELAS_FOKUS, arSubjects } from '../../lib/arCatalog';

/**
 * Katalog AR interaktif di HOME: pilih misi RPL → model 3D/AR + misi + instruksi tampil.
 * Versi lengkap (materi + soal tiap misi) ada di halaman /ar.
 * Satu <ViewerAR> aktif dalam satu waktu agar ringan dan bebas error.
 */
export default function ARShowcase() {
  const [selected, setSelected] = useState(AR_CATALOG[0]);
  const [mapel, setMapel] = useState('Semua');

  const subjects = ['Semua', ...arSubjects()];
  const filtered = mapel === 'Semua' ? AR_CATALOG : AR_CATALOG.filter((a) => a.subject === mapel);

  return (
    <section id="katalog-ar" className="landing-section landing-alt">
      <div className="landing-container">
        <SectionHeading
          eyebrow={`🧊 KATALOG AR · ${KELAS_FOKUS.toUpperCase()} SMK`}
          title="Pilih misimu, hadirkan modelnya dalam AR"
          subtitle="6 misi RPL dengan model 3D tematik + misi XP. Klik kartu untuk mengganti preview interaktif di samping."
        />

        <div className="ar-filter">
          {subjects.map((s) => (
            <button key={s} onClick={() => setMapel(s)} className={`pill-btn ${mapel === s ? 'pill-active' : ''}`}>
              {s === 'Semua' ? '🌍 Semua Mapel' : `📚 ${s}`}
            </button>
          ))}
        </div>

        <div className="ar-showcase-grid">
          <div className="ar-list">
            {filtered.map((item) => (
              <button
                key={item.slug}
                onClick={() => setSelected(item)}
                className={`ar-item ${selected.slug === item.slug ? 'ar-item-active' : ''}`}
              >
                <span className="ar-item-emoji" style={{ background: item.gradient }}>{item.emoji}</span>
                <span className="ar-item-text">
                  <strong>{item.title}</strong>
                  <small>{item.kelas} · {item.subject} · +{item.xp} XP</small>
                </span>
                <span className="ar-item-arrow">→</span>
              </button>
            ))}
          </div>

          <div className="ar-preview panel">
            <div className="ar-preview-head">
              <span className="ar-item-emoji" style={{ background: selected.gradient }}>{selected.emoji}</span>
              <div>
                <div className="eyebrow">{selected.kelas} · {selected.subject} · +{selected.xp} XP</div>
                <h3 className="ar-preview-title">{selected.title}</h3>
              </div>
            </div>

            <div className="ar-preview-view">
              <ViewerAR
                key={selected.slug}
                glbSrc={selected.glb}
                usdzSrc={selected.usdz}
                alt={`Model AR ${selected.title}`}
              />
            </div>

            <div className="ar-mission-box">
              <strong>🎯 Misi: {selected.mission}</strong>
              <p>📱 {selected.instruction}</p>
              <div className="ar-skills">
                {selected.skills.map((s) => <span key={s} className="meta-chip">{s}</span>)}
              </div>
              <div className="ar-preview-cta">
                <Link href="/ar" className="btn btn-primary">Buka Misi Lengkap (Materi + Soal) →</Link>
                <span className="text-xs text-slate-500">Perangkat HP + Chrome/Safari untuk AR penuh</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
