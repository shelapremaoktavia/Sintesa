'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

function PasswordToggle({ visible, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'} aria-pressed={visible} style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, display: 'grid', placeItems: 'center', border: 0, borderRadius: 9, background: 'transparent', color: '#47617c' }}>
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
        {visible && <path d="m3 3 18 18" />}
      </svg>
    </button>
  );
}

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [tokenReady, setTokenReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const resetToken = new URLSearchParams(window.location.search).get('token') || '';
    setToken(resetToken);
    setTokenReady(true);
    if (resetToken) window.history.replaceState({}, '', window.location.pathname);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (password.length < 8) { setError('Password baru minimal 8 karakter.'); return; }
    if (password !== confirmPassword) { setError('Konfirmasi password belum sama.'); return; }
    setLoading(true);
    try {
      const response = await fetch(API_URL + '/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Tautan reset tidak valid atau sudah kedaluwarsa.');
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Tidak bisa terhubung ke server. Coba lagi nanti.');
    } finally { setLoading(false); }
  };

  const eyeStyle = { position: 'relative' };

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-logo">✦ Sintesa</div>
        <div className="auth-copy">
          <h1>Atur ulang password akunmu.</h1>
          <p>Buat password baru, lalu lanjutkan pembelajaran di Sintesa.</p>
        </div>
        <div className="text-xs text-white/60">Sintesa · Platform Pembelajaran</div>
      </section>
      <section className="auth-box">
        <form onSubmit={handleSubmit} className="panel auth-card">
          <h1>Password baru</h1>
          <p className="muted">Gunakan minimal 8 karakter.</p>
          {error && <div className="toast-error" role="alert">{error}</div>}
          {success ? (
            <>
              <div className="toast-ok" role="status">Password berhasil diubah. Silakan masuk dengan password baru.</div>
              <Link className="btn btn-primary w-full" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }} href="/login">Ke halaman masuk</Link>
            </>
          ) : !tokenReady ? (
            <p className="muted">Memeriksa tautan reset...</p>
          ) : !token ? (
            <>
              <div className="toast-error" role="alert">Tautan reset tidak valid. Minta tautan baru.</div>
              <Link className="btn btn-primary w-full" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }} href="/lupa-sandi">Minta tautan baru</Link>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="new-password">Password baru</label>
                <div style={eyeStyle}>
                  <input id="new-password" className="input" style={{ paddingRight: 52 }} type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
                  <PasswordToggle visible={showPassword} onClick={() => setShowPassword((value) => !value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirm-password">Ulangi password baru</label>
                <div style={eyeStyle}>
                  <input id="confirm-password" className="input" style={{ paddingRight: 52 }} type={showConfirm ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} required />
                  <PasswordToggle visible={showConfirm} onClick={() => setShowConfirm((value) => !value)} />
                </div>
              </div>
              <button className="btn btn-primary w-full" type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan password baru'}</button>
            </>
          )}
          <p className="text-center text-sm text-slate-500 mt-5"><Link className="link" href="/login">Kembali ke halaman masuk</Link></p>
        </form>
      </section>
    </main>
  );
}
