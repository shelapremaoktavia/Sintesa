'use client';

import Link from 'next/link';
import { SectionHeading } from '../ui/badges';

const SUPPORTED = [
  { icon: '🖼️', label: 'Gambar', desc: 'PNG, JPG, WEBP' },
  { icon: '📕', label: 'PDF', desc: 'Laporan & modul' },
  { icon: '📘', label: 'Word', desc: 'DOC, DOCX' },
  { icon: '📊', label: 'Presentasi', desc: 'PPT, PPTX' },
  { icon: '📗', label: 'Spreadsheet', desc: 'XLS, XLSX, CSV' },
  { icon: '🎬', label: 'Media', desc: 'MP4, MP3, ZIP' },
];

const STEPS = [
  { icon: '👩‍🏫', role: 'Guru', title: 'Buat kelas & tugas', desc: 'Buat kelas, dapat kode unik, tugaskan materi AR, lalu buat tugas dengan poin XP sesuai keinginanmu.' },
  { icon: '🧑‍🎓', role: 'Siswa', title: 'Kumpulkan tugas', desc: 'Gabung pakai kode, buka halaman Tugas, unggah file per tugas — XP poin guru masuk sekali per tugas.' },
  { icon: '🗂️', role: 'Bersama', title: 'Arsipkan di Library', desc: 'Simpan file bebas apa pun — foto, PDF, Word — sebagai arsip pribadi (tanpa XP, tanpa nilai).' },
];

/** Cara kerja + preview Tugas vs Library yang sudah dipisah. */
export default function HowAndLibrary() {
  return (
    <>
      <section className="landing-section landing-alt">
        <div className="landing-container">
          <SectionHeading
            eyebrow="🛠️ CARA KERJA"
            title="Dari kelas hingga naik level dalam 3 langkah"
            subtitle="Alur terstruktur untuk guru dan siswa — tanpa pelatihan khusus."
          />
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <article key={s.title} className="step-card">
                <div className="step-num">{i + 1}</div>
                <div className="step-icon">{s.icon}</div>
                <div className="eyebrow">{s.role}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-container landing-split">
          <div>
            <SectionHeading
              align="left"
              eyebrow="📌 TUGAS vs 🗂️ LIBRARY"
              title="Tugas dan arsip kini terpisah rapi"
              subtitle="Tidak ada lagi kebingungan: tugas guru punya halaman sendiri dengan XP poin guru, Library khusus arsip pribadi."
            />
            <ul className="how-list">
              <li><strong>📌 Halaman Tugas:</strong> kumpulkan per tugas guru → XP = poin guru → dinilai 0–100 + feedback.</li>
              <li><strong>🗂️ Halaman Library:</strong> arsip bebas (gambar, PDF, Word, PPT, Excel, TXT, ZIP, MP4) → 0 XP, tanpa nilai.</li>
              <li><strong>Format bebas:</strong> gambar, PDF, Word, PPT, Excel, TXT, ZIP, MP4 di kedua halaman.</li>
            </ul>
            <div className="hero-cta mt-4">
              <Link href="/tugas" className="btn btn-primary btn-lg">Buka Tugas →</Link>
              <Link href="/library" className="btn btn-ghost btn-lg">Buka Library →</Link>
            </div>
          </div>
          <div className="lib-preview-grid">
            {SUPPORTED.map((s) => (
              <div key={s.label} className="lib-type-card">
                <span className="lib-type-icon">{s.icon}</span>
                <strong>{s.label}</strong>
                <small>{s.desc}</small>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
