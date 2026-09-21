'use client';

import { useEffect, useState } from 'react';
import AppHeader from '../components/ui/AppHeader';
import HeroGamifikasi from '../components/home/HeroGamifikasi';
import GamifikasiFeatures from '../components/home/GamifikasiFeatures';
import ARShowcase from '../components/home/ARShowcase';
import LeaderboardSection from '../components/home/LeaderboardSection';
import HowAndLibrary from '../components/home/HowAndLibrary';
import CTAFooter from '../components/home/CTAFooter';
import { getSavedUser } from '../lib/api';

/**
 * HOME Sintesa — landing page profesional bertema gamifikasi + AR.
 * - Publik: pengunjung belum login melihat penawaran & CTA daftar
 * - Login: tombol adaptif menuju dashboard + library
 * - Memuat komponen AR interaktif per pelajaran (ARShowcase + Hero preview)
 */
export default function Home() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getSavedUser());
    setReady(true);
  }, []);

  if (!ready) {
    return <main className="page-loading">Menyiapkan ruang belajar…</main>;
  }

  return (
    <div className="landing">
      <AppHeader active="home" />
      <main>
        <HeroGamifikasi user={user} />
        <GamifikasiFeatures />
        <ARShowcase />
        <LeaderboardSection />
        <HowAndLibrary />
      </main>
      <CTAFooter user={user} />
    </div>
  );
}
