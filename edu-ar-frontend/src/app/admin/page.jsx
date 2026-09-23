'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppHeader from '../../components/ui/AppHeader';
import { apiFetch, getSavedUser } from '../../lib/api';

/**
 * /admin — khusus ADMIN: membuat akun guru + melihat daftar pengguna.
 * Pendaftaran publik selalu menjadi murid; guru hanya dibuat di sini.
 */
export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState('semua');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const load = useCallback(async () => {
    setError('');
    const { response, data } = await apiFetch('/admin/users');
    if (!response.ok) setError(data.message || 'Gagal memuat pengguna.');
    else setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = getSavedUser();
    if (!token) { router.replace('/login'); return; }
    if (saved?.role !== 'ADMIN') { router.replace(saved?.role === 'GURU' ? '/guru' : '/siswa'); return; }
    setUser(saved);
    load();
  }, [router, load]);

  const createTeacher = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Nama, email, dan password guru wajib diisi.');
      return;
    }
    setCreating(true); setError(''); setOk('');
    const { response, data } = await apiFetch('/admin/teachers', {
      method: 'POST',
      body: JSON.stringify({ name: form.name.trim(), email: form.email.trim(), password: form.password }),
    });
    if (!response.ok) setError(data.message || 'Gagal membuat akun guru.');
    else {
      setOk(data.message || 'Akun guru dibuat.');
      setForm({ name: '', email: '', password: '' });
      await load();
    }
    setCreating(false);
  };

  if (loading) return <main className="page-loading">Membuka panel admin…</main>;

  const counts = {
    semua: users.length,
    GURU: users.filter((u) => u.role === 'GURU').length,
    SISWA: users.filter((u) => u.role === 'SISWA').length,
    ADMIN: users.filter((u) => u.role === 'ADMIN').length,
  };
  const visible = filter === 'semua' ? users : users.filter((u) => u.role === filter);
  const roleIcon = (r) => (r === 'ADMIN' ? '🛡️' : r === 'GURU' ? '👩‍🏫' : '🧑‍🎓');

  return (
    <div className="page-shell min-h-screen">
      <AppHeader active="dashboard" />

      <main className="container section pt-9">
        <div className="section-head">
          <div>
            <div className="eyebrow">🛡️ PANEL ADMIN</div>
            <h1 className="section-title text-3xl mt-1">Halo, {user?.name?.split(' ')[0] || 'Admin'}! Kelola akun guru.</h1>
            <p className="section-subtitle">Pendaftaran publik otomatis menjadi murid. Akun guru hanya dibuat di sini.</p>
          </div>
          <div className="quick-links">
            <Link href="/ar" className="btn btn-soft btn-sm">🧊 Misi AR</Link>
            <Link href="/" className="btn btn-soft btn-sm">🏠 Beranda</Link>
          </div>
        </div>

        {error && <div className="toast-error">{error}</div>}
        {ok && <div className="toast-ok">{ok}</div>}

        <section className="gami-strip">
          <div className="panel gami-card">
            <span className="gami-icon" style={{ background: '#e0f2fe' }}>🧑‍🎓</span>
            <div><div className="gami-num">{counts.SISWA}</div><div className="gami-label">Akun murid</div></div>
          </div>
          <div className="panel gami-card">
            <span className="gami-icon" style={{ background: '#fef3c7' }}>👩‍🏫</span>
            <div><div className="gami-num">{counts.GURU}</div><div className="gami-label">Akun guru</div></div>
          </div>
          <div className="panel gami-card">
            <span className="gami-icon" style={{ background: '#dcfce7' }}>🛡️</span>
            <div><div className="gami-num">{counts.ADMIN}</div><div className="gami-label">Akun admin</div></div>
          </div>
        </section>

        <section className="grid lg:grid-cols-[.7fr_1.3fr] gap-5">
          <form onSubmit={createTeacher} className="panel p-5">
            <h2 className="font-extrabold text-lg">＋ Buat Akun Guru</h2>
            <p className="text-sm text-slate-500 mt-1 mb-4">Guru login dengan email & password ini.</p>
            <div className="form-group"><label className="form-label">Nama Guru</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Bu Ratna" required /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="guru@sekolah.id" required /></div>
            <div className="form-group"><label className="form-label">Password Awal</label><input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimal 6 karakter" required minLength={6} /></div>
            <button className="btn btn-primary w-full" disabled={creating}>{creating ? 'Membuat…' : '＋ Buat Guru'}</button>
          </form>

          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="font-extrabold text-lg">👥 Daftar Pengguna ({visible.length})</h2>
              <div className="library-pills">
                {[['semua', '🌍 Semua'], ['GURU', '👩‍🏫 Guru'], ['SISWA', '🧑‍🎓 Murid'], ['ADMIN', '🛡️ Admin']].map(([id, label]) => (
                  <button key={id} onClick={() => setFilter(id)} className={`pill-btn ${filter === id ? 'pill-active' : ''}`}>{label}</button>
                ))}
              </div>
            </div>
            {visible.length === 0 ? (
              <div className="empty p-5">Belum ada pengguna pada filter ini.</div>
            ) : (
              <div className="grid gap-2 max-h-[520px] overflow-auto">
                {visible.map((u) => (
                  <div key={u.id} className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-sm flex items-center justify-between gap-2 flex-wrap">
                    <span><strong>{roleIcon(u.role)} {u.name}</strong><span className="text-slate-400"> · {u.email}</span></span>
                    <span className="flex gap-2 items-center">
                      <span className="meta-chip">{u.role}</span>
                      {u.role === 'GURU' && <span className="meta-chip">🏫 {u.kelasDiajar ?? 0} kelas</span>}
                      {u.role === 'SISWA' && <span className="meta-chip">🏫 {u.kelasDiikuti ?? 0} kelas · 📄 {u.fileTerkumpul ?? 0} file</span>}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
