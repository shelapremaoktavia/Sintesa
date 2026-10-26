'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch(API_URL + '/auth/login', {
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
          {error && <div className="toast-error" role="alert">{error}</div>}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input id="login-email" className="input" type="email" name="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nama@email.com" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input id="login-password" className="input" style={{ paddingRight: 52 }} type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Masukkan password" required />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'} aria-pressed={showPassword} style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, display: 'grid', placeItems: 'center', border: 0, borderRadius: 9, background: 'transparent', color: '#47617c' }}>
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                  {showPassword && <path d="m3 3 18 18" />}
                </svg>
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -7, marginBottom: 14 }}>
            <Link className="link text-sm" href="/lupa-sandi">Lupa sandi?</Link>
          </div>
          <button className="btn btn-primary w-full mt-2" type="submit" disabled={loading}>{loading ? 'Memproses...' : 'Masuk'}</button>
          <p className="text-center text-sm text-slate-500 mt-5">Belum punya akun? <Link className="link" href="/register">Daftar di sini</Link></p>
        </form>
      </section>
    </main>
  );
}
