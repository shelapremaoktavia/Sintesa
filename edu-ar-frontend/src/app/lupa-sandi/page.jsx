'use client';

import { useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const response = await fetch(API_URL + '/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Belum bisa mengirim tautan. Coba lagi nanti.');
      setSent(true);
    } catch (err) {
      setError(err.message || 'Tidak bisa terhubung ke server. Coba lagi nanti.');
    } finally { setLoading(false); }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-logo">✦ Sintesa</div>
        <div className="auth-copy">
          <h1>Kembali belajar dengan nyaman.</h1>
          <p>Masukkan email akunmu. Kami akan mengirim tautan untuk membuat password baru.</p>
        </div>
        <div className="text-xs text-white/60">Sintesa · Platform Pembelajaran</div>
      </section>
      <section className="auth-box">
        <form onSubmit={handleSubmit} className="panel auth-card">
          <h1>Lupa sandi?</h1>
          <p className="muted">Kami akan mengirim tautan reset jika email terdaftar.</p>
          {error && <div className="toast-error" role="alert">{error}</div>}
          {sent ? (
            <div className="toast-ok" role="status">Jika email terdaftar, tautan reset sudah dikirim. Periksa kotak masuk dan folder spam.</div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">Email akun</label>
                <input id="forgot-email" className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" required />
              </div>
              <button className="btn btn-primary w-full" type="submit" disabled={loading}>{loading ? 'Mengirim...' : 'Kirim tautan reset'}</button>
            </>
          )}
          <p className="text-center text-sm text-slate-500 mt-5"><Link className="link" href="/login">Kembali ke halaman masuk</Link></p>
        </form>
      </section>
    </main>
  );
}
