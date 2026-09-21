'use client';

import { SectionHeading } from '../ui/badges';

const FEATURES = [
  { icon: '⚡', title: 'XP & Level', desc: 'Materi selesai +100 XP, dilihat +10 XP, tugas guru +poin guru. Arsip Library murni penyimpanan (0 XP). Naik hingga Master AR.' },
  { icon: '🏅', title: 'Badge & Pencapaian', desc: 'Kumpulkan 6 badge: Langkah Pertama, Penjelajah 3D, Master Materi, Pengumpul Tugas, Pejuang Tugas, Bintang AR.' },
  { icon: '🏆', title: 'Leaderboard Kelas', desc: 'Papan peringkat real-time memicu kompetisi sehat antar siswa di setiap kelas.' },
  { icon: '🧊', title: 'AR per Pelajaran', desc: '6 misi 3D/AR tematik — tata surya, sel, katrol, molekul, anatomi — tiap misi ada materi & soal, di halaman /ar.' },
  { icon: '🗂️', title: 'Library Arsip', desc: 'Simpan file apa pun (gambar, PDF, Word, PPT, Excel, video) sebagai arsip pribadi tanpa XP.' },
  { icon: '🎯', title: 'Misi Terstruktur', desc: 'Alur jelas: gabung kelas → mainkan misi AR → tandai selesai → kumpulkan tugas → naik level.' },
];

/** Grid fitur gamifikasi profesional. */
export default function GamifikasiFeatures() {
  return (
    <section id="gamifikasi" className="landing-section">
      <div className="landing-container">
        <SectionHeading
          eyebrow="🎮 SISTEM GAMIFIKASI"
          title="Kenapa belajar di Sintesa terasa seperti bermain?"
          subtitle="Kami memadukan psikologi game dengan pedagogi: progres yang terlihat, hadiah instan, dan tantangan yang pas."
        />
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <article key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
