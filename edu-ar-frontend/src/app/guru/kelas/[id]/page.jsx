'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AppHeader from '../../../../components/ui/AppHeader';
import AttachmentPicker from '../../../../components/tugas/AttachmentPicker';
import { apiFetch, getSavedUser } from '../../../../lib/api';
import { createAssignment, fetchClassAssignments } from '../../../../lib/library';

/** Detail kelas guru: materi AR + siswa + tugas + shortcut Library. */
export default function GuruClassDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [classData, setClassData] = useState(null);
  const [libraryMaterials, setLibraryMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [taskForm, setTaskForm] = useState({ title: '', description: '', points: 100, dueDate: '' });
  const [taskFile, setTaskFile] = useState(null);
  const [taskFileError, setTaskFileError] = useState('');
  const taskFileRef = useRef(null);
  const [creatingTask, setCreatingTask] = useState(false);

  const load = async () => {
    try {
      const [classResult, materialsResult, tugas] = await Promise.all([
        apiFetch(`/classes/${id}`),
        apiFetch('/materials'),
        fetchClassAssignments(id).catch(() => []),
      ]);
      if (!classResult.response.ok) {
        setError(classResult.data.message || 'Kelas tidak ditemukan.'); setLoading(false); return;
      }
      setClassData(classResult.data);
      setLibraryMaterials((Array.isArray(materialsResult.data) ? materialsResult.data : []).filter((m) => !m.classId));
      setAssignments(tugas);
      setLoading(false);
    } catch {
      setError('Tidak bisa terhubung ke server. Pastikan backend berjalan.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('token') || getSavedUser()?.role !== 'GURU') {
      router.replace('/login'); return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router]);

  const assign = async (materialId) => {
    setError(''); setOk('');
    const { response, data } = await apiFetch(`/materials/${materialId}/assign`, { method: 'PATCH', body: JSON.stringify({ classId: id }) });
    if (!response.ok) setError(data.message || 'Gagal menugaskan materi.');
    else { setOk('Materi AR ditugaskan ke kelas! 🎉'); await load(); }
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) { setError('Judul tugas wajib diisi.'); return; }
    setCreatingTask(true); setError(''); setOk('');
    try {
      await createAssignment({
        classId: id,
        title: taskForm.title.trim(),
        description: taskForm.description.trim() || undefined,
        points: Number(taskForm.points) || 100,
        dueDate: taskForm.dueDate || undefined,
      }, taskFile || undefined);
      setOk('Tugas dibuat! Siswa bisa mengumpulkannya di /tugas. 📌');
      setTaskForm({ title: '', description: '', points: 100, dueDate: '' });
      setTaskFile(null); setTaskFileError('');
      await load();
    } catch (err) {
      setError(err.message || 'Gagal membuat tugas.');
    } finally {
      setCreatingTask(false);
    }
  };

  if (loading) return <main className="page-loading">Memuat kelas…</main>;
  if (!classData) return <main className="page-loading">{error || 'Kelas tidak ditemukan.'}</main>;

  return (
    <div className="page-shell min-h-screen">
      <AppHeader active="dashboard" />
      <main className="container detail-layout">
        <div className="detail-top">
          <div>
            <Link href="/guru" className="back-link">← Dashboard Guru</Link>
            <h1 className="detail-title">{classData.name}</h1>
            <p className="text-sm text-slate-500">{classData.description || 'Kelola materi AR, tugas, dan siswa di kelas ini.'}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="panel px-4 py-3"><div className="text-xs text-slate-400">KODE KELAS</div><div className="font-mono font-extrabold text-blue-700 tracking-wide mt-1">{classData.code}</div></div>
            <Link href="/library" className="btn btn-primary">🗂️ Library Kelas</Link>
          </div>
        </div>
        {error && <div className="toast-error">{error}</div>}
        {ok && <div className="toast-ok">{ok}</div>}

        <section className="grid lg:grid-cols-[1.3fr_.7fr] gap-5 mb-7">
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4"><div><h2 className="font-extrabold text-lg">🧊 Materi AR di Kelas</h2><p className="text-sm text-slate-500 mt-1">Materi yang tampil sebagai misi untuk siswa.</p></div><span className="meta-chip">{classData.materials?.length || 0} materi</span></div>
            {classData.materials?.length ? <div className="grid sm:grid-cols-2 gap-4">{classData.materials.map((m) => <div key={m.id} className="rounded-2xl border border-slate-200 overflow-hidden"><div className="h-28 bg-slate-50 flex items-center justify-center">{m.assets?.[0]?.posterUrl ? <img src={m.assets[0].posterUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-4xl">🧊</span>}</div><div className="p-4"><div className="eyebrow">{m.jenjang} · {m.subject?.name}</div><div className="font-extrabold mt-1">{m.title}</div><div className="text-xs text-emerald-600 font-bold mt-1">+100 XP per penyelesaian</div></div></div>)}</div> : <div className="empty p-5">Belum ada materi yang ditugaskan.</div>}
          </div>
          <div className="panel p-5"><h2 className="font-extrabold text-lg">Siswa Bergabung</h2><p className="text-sm text-slate-500 mt-1 mb-4">Bagikan kode di atas agar siswa bisa masuk kelas.</p><div className="text-4xl font-extrabold text-blue-700">{classData.enrollments?.length || 0}</div><div className="text-sm text-slate-500 mt-1 mb-5">siswa terdaftar</div><div className="space-y-2 max-h-52 overflow-auto">{(classData.enrollments || []).map((e) => <div key={e.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm"><b>{e.student?.name}</b><div className="text-xs text-slate-400">{e.student?.email}</div></div>)}</div></div>
        </section>

        <section className="grid lg:grid-cols-[.8fr_1.2fr] gap-5 mb-7">
          <form onSubmit={createTask} className="panel p-5">
            <h2 className="font-extrabold text-lg">🎯 Buat Tugas Kelas</h2>
            <p className="text-sm text-slate-500 mt-1 mb-4">Hasilnya dikumpulkan siswa ke Library.</p>
            <div className="form-group"><label className="form-label">Judul Tugas</label><input className="input" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Contoh: Foto Praktikum Katrol" required /></div>
            <div className="form-group"><label className="form-label">Deskripsi</label><textarea className="input textarea" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Instruksi pengerjaan…" /></div>
            <div className="form-row-2">
              <div className="form-group"><label className="form-label">Poin XP</label><input type="number" min="10" max="1000" className="input" value={taskForm.points} onChange={(e) => setTaskForm({ ...taskForm, points: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Tenggat</label><input type="date" className="input" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} /></div>
            </div>
            <AttachmentPicker
              file={taskFile}
              inputRef={taskFileRef}
              error={taskFileError}
              onPick={(f, err) => { setTaskFile(f); setTaskFileError(err); }}
              onClear={() => { setTaskFile(null); setTaskFileError(''); }}
            />
            <button className="btn btn-primary w-full" disabled={creatingTask}>{creatingTask ? 'Membuat…' : '+ Buat Tugas'}</button>
          </form>
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4"><div><h2 className="font-extrabold text-lg">📌 Tugas di Kelas ({assignments.length})</h2><p className="text-sm text-slate-500 mt-1">Nilai file yang masuk di halaman Tugas.</p></div><Link href="/tugas" className="btn btn-soft btn-sm">Buka Tugas →</Link></div>
            {assignments.length ? <div className="grid sm:grid-cols-2 gap-3">{assignments.map((t) => <div key={t.id} className="assign-card"><div className="assign-head"><strong>{t.title}</strong><span className="due-pill due-done">+{t.points || 100} XP</span></div><div className="text-xs text-slate-500 mb-2">{t._count?.submissions ?? t.submissions?.length ?? 0} file masuk</div><Link href="/tugas" className="btn btn-soft btn-sm w-full">Nilai submission →</Link></div>)}</div> : <div className="empty p-5">Belum ada tugas. Buat lewat formulir di samping.</div>}
          </div>
        </section>

        <section><div className="section-head"><div><h2 className="section-title">📚 Library Materi AR</h2><p className="section-subtitle">Pilih materi yang ingin dibagikan ke kelas sebagai misi.</p></div></div>{libraryMaterials.length ? <div className="material-grid">{libraryMaterials.map((m) => <article className="panel material-card" key={m.id}><div className="material-thumb">{m.assets?.[0]?.posterUrl ? <img src={m.assets[0].posterUrl} alt="" className="w-full h-full object-cover" /> : <div className="text-5xl">🧊</div>}</div><div className="material-body"><div className="eyebrow">{m.jenjang} · {m.subject?.name}</div><h3 className="material-title">{m.title}</h3><p className="material-desc">{m.description || 'Materi visual 3D untuk pembelajaran interaktif.'}</p><div className="card-footer"><span className="text-xs text-slate-400">Siap dibagikan</span><button onClick={() => assign(m.id)} className="btn btn-primary">+ Tugaskan</button></div></div></article>)}</div> : <div className="panel empty">Semua materi library sudah ditugaskan ke suatu kelas atau belum ada data materi.</div>}</section>
      </main>
    </div>
  );
}
