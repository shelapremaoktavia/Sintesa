'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppHeader from '../../components/ui/AppHeader';
import TaskAttachmentBox from '../../components/tugas/TaskAttachmentBox';
import FilePreview from '../../components/tugas/FilePreview';
import { SuccessOverlay, BadgeOverlay, diffBadges } from '../../components/ui/Celebration';
import { getSavedUser } from '../../lib/api';
import { fetchMyGamification } from '../../lib/gamification';
import {
  deleteLibraryFile, fetchLibrary, fetchMyAssignments,
  fileAbsoluteUrl, formatDate, formatSize, gradeLibraryFile, uploadTaskFile,
} from '../../lib/library';

const MAX_MB = 15;
const ACCEPT = '.png,.jpg,.jpeg,.webp,.gif,.svg,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,.mp4,.mp3';

function dueInfo(date) {
  if (!date) return null;
  const diff = new Date(date) - new Date();
  if (diff < 0) return { label: 'Terlambat', cls: 'due-over' };
  const days = Math.ceil(diff / 86400000);
  if (days === 0) return { label: 'Hari ini!', cls: '' };
  if (days === 1) return { label: 'Besok', cls: '' };
  return { label: `${days} hari lagi`, cls: '' };
}

/** Kartu satu tugas untuk SISWA: status + file terkumpul + form upload khusus tugas. */
function StudentTaskCard({ task, files, onUploaded }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [success, setSuccess] = useState(null);
  const [newBadges, setNewBadges] = useState([]);
  const [preview, setPreview] = useState(null);

  const submitted = files.length > 0;
  const points = Number(task.points) || 100;
  const due = dueInfo(task.dueDate);
  const graded = files.find((f) => f.grade !== null && f.grade !== undefined);

  const pick = (f) => {
    setError(''); setOk('');
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`Ukuran file maksimal ${MAX_MB} MB.`);
      return;
    }
    setFile(f);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file || busy) return;
    setBusy(true); setError(''); setOk('');
    const firstTime = !submitted;
    const prevBadges = (await fetchMyGamification().catch(() => null))?.badges ?? [];
    try {
      const res = await uploadTaskFile({ file, assignment: task, description: note.trim() || undefined });
      const xp = res.earnedXp ?? points;
      setOk(`Terkumpul! +${xp} XP masuk 🎉${submitted ? ' (tugas ini sudah dinilai sekali, upload tambahan tidak menambah XP lagi)' : ''}`);
      setFile(null); setNote('');
      if (inputRef.current) inputRef.current.value = '';
      onUploaded?.();
      const nextBadges = (await fetchMyGamification().catch(() => null))?.badges ?? [];
      setNewBadges(diffBadges(prevBadges, nextBadges));
      setSuccess({ xp, firstTime });
    } catch (err) {
      setError(err.message || 'Gagal mengumpulkan tugas.');
    } finally {
      setBusy(false);
    }
  };

  const closeSuccess = () => setSuccess(null);

  return (
    <>
    <article className="panel p-5">
      <div className="assign-head">
        <div>
          <div className="eyebrow">{task.class?.name || 'Kelas'} {task.material ? `· ${task.material.title}` : ''}</div>
          <h3 className="font-extrabold text-lg mt-1">{task.title}</h3>
        </div>
        <span className={`due-pill ${submitted ? 'due-done' : due?.cls || ''}`}>
          {submitted ? `✓ Terkumpul · +${points} XP` : due ? due.label : `+${points} XP`}
        </span>
      </div>
      {task.description && <p className="text-sm text-slate-500 leading-6">{task.description}</p>}
      <TaskAttachmentBox task={task} />

      {files.length > 0 && (
        <div className="mt-3 grid gap-2">
          {files.map((f) => (
            <div key={f.id} className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-sm flex items-center justify-between gap-2 flex-wrap">
              <span className="font-bold truncate">📄 {f.originalName} <span className="font-normal text-slate-400">· {formatSize(f.sizeKb)} · {formatDate(f.createdAt)}</span></span>
              <span className="flex gap-2">
                <button className="btn btn-soft btn-sm" onClick={() => setPreview(f)}>👁️ Preview</button>
                <a className="btn btn-soft btn-sm" href={fileAbsoluteUrl(f)} target="_blank" rel="noreferrer" download>⬇️</a>
                {f.grade !== null && f.grade !== undefined && <span className="due-pill due-done">★ {f.grade}</span>}
              </span>
            </div>
          ))}
          {graded?.feedback && <div className="library-feedback">💬 Guru: {graded.feedback}</div>}
        </div>
      )}

      <form onSubmit={submit} className="mt-4">
        {error && <div className="toast-error">{error}</div>}
        {ok && <div className="toast-ok">{ok}</div>}
        <div className="flex gap-2 flex-wrap">
          <button type="button" onClick={() => inputRef.current?.click()} className={`dropzone ${file ? 'dropzone-filled' : ''}`} style={{ marginBottom: 0, padding: '14px' }}>
            <strong>{file ? `📄 ${file.name}` : submitted ? '＋ Tambah / revisi file' : '📤 Pilih file tugas'}</strong>
            <small>Maks. {MAX_MB} MB · PNG/JPG/PDF/DOC/PPT/XLS/ZIP/MP4</small>
          </button>
          <input ref={inputRef} type="file" accept={ACCEPT} className="hidden-input" onChange={(e) => pick(e.target.files?.[0])} />
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          <input className="input" style={{ flex: 1, minWidth: 200 }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan (opsional)" maxLength={280} />
          <button className="btn btn-primary" disabled={!file || busy}>{busy ? 'Mengumpulkan…' : submitted ? 'Kumpulkan Revisi' : `Kumpulkan (+${points} XP)`}</button>
        </div>
      </form>
    </article>
    {success && (
      <SuccessOverlay
        title="Horey!"
        subtitle={`Tugas “${task.title}” telah terkirim`}
        xpText={success.firstTime ? `+${success.xp} XP masuk` : 'Revisi tersimpan'}
        buttonLabel={newBadges.length > 0 ? 'Lihat Badge 🎖' : 'Kembali ke Tugas'}
        onClose={closeSuccess}
      />
    )}
    {!success && newBadges.length > 0 && (
      <BadgeOverlay badges={newBadges} onClose={() => setNewBadges([])} />
    )}
    <FilePreview file={preview} onClose={() => setPreview(null)} />
    </>
  );
}

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
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('semua');

  const load = useCallback(async () => {
    setError('');
    try {
      const [tugas, arsip] = await Promise.all([
        fetchMyAssignments(),
        fetchLibrary().catch(() => []),
      ]);
      setTasks(tugas);
      setFiles(arsip.filter((f) => f.assignmentId || f.assignment));
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

  const visible = tasks.filter((t) => {
    if (filter === 'belum') return !(t.submissions?.length || filesByTask(t.id).length);
    if (filter === 'sudah') return (t.submissions?.length || filesByTask(t.id).length);
    return true;
  });

  const doneCount = tasks.filter((t) => (t.submissions?.length || filesByTask(t.id).length)).length;
  const totalXp = tasks.reduce((s, t) => {
    const done = t.submissions?.length || filesByTask(t.id).length;
    return done ? s + (Number(t.points) || 100) : s;
  }, 0);

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

        {loading ? (
          <div className="panel empty">⏳ Memuat tugas…</div>
        ) : visible.length === 0 ? (
          <div className="panel empty">
            <div className="text-4xl mb-3">📌</div>
            <h3 className="font-extrabold text-lg text-slate-700">{tasks.length === 0 ? 'Belum ada tugas' : 'Tidak ada tugas pada filter ini'}</h3>
            <p className="text-sm mt-1">{tasks.length === 0 ? (user?.role === 'GURU' ? 'Buat tugas dari dashboard guru.' : 'Minta gurumu membuat tugas di kelas.') : 'Coba filter lain.'}</p>
          </div>
        ) : (
          <div className="grid gap-5" style={{ gridTemplateColumns: '1fr', maxWidth: 860 }}>
            {visible.map((t) => (
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
