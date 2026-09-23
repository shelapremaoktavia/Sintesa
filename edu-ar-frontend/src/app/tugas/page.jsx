'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AppHeader from '../../components/ui/AppHeader';
import TaskAttachmentBox from '../../components/tugas/TaskAttachmentBox';
import FilePreview from '../../components/tugas/FilePreview';
import StudentTaskCard from '../../components/tugas/StudentTaskCard';
import { getSavedUser, apiFetch } from '../../lib/api';
import {
  deleteLibraryFile, fetchLibrary, fetchMyAssignments,
  fileAbsoluteUrl, formatDate, formatSize, gradeLibraryFile,
} from '../../lib/library';

/** Kartu satu tugas untuk GURU: daftar file masuk + nilai per file. */
function TeacherTaskCard({ task, files, onGrade, onDelete }) {
  const [preview, setPreview] = useState(null);
  const [grading, setGrading] = useState(null);
  const [gradeVal, setGradeVal] = useState('');
  const [feedbackVal, setFeedbackVal] = useState('');
  const [busyId, setBusyId] = useState('');

  const openGrade = (f) => {
    setGrading(f);
    setGradeVal(f.grade ?? '');
    setFeedbackVal(f.feedback ?? '');
  };

  const saveGrade = async () => {
    if (!grading) return;
    setBusyId(grading.id);
    try {
      await onGrade(grading.id, { grade: gradeVal === '' ? null : Number(gradeVal), feedback: feedbackVal });
      setGrading(null);
    } finally {
      setBusyId('');
    }
  };

  return (
    <article className="panel p-5">
      <div className="assign-head">
        <div>
          <div className="eyebrow">{task.class?.name || 'Kelas'}</div>
          <h3 className="font-extrabold text-lg mt-1">{task.title}</h3>
          <div className="text-xs text-slate-500 mt-1">{task.description || `Siswa mendapat +${task.points || 100} XP saat mengumpulkan.`}</div>
        </div>
        <span className="due-pill due-done">+{task.points || 100} XP · {files.length} pengumpulan</span>
      </div>
      <TaskAttachmentBox task={task} />

      {files.length === 0 ? (
        <div className="empty" style={{ padding: 18 }}>Belum ada file masuk untuk tugas ini.</div>
      ) : (
        <div className="grid gap-3 mt-3">
          {files.map((f, i) => (
            <article key={f.id} className="panel submission-card">
              <div className="submission-head">
                <span className="submission-ava" aria-hidden="true">
                  {(f.student?.name || 'S').charAt(0).toUpperCase()}
                </span>
                <span className="submission-who">
                  <strong>#{i + 1} · {f.student?.name || 'Siswa'}</strong>
                  <small>{formatDate(f.createdAt)} · {formatSize(f.sizeKb)}</small>
                </span>
                {f.grade !== null && f.grade !== undefined ? (
                  <span className={`grade-badge grade-static ${f.grade >= 75 ? 'grade-good' : 'grade-low'}`}>★ {f.grade}</span>
                ) : (
                  <span className="due-pill">Belum dinilai</span>
                )}
              </div>
              <div className="submission-file">
                <span className="submission-fname" title={f.originalName}>📄 {f.originalName}</span>
              </div>
              {f.description && <p className="submission-note">“{f.description}”</p>}
              {f.feedback && <div className="library-feedback">💬 {f.feedback}</div>}
              <div className="submission-actions">
                <button className="btn btn-soft btn-sm" onClick={() => setPreview(f)}>👁️ Preview</button>
                <a className="btn btn-soft btn-sm" href={fileAbsoluteUrl(f)} target="_blank" rel="noreferrer" download>⬇️ Unduh</a>
                <button className="btn btn-primary btn-sm" onClick={() => openGrade(f)}>★ {f.grade ?? 'Beri Nilai'}</button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={async () => {
                    if (!confirm(`Hapus pengumpulan "${f.originalName}" milik ${f.student?.name || 'siswa'}?`)) return;
                    setBusyId(f.id);
                    try { await onDelete(f.id); } finally { setBusyId(''); }
                  }}
                  disabled={busyId === f.id}
                >
                  {busyId === f.id ? '…' : '🗑️ Hapus'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <FilePreview file={preview} onClose={() => setPreview(null)} />

      {grading && (
        <div className="modal-backdrop" onClick={() => setGrading(null)}>
          <div className="modal-card modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <strong>★ Nilai: {grading.originalName}</strong>
              <button className="btn btn-soft btn-sm" onClick={() => setGrading(null)}>✕</button>
            </div>
            <div className="modal-body form-grid">
              <div className="form-group">
                <label className="form-label">Nilai (0–100)</label>
                <input type="number" min="0" max="100" className="input" value={gradeVal} onChange={(e) => setGradeVal(e.target.value)} placeholder="Contoh: 90" />
              </div>
              <div className="form-group">
                <label className="form-label">Feedback</label>
                <textarea className="input textarea" value={feedbackVal} onChange={(e) => setFeedbackVal(e.target.value)} placeholder="Pujian / saran perbaikan…" />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-soft btn-sm" onClick={() => setGrading(null)}>Batal</button>
              <button className="btn btn-primary btn-sm" disabled={busyId === grading.id} onClick={saveGrade}>
                {busyId === grading.id ? 'Menyimpan…' : '💾 Simpan Nilai'}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

/**
 * /tugas — PENGUMPULAN TUGAS (terpisah dari /library).
 * - Siswa: lihat tugas guru, kumpulkan file per tugas, XP = poin guru (sekali per tugas).
 * - Guru: pantau file masuk per tugas + beri nilai & feedback.
 * Library (/library) khusus arsip mandiri (0 XP), tanpa nilai.
 */
export default function TugasPage() {
  return (
    <Suspense fallback={<main className="page-loading">Membuka tugas…</main>}>
      <TugasContent />
    </Suspense>
  );
}

function TugasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [classes, setClasses] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('semua');
  const [classFilter, setClassFilter] = useState(() => searchParams.get('kelas') || 'semua');

  const load = useCallback(async () => {
    setError('');
    try {
      const saved = getSavedUser();
      const classPath = saved?.role === 'GURU' ? '/classes/my-classes' : '/classes/student-classes';
      const [tugas, arsip, clsRes] = await Promise.all([
        fetchMyAssignments(),
        fetchLibrary().catch(() => []),
        apiFetch(classPath).catch(() => ({ response: { ok: false }, data: [] })),
      ]);
      setTasks(tugas);
      setFiles(arsip.filter((f) => f.assignmentId || f.assignment));
      if (clsRes.response?.ok && Array.isArray(clsRes.data)) {
        setClasses(clsRes.data.filter((c) => c && c.id));
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat tugas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = getSavedUser();
    if (!token || !saved) { router.replace('/login'); return; }
    setUser(saved);
    load();
  }, [router, load]);

  const filesByTask = (taskId) => files.filter((f) => (f.assignmentId || f.assignment?.id) === taskId);
  const isDone = (t) => Boolean(t.submissions?.length || filesByTask(t.id).length);

  const visible = tasks.filter((t) => {
    if (classFilter !== 'semua' && (t.classId || t.class?.id) !== classFilter) return false;
    if (filter === 'belum') return !isDone(t);
    if (filter === 'sudah') return isDone(t);
    return true;
  });

  // Kelompokkan tugas per kelas agar guru & murid jelas melihat tugas tiap kelas.
  const grouped = useMemo(() => {
    const order = classes.map((c) => c.id);
    const map = new Map();
    const keyOf = (t) => t.classId || t.class?.id || 'tanpa-kelas';
    for (const t of visible) {
      const cid = keyOf(t);
      if (!map.has(cid)) {
        map.set(cid, {
          id: cid,
          name: t.class?.name || classes.find((c) => c.id === cid)?.name || 'Tanpa kelas',
          code: t.class?.code || classes.find((c) => c.id === cid)?.code || '',
          tasks: [],
        });
      }
      map.get(cid).tasks.push(t);
    }
    // Kelas yang dipilih tapi belum punya tugas tetap tampil (dengan CTA buat tugas utk guru).
    if (classFilter !== 'semua' && !map.has(classFilter)) {
      const c = classes.find((x) => x.id === classFilter);
      if (c) map.set(classFilter, { id: c.id, name: c.name, code: c.code || '', tasks: [] });
    }
    const rank = (id) => (order.includes(id) ? order.indexOf(id) : order.length);
    return [...map.values()].sort((a, b) => rank(a.id) - rank(b.id));
  }, [visible, classes, classFilter]);

  const renderCard = (t) => (
    user?.role === 'GURU' ? (
      <TeacherTaskCard
        key={t.id}
        task={t}
        files={filesByTask(t.id)}
        onGrade={async (id, p) => { await gradeLibraryFile(id, p); await load(); }}
        onDelete={async (id) => { await deleteLibraryFile(id); await load(); }}
      />
    ) : (
      <StudentTaskCard key={t.id} task={t} files={[...(t.submissions || []), ...filesByTask(t.id)].filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i)} onUploaded={load} />
    )
  );

  const doneCount = tasks.filter(isDone).length;
  const totalXp = tasks.reduce((s, t) => (isDone(t) ? s + (Number(t.points) || 100) : s), 0);

  if (!user && loading) return <main className="page-loading">Membuka tugas…</main>;

  return (
    <div className="page-shell">
      <AppHeader active="tugas" />
      <div className="container hero">
        <section className="hero-card">
          <p className="text-sm font-semibold text-white/75">📌 PENGUMPULAN TUGAS</p>
          <h1 className="hero-title">Halo, {user?.name?.split(' ')[0] || 'Penjelajah'}! {user?.role === 'GURU' ? 'Nilai karya siswamu di sini.' : 'Kumpulkan tugas gurumu di sini.'}</h1>
          <p className="hero-text">
            {user?.role === 'GURU'
              ? 'Setiap tugas menampilkan file yang masuk. Beri nilai 0–100 + feedback langsung per file.'
              : 'Pilih tugas → unggah file → XP sebesar poin guru masuk otomatis (dihitung sekali per tugas, upload revisi tidak menambah XP lagi).'}
          </p>
          <div className="hero-stat">
            <span className="stat-pill">📌 {tasks.length} tugas</span>
            {user?.role === 'SISWA' && (
              <>
                <span className="stat-pill">✅ {doneCount} terkumpul</span>
                <span className="stat-pill">⚡ {totalXp} XP dari tugas</span>
              </>
            )}
            {user?.role === 'GURU' && <span className="stat-pill">📥 {files.length} file masuk</span>}
          </div>
          <div className="quick-links mt-3">
            <Link href="/library" className="btn btn-light btn-sm">🗂️ Arsip Library</Link>
            <Link href={user?.role === 'GURU' ? '/guru' : '/siswa'} className="btn btn-outline-light btn-sm">← Dashboard</Link>
          </div>
        </section>
      </div>

      <main className="container section">
        {error && <div className="toast-error">{error}</div>}

        <div className="panel library-toolbar">
          <div className="library-pills">
            {[['semua', '🌍 Semua'], ['belum', '🔥 Belum kumpul'], ['sudah', '✅ Sudah kumpul']].map(([id, label]) => (
              <button key={id} onClick={() => setFilter(id)} className={`pill-btn ${filter === id ? 'pill-active' : ''}`}>{label}</button>
            ))}
          </div>
          <button className="btn btn-soft btn-sm" onClick={load}>🔄 Muat ulang</button>
        </div>

        {classes.length > 0 && (
          <section className="mb-3">
            <div className="section-head">
              <div>
                <h2 className="section-title">🏫 Shortcut Kelas</h2>
                <p className="section-subtitle">Pilih kelas untuk melihat tugas yang sedang berjalan di kelas itu.</p>
              </div>
            </div>
            <div className="class-shortcut-row">
              <button
                onClick={() => setClassFilter('semua')}
                className={`class-shortcut ${classFilter === 'semua' ? 'class-shortcut-active' : ''}`}
              >
                <span className="class-shortcut-icon">🌍</span>
                <span className="class-shortcut-text"><strong>Semua Kelas</strong><small>{tasks.length} tugas</small></span>
              </button>
              {classes.map((c, i) => {
                const n = tasks.filter((t) => (t.classId || t.class?.id) === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setClassFilter(classFilter === c.id ? 'semua' : c.id)}
                    className={`class-shortcut ${classFilter === c.id ? 'class-shortcut-active' : ''}`}
                  >
                    <span className={`class-shortcut-cover cover-${i % 3}`}>{(c.name || 'K').charAt(0).toUpperCase()}</span>
                    <span className="class-shortcut-text"><strong>{c.name}</strong><small>{c.code} · {n} tugas</small></span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {loading ? (
          <div className="panel empty">⏳ Memuat tugas…</div>
        ) : visible.length === 0 ? (
          <div className="panel empty">
            <div className="text-4xl mb-3">📌</div>
            <h3 className="font-extrabold text-lg text-slate-700">{tasks.length === 0 ? 'Belum ada tugas' : 'Tidak ada tugas pada filter ini'}</h3>
            <p className="text-sm mt-1">{tasks.length === 0 ? (user?.role === 'GURU' ? 'Buat tugas dari dashboard guru atau halaman kelas.' : 'Minta gurumu membuat tugas di kelas.') : 'Coba filter lain.'}</p>
          </div>
        ) : (
          <div className="grid gap-6" style={{ gridTemplateColumns: '1fr', maxWidth: 860 }}>
            {grouped.map((g) => (
              <section key={g.id}>
                <div className="tugas-class-head">
                  <div>
                    <span className="eyebrow">🏫 KELAS</span>
                    <h2 className="tugas-class-name">
                      {g.name} {g.code && <span className="meta-chip">Kode {g.code}</span>}
                    </h2>
                  </div>
                  <span className="flex gap-2 items-center flex-wrap">
                    <span className="meta-chip">{g.tasks.length} tugas</span>
                    {user?.role === 'GURU' && g.id !== 'tanpa-kelas' && (
                      <Link href={`/guru/kelas/${g.id}`} className="btn btn-primary btn-sm">＋ Tugas Baru</Link>
                    )}
                  </span>
                </div>
                {g.tasks.length === 0 ? (
                  <div className="panel empty" style={{ padding: 20 }}>
                    Belum ada tugas di kelas ini.
                    {user?.role === 'GURU' && g.id !== 'tanpa-kelas' && (
                      <div><Link href={`/guru/kelas/${g.id}`} className="btn btn-primary btn-sm mt-3">＋ Buat Tugas di Kelas Ini</Link></div>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-5">{g.tasks.map(renderCard)}</div>
                )}
              </section>
            ))}
          </div>
        )}

        <aside className="panel library-side-card mt-6" style={{ maxWidth: 860 }}>
          <h4>❓ Bedanya Tugas vs Library?</h4>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.9, color: '#33475f' }}>
            <li><strong>📌 /tugas (halaman ini):</strong> wajib pilih tugas guru → XP = poin guru → bisa dinilai.</li>
            <li><strong>🗂️ /library:</strong> arsip bebas tanpa tugas → 0 XP → tidak dinilai.</li>
          </ul>
        </aside>
      </main>
    </div>
  );
}
