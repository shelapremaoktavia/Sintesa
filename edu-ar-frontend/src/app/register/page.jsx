'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch(API_URL + '/auth/register', {
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
          {error && <div className="toast-error" role="alert">{error}</div>}
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">Nama Lengkap</label>
            <input id="register-name" className="input" type="text" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama kamu" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email</label>
            <input id="register-email" className="input" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nama@email.com" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input id="register-password" className="input" style={{ paddingRight: 52 }} type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimal 6 karakter" required minLength={6} />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'} aria-pressed={showPassword} style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, display: 'grid', placeItems: 'center', border: 0, borderRadius: 9, background: 'transparent', color: '#47617c' }}>
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                  {showPassword && <path d="m3 3 18 18" />}
                </svg>
              </button>
            </div>
          </div>
          <button className="btn btn-primary w-full mt-2" type="submit" disabled={loading}>{loading ? 'Membuat akun...' : 'Daftar sebagai Murid'}</button>
          <p className="text-center text-sm text-slate-500 mt-5">Sudah punya akun? <Link className="link" href="/login">Masuk di sini</Link></p>
        </form>
      </section>
    </main>
  );
}
