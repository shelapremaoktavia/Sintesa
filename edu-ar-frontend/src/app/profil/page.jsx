'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppHeader from '../../components/ui/AppHeader';
import { apiFetch, avatarUrlOf, getSavedUser, logout, updateMe, uploadAvatar } from '../../lib/api';
import { BADGES, fetchMyGamification, levelForXp } from '../../lib/gamification';
import { fetchMyAssignments } from '../../lib/library';

function Row({ icon, label, value, href, onClick, children }) {
  const [open, setOpen] = useState(false);
  const expandable = children !== undefined;
  const body = (
    <>
      <span className="profil-row-icon" aria-hidden="true">{icon}</span>
      <span className="profil-row-text">
        <strong>{label}</strong>
        {value && <small>{value}</small>}
      </span>
      <span className="profil-chevron" aria-hidden="true">{expandable ? (open ? '▾' : '▸') : '→'}</span>
    </>
  );
  return (
    <div className="profil-row-wrap">
      {href ? (
        <Link href={href} className="profil-row no-underline" onClick={onClick}>{body}</Link>
      ) : (
        <button type="button" className="profil-row" onClick={expandable ? () => setOpen((v) => !v) : onClick}>
          {body}
        </button>
      )}
      {expandable && open && <div className="profil-row-body">{children}</div>}
    </div>
  );
}

/**
 * /profil — halaman profil ala aplikasi (header warna, avatar + ganti foto,
 * statistik, menu lipat-buka). Dibuka dengan menekan nama/foto di menu garis-3.
 */
