'use client';

import { useRef, useState } from 'react';
import TaskAttachmentBox from './TaskAttachmentBox';
import FilePreview from './FilePreview';
import { SuccessOverlay, BadgeOverlay, diffBadges } from '../ui/Celebration';
import { fetchMyGamification } from '../../lib/gamification';
import { fileAbsoluteUrl, formatDate, formatSize, uploadTaskFile } from '../../lib/library';

const MAX_MB = 15;
const ACCEPT = '.png,.jpg,.jpeg,.webp,.gif,.svg,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,.mp4,.mp3';

export function dueInfo(date) {
  if (!date) return null;
  const diff = new Date(date) - new Date();
  if (diff < 0) return { label: 'Terlambat', cls: 'due-over' };
  const days = Math.ceil(diff / 86400000);
  if (days === 0) return { label: 'Hari ini!', cls: '' };
  if (days === 1) return { label: 'Besok', cls: '' };
  return { label: `${days} hari lagi`, cls: '' };
}

/** Kartu satu tugas untuk SISWA: status + file terkumpul + form upload khusus tugas. */
export default function StudentTaskCard({ task, files, onUploaded }) {
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
