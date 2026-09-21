'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppHeader from '../../components/ui/AppHeader';
import { apiFetch, getSavedUser } from '../../lib/api';
import { createAssignment, fetchLibraryStats, fetchMyAssignments } from '../../lib/library';
import { fetchLeaderboard } from '../../lib/gamification';

/** Dashboard Guru: pantau gamifikasi kelas (leaderboard + statistik) + kelola kelas & tugas. */
export default function GuruDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [libStats, setLibStats] = useState({ total: 0 });
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  // Form tugas cepat
  const [task, setTask] = useState({ classId: '', title: '', description: '', points: 100, dueDate: '' });
  const [creatingTask, setCreatingTask] = useState(false);

  const fetchAll = async () => {
    try {
      const [{ response, data }, tugas, stats, lb] = await Promise.all([
        apiFetch('/classes/my-classes'),
        fetchMyAssignments().catch(() => []),
        fetchLibraryStats().catch(() => ({ total: 0 })),
        fetchLeaderboard().catch(() => []),
      ]);
      if (!response.ok) setError(data.message || 'Gagal memuat kelas.');
      else setClasses(Array.isArray(data) ? data : []);
      setAssignments(tugas);
      setLibStats(stats);
      setBoard(lb);
      if (!task.classId && Array.isArray(data) && data.length) {
        setTask((t) => ({ ...t, classId: data[0].id }));
      }
    } catch {
      setError('Tidak bisa terhubung ke server. Pastikan backend berjalan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = getSavedUser();
    if (!token) { router.replace('/login'); return; }
    if (saved?.role !== 'GURU') { router.replace('/siswa'); return; }
    setUser(saved);
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleCreate = async (e) => {
    e.preventDefault(); setCreating(true); setError(''); setOk('');
    const { response, data } = await apiFetch('/classes', { method: 'POST', body: JSON.stringify(form) });
    if (!response.ok) setError(data.message || 'Gagal membuat kelas.');
    else { setForm({ name: '', description: '' }); setOk(`Kelas “${data.name}” dibuat! Kode: ${data.code}`); await fetchAll(); }
    setCreating(false);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!task.classId || !task.title.trim()) { setError('Pilih kelas dan isi judul tugas.'); return; }
    setCreatingTask(true); setError(''); setOk('');
    try {
      const created = await createAssignment({
        classId: task.classId,
        title: task.title.trim(),
        description: task.description.trim() || undefined,
        points: Number(task.points) || 100,
        dueDate: task.dueDate || undefined,
      });
      setOk(`Tugas “${created.title}” dibuat (+${created.points || 100} XP untuk siswa).`);
      setTask((t) => ({ ...t, title: '', description: '', points: 100, dueDate: '' }));
      await fetchAll();
    } catch (err) {
      setError(err.message || 'Gagal membuat tugas.');
    } finally {
      setCreatingTask(false);
    }
  };

  if (loading) return <main className="page-loading">Menyiapkan dashboard guru…</main>;

  const totalMaterials = classes.reduce((a, c) => a + (c.materials?.length || 0), 0);
  const totalStudents = classes.reduce((a, c) => a + (c.enrollments?.length || 0), 0);

  return (
    <div className="page-shell min-h-screen">
      <AppHeader active="dashboard" />

      <main className="container section pt-9">
        <div className="section-head">
          <div>
            <div className="eyebrow">👩‍🏫 DASHBOARD GURU · SISTEM GAMIFIKASI</div>
            <h1 className="section-title text-3xl mt-1">Halo, {user?.name?.split(' ')[0] || 'Guru'}! Pantau progres game kelasmu.</h1>
            <p className="section-subtitle">Leaderboard XP siswa, statistik gamifikasi, plus kelola kelas & tugas. Misi AR ada di halaman /ar.</p>
          </div>
          <div className="quick-links">
            <Link href="/ar" className="btn btn-soft btn-sm">🧊 Misi AR</Link>
            <Link href="/tugas" className="btn btn-primary btn-sm">📌 Tugas ({assignments.length})</Link>
            <Link href="/library" className="btn btn-soft btn-sm">🗂️ Arsip ({libStats.archiveFiles ?? libStats.total ?? 0})</Link>
          </div>
        </div>

        {error && <div className="toast-error">{error}</div>}
        {ok && <div className="toast-ok">{ok}</div>}

        <section className="gami-strip">
          <div className="panel gami-card">
            <span className="gami-icon" style={{ background: '#fef3c7' }}>🏆</span>
            <div>
              <div className="gami-num">{board.length ? `${board[0].name} · ${board[0].xp} XP` : '—'}</div>
              <div className="gami-label">Pemuncak leaderboard saat ini</div>
            </div>
          </div>
          <div className="panel gami-card">
            <span className="gami-icon" style={{ background: '#e0f2fe' }}>⚡</span>
            <div>
              <div className="gami-num">{board.reduce((a, s) => a + (s.xp || 0), 0)} XP</div>
              <div className="gami-label">Total XP seluruh siswa di leaderboard</div>
            </div>
          </div>
          <div className="panel gami-card">
            <span className="gami-icon" style={{ background: '#dcfce7' }}>🎯</span>
            <div>
              <div className="gami-num">{assignments.length} tugas</div>
              <div className="gami-label">Misi tugas aktif memberi XP poin guru</div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="section-head">
            <div>
              <h2 className="section-title">🏆 Leaderboard Siswa</h2>
              <p className="section-subtitle">Peringkat XP otomatis dari materi + tugas.</p>
            </div>
            <Link href="/tugas" className="btn btn-soft btn-sm">Nilai di Tugas →</Link>
          </div>
          {board.length === 0 ? (
            <div className="panel empty">Belum ada data. Ajak siswamu menyelesaikan 1 misi! 🚀</div>
          ) : (
            <div className="panel board-card">
              <ol className="board-list">
                {board.slice(0, 5).map((r, i) => (
                  <li key={`${r.id || r.name}-${i}`} className="board-row">
                    <span className="board-rank">{['🥇', '🥈', '🥉'][i] || `#${i + 1}`}</span>
                    <span className="board-avatar">{(r.name || '?').charAt(0).toUpperCase()}</span>
                    <span className="board-name">
                      <strong>{r.name}</strong>
                      <small>Lv.{r.level} · {r.title}</small>
                    </span>
                    <span className="board-xp">{r.xp} XP</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>

        <div className="section-head"><div><h2 className="section-title">🏫 Kelola Kelas & Tugas</h2><p className="section-subtitle">Buat kelas, buat tugas ber-XP, dan buka kelas untuk menugaskan materi AR.</p></div></div>
        <section className="grid lg:grid-cols-3 gap-5 mb-8">
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-2"><h2 className="font-extrabold text-lg">📊 Ringkasan</h2><span className="text-3xl">🧑‍🏫</span></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-blue-50 p-4"><div className="text-2xl font-extrabold text-blue-700">{classes.length}</div><div className="text-xs text-slate-500 mt-1">Kelas</div></div>
              <div className="rounded-2xl bg-purple-50 p-4"><div className="text-2xl font-extrabold text-purple-700">{totalMaterials}</div><div className="text-xs text-slate-500 mt-1">Materi AR</div></div>
              <div className="rounded-2xl bg-emerald-50 p-4"><div className="text-2xl font-extrabold text-emerald-700">{totalStudents}</div><div className="text-xs text-slate-500 mt-1">Siswa</div></div>
              <div className="rounded-2xl bg-amber-50 p-4"><div className="text-2xl font-extrabold text-amber-700">{assignments.length}</div><div className="text-xs text-slate-500 mt-1">Tugas aktif</div></div>
            </div>
            <Link href="/tugas" className="btn btn-soft w-full mt-4">📌 {assignments.length} tugas · nilai di /tugas →</Link>
          </div>

          <form onSubmit={handleCreate} className="panel p-5">
            <h2 className="font-extrabold text-lg">＋ Buat Kelas Baru</h2>
            <p className="text-sm text-slate-500 mt-1 mb-4">Kelas mendapat kode unik untuk dibagikan.</p>
            <div className="form-group"><label className="form-label">Nama Kelas</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Contoh: IPA Kelas 6A" required /></div>
            <div className="form-group"><label className="form-label">Deskripsi</label><textarea className="input textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi singkat kelas…" /></div>
            <button className="btn btn-primary w-full" disabled={creating}>{creating ? 'Membuat…' : '+ Buat Kelas'}</button>
          </form>

          <form onSubmit={handleCreateTask} className="panel p-5">
            <h2 className="font-extrabold text-lg">🎯 Buat Tugas (+XP poin guru)</h2>
            <p className="text-sm text-slate-500 mt-1 mb-4">Siswa mengumpulkan di /tugas dan langsung dapat XP sebesar poin ini.</p>
            <div className="form-group">
              <label className="form-label">Kelas</label>
              <select className="input" value={task.classId} onChange={(e) => setTask({ ...task, classId: e.target.value })} required>
                <option value="">— Pilih kelas —</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.code}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Judul Tugas</label><input className="input" value={task.title} onChange={(e) => setTask({ ...task, title: e.target.value })} placeholder="Contoh: Laporan Praktikum Sel" required /></div>
            <div className="form-row-2">
              <div className="form-group"><label className="form-label">Poin XP</label><input type="number" min="10" max="1000" className="input" value={task.points} onChange={(e) => setTask({ ...task, points: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Tenggat</label><input type="date" className="input" value={task.dueDate} onChange={(e) => setTask({ ...task, dueDate: e.target.value })} /></div>
            </div>
            <button className="btn btn-primary w-full" disabled={creatingTask}>{creatingTask ? 'Membuat…' : '＋ Buat Tugas'}</button>
          </form>
        </section>

        {assignments.length > 0 && (
          <section className="mb-8">
            <div className="panel task-reminder">
              <strong>📌 {assignments.length} tugas aktif — kelola & nilai di halaman Tugas.</strong>
              <Link href="/tugas" className="btn btn-primary btn-sm">Buka /tugas →</Link>
            </div>
          </section>
        )}

        <div className="section-head"><div><h2 className="section-title">Daftar Kelas</h2><p className="section-subtitle">Klik kelas untuk menugaskan materi AR dan melihat siswa.</p></div></div>
        {classes.length === 0 ? <div className="panel empty">Belum ada kelas. Buat kelas pertamamu lewat formulir di atas.</div> : <div className="class-grid">
          {classes.map((c, i) => <Link href={`/guru/kelas/${c.id}`} key={c.id} className="panel class-card no-underline text-inherit"><div className={`class-cover ${['', 'alt', 'green'][i % 3]}`}><div className="cover-code">KODE KELAS · {c.code}</div><div className="cover-name">{c.name}</div></div><div className="class-body"><div className="teacher-line">{c.description || 'Kelas pembelajaran Sintesa'}</div><div className="class-meta"><span className="meta-chip">{c.materials?.length || 0} materi AR</span><span className="meta-chip">{c.enrollments?.length || 0} siswa</span></div><div className="card-footer"><span className="text-xs font-semibold text-slate-500">Kode: {c.code}</span><span className="text-sm font-extrabold text-blue-600">Kelola →</span></div></div></Link>)}
        </div>}
      </main>
    </div>
  );
}
