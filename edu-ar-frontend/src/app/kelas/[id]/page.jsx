'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AppHeader from '../../../components/ui/AppHeader';
import StudentTaskCard from '../../../components/tugas/StudentTaskCard';
import { apiFetch, getSavedUser } from '../../../lib/api';
import { fetchClassAssignments } from '../../../lib/library';
import { formatDate } from '../../../lib/library';

const TABS = [
  { id: 'forum', label: 'Forum' },
  { id: 'tugas', label: 'Tugas Kelas' },
  { id: 'materi', label: 'Misi AR' },
];

/**
 * /kelas/[id] — halaman dalam kelas untuk MURID (gaya feed kelas).
 * - Banner kelas + tab Forum / Tugas Kelas / Misi AR
 * - Forum: kartu "Mendatang" (tenggat terdekat) + linimasa aktivitas
 * - Guru otomatis diarahkan ke halaman kelola kelas.
 */
export default function StudentClassPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [classData, setClassData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [tab, setTab] = useState('forum');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [classRes, tugas, mine] = await Promise.all([
        apiFetch(`/classes/${id}`),
        fetchClassAssignments(id).catch(() => []),
        apiFetch('/classes/student-classes').catch(() => ({ response: { ok: false }, data: [] })),
      ]);
      if (!classRes.response.ok) {
        setError(classRes.data.message || 'Kelas tidak ditemukan.');
        setLoading(false);
        return;
      }
      setClassData(classRes.data);
      setAssignments(Array.isArray(tugas) ? tugas : []);
      const map = {};
      if (mine.response?.ok && Array.isArray(mine.data)) {
        const found = mine.data.find((c) => c.id === id);
        (found?.materials || []).forEach((m) => { map[m.id] = m.progress || null; });
      }
      setProgressMap(map);
    } catch {
      setError('Tidak bisa terhubung ke server. Pastikan backend berjalan.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = getSavedUser();
    if (!token || !saved) { router.replace('/login'); return; }
    if (saved.role === 'GURU') { router.replace(`/guru/kelas/${id}`); return; }
    if (saved.role === 'ADMIN') { router.replace('/admin'); return; }
    setUser(saved);
    load();
  }, [id, router, load]);

  const pending = useMemo(
    () => assignments
      .filter((t) => !(t.submissions?.length))
      .sort((a, b) => new Date(a.dueDate || '9999') - new Date(b.dueDate || '9999')),
    [assignments]
  );

  const feed = useMemo(() => {
    const rows = [
      ...assignments.map((t) => ({ kind: 'tugas', date: t.createdAt, ref: t })),
      ...(classData?.materials || []).map((m) => ({ kind: 'materi', date: m.createdAt, ref: m })),
    ];
    return rows.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [assignments, classData]);

  const materials = classData?.materials || [];
  const doneCount = materials.filter((m) => progressMap[m.id]?.completed).length;
  const pct = materials.length ? Math.round((doneCount / materials.length) * 100) : 0;

  if (loading) return <main className="page-loading">Membuka kelas…</main>;
  if (!classData) return <main className="page-loading">{error || 'Kelas tidak ditemukan.'}</main>;

  return (
    <div className="page-shell">
      <AppHeader active="dashboard" />

      <main className="container section">
        {error && <div className="toast-error">{error}</div>}

        {/* Banner kelas */}
        <section className="class-banner">
          <div className="class-banner-text">
            <p className="text-sm font-semibold text-white/75">🏫 KELAS 10 RPL · Kode {classData.code}</p>
            <h1 className="class-banner-title">{classData.name}</h1>
            <p className="class-banner-sub">Guru: {classData.teacher?.name || '—'} · {materials.length} misi AR · {assignments.length} tugas</p>
            <div className="class-banner-progress">
              <div className="progress-track" style={{ background: 'rgba(255,255,255,.25)', marginTop: 0 }}>
                <div className="progress-fill" style={{ width: `${pct}%`, background: '#fde68a' }} />
              </div>
              <span className="text-xs font-bold">{doneCount}/{materials.length} misi selesai</span>
            </div>
          </div>
          <div className="class-banner-emoji" aria-hidden="true">🧊</div>
        </section>

        {/* Tab ala forum kelas */}
        <div className="class-tabs">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`class-tab ${tab === t.id ? 'class-tab-active' : ''}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'forum' && (
          <div className="class-forum-grid">
            <div className="panel p-5">
              <h2 className="font-extrabold text-lg">📌 Mendatang</h2>
              {pending.length === 0 ? (
                <p className="text-sm text-slate-500 mt-2">Hore, tidak ada tugas yang perlu segera diselesaikan!</p>
              ) : (
                <div className="grid gap-2 mt-3">
                  {pending.slice(0, 3).map((t) => (
                    <div key={t.id} className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-sm">
                      <strong>{t.title}</strong>
                      <div className="text-xs text-slate-500">{t.dueDate ? `Tenggat ${formatDate(t.dueDate)}` : 'Tanpa tenggat'} · +{t.points || 100} XP</div>
                    </div>
                  ))}
                </div>
              )}
              <button className="link text-sm mt-3" onClick={() => setTab('tugas')}>Lihat semua →</button>
            </div>

            <div className="grid gap-3">
              {feed.length === 0 && <div className="panel empty">Belum ada aktivitas di kelas ini.</div>}
              {feed.map((item, i) => (
                item.kind === 'tugas' ? (
                  <Link key={`t-${item.ref.id}`} href={`/tugas?kelas=${id}`} className="panel feed-row no-underline text-inherit">
                    <span className="feed-icon">📝</span>
                    <span className="feed-text">
                      <strong>{item.ref.title}</strong>
                      <small>{formatDate(item.ref.createdAt)} · +{item.ref.points || 100} XP · {item.ref.submissions?.length ? '✓ Sudah dikumpulkan' : 'Belum dikumpulkan'}</small>
                    </span>
                    <span className="drawer-arrow" aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <Link key={`m-${item.ref.id}`} href={`/siswa/materi/${item.ref.id}`} className="panel feed-row no-underline text-inherit">
                    <span className="feed-icon">🧊</span>
                    <span className="feed-text">
                      <strong>{item.ref.title}</strong>
                      <small>{formatDate(item.ref.createdAt)} · Misi AR +100 XP · {progressMap[item.ref.id]?.completed ? '✓ Selesai' : 'Belum dibuka'}</small>
                    </span>
                    <span className="drawer-arrow" aria-hidden="true">→</span>
                  </Link>
                )
              ))}
            </div>
          </div>
        )}

        {tab === 'tugas' && (
          <div className="grid gap-5" style={{ maxWidth: 860 }}>
            {assignments.length === 0 && <div className="panel empty">Belum ada tugas di kelas ini.</div>}
            {assignments.map((t) => (
              <StudentTaskCard key={t.id} task={{ ...t, class: t.class || { id, name: classData.name } }} files={t.submissions || []} onUploaded={load} />
            ))}
          </div>
        )}

        {tab === 'materi' && (
          materials.length === 0 ? (
            <div className="panel empty">Guru belum membagikan materi di kelas ini.</div>
          ) : (
            <div className="material-grid">
              {materials.map((m) => (
                <article key={m.id} className="panel material-card">
                  <div className="material-thumb">
                    <div className="text-center px-5 text-blue-700/70">
                      <div className="text-5xl mb-2">🧊</div>
                      <div className="text-xs font-bold">3D / AR READY · +100 XP</div>
                    </div>
                  </div>
                  <div className="material-body">
                    <div className="eyebrow">{m.jenjang} · {m.subject?.name || 'Materi'}</div>
                    <h3 className="material-title">{m.title}</h3>
                    <div className="card-footer">
                      <span className={`text-xs font-extrabold ${progressMap[m.id]?.completed ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {progressMap[m.id]?.completed ? '✓ Selesai' : 'Belum dibuka'}
                      </span>
                      <Link href={`/siswa/materi/${m.id}`} className="btn btn-primary">Buka Misi</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