export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [gami, setGami] = useState(null);
  const [classes, setClasses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [name, setName] = useState('');
  const [pwOld, setPwOld] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState('');
  const [error, setError] = useState('');
  const avatarInputRef = useRef(null);

  const load = useCallback(async (saved) => {
    try {
      const role = saved?.role;
      if (role === 'SISWA') {
        const [myGami, tugas, clsRes] = await Promise.all([
          fetchMyGamification().catch(() => null),
          fetchMyAssignments().catch(() => []),
          apiFetch('/classes/student-classes').catch(() => ({ response: { ok: false }, data: [] })),
        ]);
        setGami(myGami);
        setTasks(Array.isArray(tugas) ? tugas : []);
        if (clsRes.response?.ok && Array.isArray(clsRes.data)) setClasses(clsRes.data);
      } else if (role === 'GURU') {
        const [clsRes, tugas] = await Promise.all([
          apiFetch('/classes/my-classes').catch(() => ({ response: { ok: false }, data: [] })),
          fetchMyAssignments().catch(() => []),
        ]);
        if (clsRes.response?.ok && Array.isArray(clsRes.data)) setClasses(clsRes.data);
        setTasks(Array.isArray(tugas) ? tugas : []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = getSavedUser();
    if (!token || !saved) { router.replace('/login'); return; }
    setUser(saved);
    setName(saved.name || '');
    load(saved);
  }, [router, load]);

  const refreshUser = async () => {
    const { response, data } = await apiFetch('/auth/me');
    if (response.ok && data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setName(data.user.name || '');
    }
  };

  const handleAvatar = async (file) => {
    setAvatarError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) { setAvatarError('File harus berupa gambar.'); return; }
    if (file.size > 2 * 1024 * 1024) { setAvatarError('Ukuran foto maksimal 2 MB.'); return; }
    setAvatarBusy(true);
    try {
      await uploadAvatar(file);
      await refreshUser();
    } catch (err) {
      setAvatarError(err.message || 'Gagal mengunggah foto.');
    } finally {
      setAvatarBusy(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setOk('');
    try {
      const payload = {};
      if (name.trim() && name.trim() !== user.name) payload.name = name.trim();
      if (pwNew) { payload.currentPassword = pwOld; payload.newPassword = pwNew; }
      const data = await updateMe(payload);
      setUser((u) => ({ ...u, ...data.user }));
      setPwOld(''); setPwNew('');
      setOk(data.message || 'Profil diperbarui.');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return <main className="page-loading">Membuka profil…</main>;

  const isSiswa = user.role === 'SISWA';
  const isGuru = user.role === 'GURU';
  const lvl = levelForXp(gami?.xp ?? 0);
  const avatarSrc = avatarUrlOf(user);
  const roleLabel = user.role === 'ADMIN' ? 'Admin' : isGuru ? 'Guru' : 'Murid';
  const earned = gami?.badges?.length ?? 0;
  const doneTasks = tasks.filter((t) => t.submissions?.length > 0).length;
  const grades = tasks.flatMap((t) => t.submissions || []).map((s) => s.grade).filter((g) => g !== null && g !== undefined);
  const avgGrade = grades.length ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length) : null;
  const studentCount = classes.reduce((a, c) => a + (c.enrollments?.length || 0), 0);

  const stats = isSiswa
    ? [
        { icon: '⚡', value: `${gami?.xp ?? 0}`, label: 'Total XP' },
        { icon: lvl.icon, value: `Lv.${lvl.level}`, label: lvl.title },
        { icon: '🏅', value: `${earned}/${BADGES.length}`, label: 'Badge' },
      ]
    : isGuru
      ? [
          { icon: '🏫', value: `${classes.length}`, label: 'Kelas' },
          { icon: '📌', value: `${tasks.length}`, label: 'Tugas' },
          { icon: '🧑‍🎓', value: `${studentCount}`, label: 'Murid' },
        ]
      : [{ icon: '🛡️', value: 'Admin', label: 'Pengelola' }];

  return (
    <div className="page-shell">
      <AppHeader active="" />

      <main className="container section">
        {error && <div className="toast-error">{error}</div>}
        {ok && <div className="toast-ok">{ok}</div>}

        {/* Kepala profil */}
        <section className="profil-head">
          <span className="profil-avatar-wrap">
            {avatarSrc ? (
              <img src={avatarSrc} alt={user.name} className="profil-avatar" />
            ) : (
              <span className="profil-avatar profil-avatar-initial">{(user.name || 'E').charAt(0).toUpperCase()}</span>
            )}
            <button
              type="button" className="avatar-cam profil-cam"
              title={avatarBusy ? 'Mengunggah…' : 'Ganti foto profil'}
              aria-label="Ganti foto profil" disabled={avatarBusy}
              onClick={() => avatarInputRef.current?.click()}
            >
              {avatarBusy ? '…' : '📷'}
            </button>
            <input
              ref={avatarInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden-input" onChange={(e) => handleAvatar(e.target.files?.[0])}
            />
          </span>
          <h1 className="profil-name">{user.name}</h1>
          <p className="profil-role">{roleLabel} · Kelas 10 RPL</p>
          <span className="profil-email">{user.email}</span>
          {avatarError && <p className="avatar-err" style={{ margin: '8px 0 0' }}>{avatarError}</p>}
        </section>

        {/* Statistik */}
        <section className="profil-stats">
          {stats.map((s) => (
            <div key={s.label} className="profil-stat">
              <span className="profil-stat-icon" aria-hidden="true">{s.icon}</span>
              <strong>{s.value}</strong>
              <small>{s.label}</small>
            </div>
          ))}
        </section>

        {/* Menu */}
        <section className="profil-menu">
          <Row icon="✏️" label="Edit Profil" value="Nama & password">
            <form onSubmit={saveProfile} className="form-grid">
              <div className="form-group">
                <label className="form-label">Nama lengkap</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Password lama</label>
                  <input className="input" type="password" value={pwOld} onChange={(e) => setPwOld(e.target.value)} placeholder="Isi bila ganti password" />
                </div>
                <div className="form-group">
                  <label className="form-label">Password baru</label>
                  <input className="input" type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} placeholder="Min. 6 karakter" />
                </div>
              </div>
              <button className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan…' : '💾 Simpan Perubahan'}</button>
            </form>
          </Row>

          {(isSiswa || isGuru) && (
            <Row icon="🏫" label="Kelas Saya" value={`${classes.length} kelas`}>
              <div className="grid gap-2">
                {classes.length === 0 && <p className="text-sm text-slate-500">Belum ada kelas.</p>}
                {classes.map((c) => (
                  <Link
                    key={c.id}
                    href={isGuru ? `/guru/kelas/${c.id}` : `/kelas/${c.id}`}
                    className="drawer-sub no-underline"
                  >
                    <span className="drawer-sub-text">
                      <strong>{c.name}</strong>
                      <small>Kode {c.code}</small>
                    </span>
                    <span className="drawer-arrow" aria-hidden="true">→</span>
                  </Link>
                ))}
                {isSiswa && <Link href="/ar#gabung" className="btn btn-soft btn-sm">＋ Gabung Kelas Lain</Link>}
              </div>
            </Row>
          )}

          {isSiswa && (
            <Row
              icon="📌" label="Tugas Saya"
              value={`${doneTasks}/${tasks.length} terkumpul${avgGrade !== null ? ` · ★${avgGrade}` : ''}`}
              href="/tugas"
            />
          )}
          {isGuru && (
            <Row icon="📌" label="Tugas & Nilai" value={`${tasks.length} tugas`} href="/tugas" />
          )}
          {(isSiswa || isGuru) && (
            <Row icon="🗂️" label="Library Arsip" value="Penyimpanan file" href="/library" />
          )}
          <Row icon="🧊" label="Misi AR" value="6 misi RPL" href="/ar" />
          {user.role === 'ADMIN' && (
            <Row icon="🛡️" label="Panel Admin" value="Kelola akun guru" href="/admin" />
          )}
          <Row icon="🚪" label="Keluar" value="Akhiri sesi ini" onClick={() => logout(router)} />
        </section>
      </main>
    </div>
  );
}
