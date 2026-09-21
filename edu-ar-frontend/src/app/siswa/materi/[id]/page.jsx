'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ViewerAR from '../../../../components/ARViewer/ViewerAR';
import AppHeader from '../../../../components/ui/AppHeader';
import { SuccessOverlay, BadgeOverlay, diffBadges } from '../../../../components/ui/Celebration';
import { apiFetch, getSavedUser } from '../../../../lib/api';
import { arForMaterial } from '../../../../lib/arCatalog';
import { fetchMyGamification } from '../../../../lib/gamification';
import { fetchClassAssignments } from '../../../../lib/library';

/** Detail misi AR siswa: viewer 3D/AR + instruksi + tugas terkait + XP. */
export default function StudentMaterialPage() {
  const { id } = useParams();
  const router = useRouter();
  const [material, setMaterial] = useState(null);
  const [relatedTasks, setRelatedTasks] = useState([]);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [newBadges, setNewBadges] = useState([]);

  useEffect(() => {
    if (!localStorage.getItem('token') || getSavedUser()?.role !== 'SISWA') {
      router.replace('/login');
      return;
    }

    (async () => {
      try {
        const [materialResult, classesResult] = await Promise.all([
          apiFetch(`/materials/${id}`),
          apiFetch('/classes/student-classes'),
        ]);
        if (!materialResult.response.ok) {
          setError(materialResult.data.message || 'Materi tidak ditemukan.');
          setLoading(false);
          return;
        }
        setMaterial(materialResult.data);
        const all = Array.isArray(classesResult.data) ? classesResult.data : [];
        const current = all.flatMap((c) => c.materials || []).find((m) => m.id === id);
        const isDone = Boolean(current?.progress?.completed);
        setDone(isDone);
        setLoading(false);
        await apiFetch(`/materials/${id}/progress`, { method: 'PATCH', body: JSON.stringify({ completed: isDone }) });

        // Tugas terkait dari kelas materi ini
        const classId = materialResult.data.classId || materialResult.data.class?.id;
        if (classId) {
          const tugas = await fetchClassAssignments(classId).catch(() => []);
          setRelatedTasks(tugas.filter((t) => !t.materialId || t.materialId === id).slice(0, 3));
        }
      } catch {
        setError('Tidak bisa terhubung ke server. Pastikan backend berjalan.');
        setLoading(false);
      }
    })();
  }, [id, router]);

  const markCompleted = async () => {
    setSaving(true); setError('');
    const prevBadges = !done ? (await fetchMyGamification().catch(() => null))?.badges ?? [] : [];
    const { response, data } = await apiFetch(`/materials/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ completed: !done }),
    });
    if (!response.ok) setError(data.message || 'Progress gagal disimpan.');
    else {
      const nowDone = !done;
      setDone(nowDone);
      if (nowDone) {
        const nextBadges = (await fetchMyGamification().catch(() => null))?.badges ?? [];
        setNewBadges(diffBadges(prevBadges, nextBadges));
        setSuccess(true);
      }
    }
    setSaving(false);
  };

  if (loading) return <main className="page-loading">Membuka misi AR…</main>;
  if (!material) return <main className="page-loading">{error || 'Materi tidak ditemukan.'}</main>;

  const asset = material.assets?.[0];
  const ar = arForMaterial(material);

  return (
    <div className="page-shell min-h-screen">
      <AppHeader active="dashboard" />

      <main className="container detail-layout">
        <div className="detail-top">
          <div>
            <Link href="/siswa" className="back-link">← Ruang Belajar</Link>
            <h1 className="detail-title">{material.title} <span aria-hidden="true">{ar.emoji}</span></h1>
            <p className="text-sm text-slate-500">{material.jenjang} · {material.subject?.name} · Misi +100 XP</p>
          </div>
          <button onClick={markCompleted} className={`btn ${done ? 'btn-soft' : 'btn-primary'}`} disabled={saving}>
            {saving ? 'Menyimpan…' : done ? '✓ Misi Selesai (+100 XP)' : '⚡ Tandai Selesai (+100 XP)'}
          </button>
        </div>

        {error && <div className="toast-error">{error}</div>}

        {success && (
          <SuccessOverlay
            title="Misi Selesai!"
            subtitle={`“${material.title}” selesai dijelajahi`}
            xpText="+100 XP masuk"
            buttonLabel={newBadges.length > 0 ? 'Lihat Badge 🎖' : 'Lanjut Belajar'}
            onClose={() => setSuccess(false)}
          />
        )}
        {!success && newBadges.length > 0 && (
          <BadgeOverlay badges={newBadges} onClose={() => setNewBadges([])} />
        )}

        <div className="grid lg:grid-cols-[1.6fr_.7fr] gap-5">
          <div>
            <section className="panel viewer-panel">
              <div className="viewer-frame">
                {asset?.glbUrl ? (
                  <ViewerAR glbSrc={asset.glbUrl} usdzSrc={asset.usdzUrl} posterSrc={asset.posterUrl} alt={material.title} />
                ) : (
                  <ViewerAR glbSrc={ar.glb} usdzSrc={ar.usdz} alt={material.title} />
                )}
              </div>
            </section>

            <section className="panel p-5 mt-5">
              <div className="eyebrow">📱 PANDUAN AR</div>
              <h2 className="font-extrabold text-lg mt-1">Cara memainkan misi ini</h2>
              <ol className="text-sm text-slate-600 leading-7 mt-2 ml-5 list-decimal">
                <li><strong>Putar & zoom</strong> model 3D di atas untuk eksplorasi bebas.</li>
                <li>{ar.instruction}</li>
                <li>Klik <strong>“Tandai Selesai”</strong> untuk mengklaim <strong>+100 XP</strong>.</li>
                <li>Kumpulkan tugas guru di <Link href="/tugas" className="link">/tugas</Link> (XP = poin guru) atau simpan arsip bebas di <Link href="/library" className="link">Library</Link> (tanpa XP).</li>
              </ol>
              <div className="ar-skills mt-3">
                {ar.skills.map((s) => <span key={s} className="meta-chip">{s}</span>)}
              </div>
            </section>

            {relatedTasks.length > 0 && (
              <section className="mt-5">
                <h2 className="section-title">📌 Tugas Terkait Misi Ini</h2>
                <div className="class-grid mt-4">
                  {relatedTasks.map((t) => (
                    <div key={t.id} className="assign-card">
                      <div className="assign-head"><strong>{t.title}</strong><span className="due-pill due-done">+{t.points || 100} XP</span></div>
                      <p className="text-xs text-slate-500">{t.description || 'Kumpulkan di halaman Tugas untuk dapat XP poin guru.'}</p>
                      <Link href="/tugas" className="btn btn-primary btn-sm w-full">📤 Kumpulkan di Tugas</Link>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="panel detail-side">
            <div className="eyebrow">🎯 Tentang Misi</div>
            <h2>{material.title}</h2>
            <p>{material.description || 'Gunakan kontrol pada viewer untuk memutar, memperbesar, dan melihat objek 3D dari berbagai sisi.'}</p>
            <div className="detail-badges">
              <span className="meta-chip">{material.jenjang}</span>
              <span className="meta-chip">{material.subject?.name || 'Umum'}</span>
              <span className="meta-chip">🧊 3D / AR</span>
              <span className="meta-chip">⚡ +100 XP</span>
            </div>
            <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-900 leading-6">
              <strong>🎯 Misi:</strong> {ar.mission}
            </div>
            <Link href="/tugas" className="btn btn-soft w-full mt-4">📌 Kumpulkan Tugas</Link>
            <Link href="/library" className="btn btn-soft w-full mt-2">🗂️ Arsip Library</Link>
          </aside>
        </div>
      </main>
    </div>
  );
}
