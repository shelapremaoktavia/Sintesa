'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppHeader from '../../components/ui/AppHeader';
import LibraryUploader from '../../components/library/LibraryUploader';
import LibraryExplorer from '../../components/library/LibraryExplorer';
import { getSavedUser } from '../../lib/api';
import {
  deleteLibraryFile, fetchLibrary, fetchLibraryStats,
  fetchMyAssignments, formatSize, gradeLibraryFile, splitLibraryItems,
} from '../../lib/library';

/**
 * /library — ARSIP PRIBADI (terpisah dari /tugas, tanpa XP).
 * - Siswa: simpan file bebas apa pun (gambar, PDF, Word, PPT, Excel, TXT, ZIP, MP4).
 *   Arsip murni penyimpanan, tidak menambah XP dan tidak dinilai guru.
 * - Untuk mengumpulkan TUGAS guru (+poin guru, bisa dinilai): gunakan /tugas.
 * - Guru: memantau arsip mandiri siswa + statistik; penilaian tugas ada di /tugas.
 */
export default function LibraryPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, taskFiles: 0, archiveFiles: 0, totalSizeKb: 0, gambar: 0, pdf: 0, dokumen: 0, lainnya: 0 });
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [rows, stat, tugas] = await Promise.all([
        fetchLibrary(),
        fetchLibraryStats(),
        fetchMyAssignments().catch(() => []),
      ]);
      setItems(rows);
      setStats(stat);
      setAssignments(tugas);
    } catch (err) {
      setError(err.message || 'Gagal memuat library.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = getSavedUser();
    if (!token || !saved) {
      router.replace('/login');
      return;
    }
    setUser(saved);
    load();
  }, [router, load]);

  const handleDelete = async (id) => {
    await deleteLibraryFile(id);
    await load();
  };

  const handleGrade = async (id, payload) => {
    await gradeLibraryFile(id, payload);
    await load();
  };

  if (!user && loading) return <main className="page-loading">Membuka library…</main>;

  // PEMISAH TEGAS: Library = arsip mandiri saja. File tugas (ada assignmentId)
  // dikumpulkan & dinilai di /tugas agar tidak membingungkan.
  const { archiveFiles, taskFiles } = splitLibraryItems(items);
  const displayItems = user?.role === 'GURU' ? items : archiveFiles;
  const pendingTasks = assignments.filter((a) => !(a.submissions && a.submissions.length));

  return (
    <div className="page-shell">
      <AppHeader active="library" />

      <div className="container hero">
        <section className="hero-card hero-card-library">
          <p className="text-sm font-semibold text-white/75">🗂️ ARSIP LIBRARY</p>
          <h1 className="hero-title">
            Halo, {user?.name?.split(' ')[0] || 'Penjelajah'}! Arsip pribadimu tersimpan rapi di sini.
          </h1>
          <p className="hero-text">
            {user?.role === 'GURU'
              ? 'Pantau arsip mandiri siswa. Untuk menilai TUGAS (+poin guru), buka halaman Tugas.'
              : 'Simpan file bebas apa pun — foto, PDF, Word, PPT — sebagai arsip murni (tanpa XP). Untuk tugas dari guru (+XP poin guru), kumpulkan di halaman Tugas.'}
          </p>
          <div className="hero-stat">
            <span className="stat-pill">🗂️ {stats.archiveFiles ?? archiveFiles.length} arsip</span>
            <span className="stat-pill">📌 {stats.taskFiles ?? taskFiles.length} file tugas (di /tugas)</span>
            <span className="stat-pill">💾 {formatSize(stats.totalSizeKb)}</span>
            <span className="stat-pill">🖼️ {stats.gambar} gambar</span>
            <span className="stat-pill">📕 {stats.pdf} PDF</span>
          </div>
          <div className="quick-links mt-3">
            <Link href="/tugas" className="btn btn-light btn-sm">📌 Buka Tugas Guru →</Link>
          </div>
        </section>
      </div>

      <main className="container section">
        {error && <div className="toast-error">{error}</div>}

        {user?.role === 'SISWA' && pendingTasks.length > 0 && (
          <section className="panel task-reminder">
            <strong>📌 {pendingTasks.length} tugas menunggumu di halaman Tugas:</strong>
            <div className="task-chips">
              {pendingTasks.slice(0, 4).map((t) => (
                <span key={t.id} className="meta-chip">{t.title} · {t.class?.name} · +{t.points || 100} XP</span>
              ))}
            </div>
            <Link href="/tugas" className="btn btn-primary btn-sm">Kumpulkan di /tugas →</Link>
          </section>
        )}

        <div className="library-layout">
          <div>
            {user?.role === 'SISWA' && (
              <LibraryUploader onUploaded={load} />
            )}
            {user?.role === 'GURU' && (
              <section className="panel library-teacher-box">
                <h3>📌 Penilaian tugas pindah ke /tugas ({assignments.length} tugas)</h3>
                <p>Semua file tugas (+poin guru, bisa dinilai) dikumpulkan di halaman Tugas. Di bawah ini hanya arsip mandiri siswa.</p>
                <div className="task-chips">
                  {assignments.slice(0, 6).map((t) => (
                    <span key={t.id} className="meta-chip">
                      {t.title} · {t.class?.name} · {t._count?.submissions ?? 0} file masuk
                    </span>
                  ))}
                  {assignments.length === 0 && <span className="text-sm text-slate-500">Belum ada tugas. Buka dashboard guru → pilih kelas → buat tugas.</span>}
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <Link href="/tugas" className="btn btn-primary btn-sm">📌 Buka Tugas & Nilai →</Link>
                  <Link href="/guru" className="btn btn-soft btn-sm">Dashboard Guru</Link>
                </div>
              </section>
            )}

            <div className="mt-6">
              <LibraryExplorer
                items={displayItems}
                user={user}
                loading={loading}
                onDelete={handleDelete}
                onGrade={handleGrade}
                onRefresh={load}
              />
            </div>
          </div>

          <aside className="library-side">
            <div className="panel library-side-card">
              <h4>📌 Tentang Arsip</h4>
              <ul>
                <li><strong>0 XP</strong> — arsip murni penyimpanan</li>
                <li><strong>📌 Tugas guru:</strong> XP = poin guru, kumpulkan di <Link href="/tugas" className="link">/tugas</Link></li>
                <li><strong>🧊 Misi AR:</strong> XP = +100/materi, mainkan di <Link href="/ar" className="link">/ar</Link></li>
                <li>Arsip tidak dinilai guru</li>
              </ul>
            </div>
            <div className="panel library-side-card">
              <h4>📎 Format didukung</h4>
              <div className="format-list">
                <span>🖼️ PNG · JPG · WEBP</span>
                <span>📕 PDF</span>
                <span>📘 DOC · DOCX</span>
                <span>📊 PPT · PPTX</span>
                <span>📗 XLS · XLSX · CSV</span>
                <span>🎬 MP4 · MP3 · ZIP · TXT</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Maksimal 15 MB per file. Preview langsung untuk gambar & PDF.</p>
            </div>
            <Link href="/tugas" className="btn btn-primary w-full">📌 Ke Halaman Tugas</Link>
            <Link href="/" className="btn btn-soft w-full">← Kembali ke Beranda</Link>
          </aside>
        </div>
      </main>
    </div>
  );
}
