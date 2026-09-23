'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Email atau password salah.'); setLoading(false); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.replace(data.user.role === 'ADMIN' ? '/admin' : data.user.role === 'GURU' ? '/guru' : '/siswa');
    } catch {
      setError('Tidak bisa terhubung ke server backend. Pastikan backend sedang berjalan.');
    } finally { setLoading(false); }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-logo">✦ Sintesa</div>
        <div className="auth-copy">
          <h1>Belajar jadi lebih hidup dengan 3D & AR.</h1>
          <p>Platform pembelajaran interaktif untuk guru dan siswa. Masuk untuk membuka kelas, materi, dan pengalaman belajar 3D.</p>
          <div className="auth-feature">
            <div>🧑‍🏫 Kelola kelas dengan mudah</div>
            <div>🧊 Eksplorasi materi dalam 3D</div>
            <div>📱 Aktifkan pengalaman AR di perangkat yang mendukung</div>
          </div>
        </div>
        <div className="text-xs text-white/60">Sintesa · Platform Pembelajaran</div>
      </section>
      <section className="auth-box">
        <form onSubmit={handleSubmit} className="panel auth-card">
          <h1>Selamat datang 👋</h1>
          <p className="muted">Masuk ke akunmu untuk melanjutkan pembelajaran.</p>
          {error && <div className="toast-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="input" type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nama@email.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="input" type="password" name="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Masukkan password" required />
          </div>
          <button className="btn btn-primary w-full mt-2" type="submit" disabled={loading}>{loading ? 'Memproses...' : 'Masuk'}</button>
          <p className="text-center text-sm text-slate-500 mt-5">Belum punya akun? <Link className="link" href="/register">Daftar di sini</Link></p>
        </form>
      </section>
    </main>
  );
}
