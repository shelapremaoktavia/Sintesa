'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Registrasi gagal.'); setLoading(false); return; }
      alert('Registrasi berhasil! Silakan login dengan akun yang baru dibuat.');
      router.replace('/login');
    } catch {
      setError('Tidak bisa terhubung ke server backend. Pastikan backend sedang berjalan.');
    } finally { setLoading(false); }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-logo">✦ Sintesa</div>
        <div className="auth-copy">
          <h1>Buat ruang belajar interaktifmu.</h1>
          <p>Daftar sebagai murid Kelas 10 RPL dan gunakan satu platform untuk belajar dengan materi visual 3D dan Augmented Reality.</p>
        </div>
        <div className="text-xs text-white/60">Belajar · Berkreasi · Berinteraksi</div>
      </section>
      <section className="auth-box">
        <form onSubmit={handleSubmit} className="panel auth-card">
          <h1>Buat akun murid</h1>
          <p className="muted">Pendaftaran terbuka untuk murid Kelas 10 RPL. Akun guru dibuatkan oleh admin.</p>
          {error && <div className="toast-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <input className="input" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama kamu" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nama@email.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimal 6 karakter" required minLength={6} />
          </div>
          <button className="btn btn-primary w-full mt-2" type="submit" disabled={loading}>{loading ? 'Membuat akun...' : 'Daftar sebagai Murid'}</button>
          <p className="text-center text-sm text-slate-500 mt-5">Sudah punya akun? <Link className="link" href="/login">Masuk di sini</Link></p>
        </form>
      </section>
    </main>
  );
}
