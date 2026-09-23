'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, avatarUrlOf, getSavedUser, joinClass, logout, uploadAvatar } from '../../lib/api';
import { fetchMyGamification, levelForXp } from '../../lib/gamification';
import { fetchMyAssignments } from '../../lib/library';

/**
 * Bagian lipat-buka di drawer (dipakai untuk daftar Kelas & Tugas).
 * - 1 item atau kurang: tampil langsung, tanpa tombol minimize.
 * - Lebih dari 1: tampil 1 pertama + tombol minimize/show untuk sisanya.
 */
function DrawerSection({ icon, title, items, renderItem, emptyText, footerHref, footerLabel, onNavigate }) {
  const [expanded, setExpanded] = useState(false);
  const needToggle = items.length > 1;
  const visible = !needToggle || expanded ? items : items.slice(0, 1);

  return (
    <section className="drawer-section">
      <div className="drawer-sec-head">
        <span>{icon} {title} <span className="drawer-count">{items.length}</span></span>
        {needToggle && (
          <button
            type="button"
            className="drawer-toggle"
            aria-expanded={expanded}
            aria-label={expanded ? `Sembunyikan ${title}` : `Tampilkan semua ${title}`}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? '▲ Sembunyikan' : `▼ ${items.length - 1} lainnya`}
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="drawer-empty">{emptyText}</p>
      ) : (
        <div className="drawer-sub-list">
          {visible.map((item) => renderItem(item))}
        </div>
      )}
      {footerHref && (
        <Link href={footerHref} className="drawer-sec-foot" onClick={onNavigate}>{footerLabel}</Link>
      )}
    </section>
  );
}

/** Header simpel: tombol garis-3 di kiri + drawer (profil, Dashboard, Tugas, Library, AR, Kelas, Tugas). */
export default function AppHeader({ active = '' }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [gami, setGami] = useState(null);
  const [classes, setClasses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [metaLoaded, setMetaLoaded] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinBusy, setJoinBusy] = useState(false);
  const [joinMsg, setJoinMsg] = useState('');
  const [joinError, setJoinError] = useState('');
  const avatarInputRef = useRef(null);

  useEffect(() => {
    const saved = getSavedUser();
    setUser(saved);
    if (saved?.role === 'SISWA' && typeof window !== 'undefined' && localStorage.getItem('token')) {
      fetchMyGamification().then(setGami).catch(() => setGami(null));
    }
  }, []);

  // Kunci scroll + tutup dengan Escape saat drawer terbuka.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open ]);

  // Muat daftar kelas & tugas saat drawer pertama kali dibuka (agar ringan).
  // ADMIN tidak butuh data ini.
  const loadMeta = useCallback(async () => {
    if (!user || (user.role !== 'GURU' && user.role !== 'SISWA')) {
      setMetaLoaded(true);
      return;
    }
    let cancelled = false;
    const done = () => { if (!cancelled) setMetaLoaded(true); };
    try {
      if (user.role === 'GURU') {
        const { response, data } = await apiFetch('/classes/my-classes');
        if (!cancelled && response.ok && Array.isArray(data)) {
          setClasses(data.map((c) => ({ id: c.id, name: c.name, code: c.code })));
        }
      } else {
        const [clsRes, tugas] = await Promise.all([
          apiFetch('/classes/student-classes'),
          fetchMyAssignments().catch(() => []),
        ]);
        if (cancelled) return;
        if (clsRes.response.ok && Array.isArray(clsRes.data)) {
          setClasses(clsRes.data.map((c) => ({ id: c.id, name: c.name, code: c.code })));
        }
        setTasks(Array.isArray(tugas) ? tugas : []);
      }
    } finally {
      done();
    }
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!open || !user || metaLoaded) return;
    loadMeta();
  }, [open, user, metaLoaded, loadMeta]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim() || joinBusy) return;
    setJoinBusy(true); setJoinError(''); setJoinMsg('');
    try {
      const data = await joinClass(joinCode);
      setJoinMsg(data.message || 'Berhasil bergabung!');
      setJoinCode('');
      setMetaLoaded(false);
      await loadMeta();
    } catch (err) {
      setJoinError(err.message || 'Gagal bergabung.');
    } finally {
      setJoinBusy(false);
    }
  };

  const handleAvatar = async (file) => {
    setAvatarError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('File harus berupa gambar.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Ukuran foto maksimal 2 MB.');
      return;
    }
    setAvatarBusy(true);
    try {
      const data = await uploadAvatar(file);
      setUser((u) => ({ ...u, ...data.user }));
    } catch (err) {
      setAvatarError(err.message || 'Gagal mengunggah foto.');
    } finally {
      setAvatarBusy(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const dashboardHref = user?.role === 'ADMIN' ? '/admin' : user?.role === 'GURU' ? '/guru' : '/siswa';
  const brandHref = user ? dashboardHref : '/';
  const roleLabel = user?.role === 'ADMIN' ? 'Admin' : user?.role === 'GURU' ? 'Guru' : 'Murid';
  const linkCls = (key) => `drawer-link ${active === key ? 'drawer-link-active' : ''}`;
  const close = () => setOpen(false);
  const lvl = levelForXp(gami?.xp ?? 0);
  const avatarSrc = avatarUrlOf(user);
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'E';

  const MENU = [
    { key: 'home', href: '/', icon: '🏠', label: 'Beranda', show: true },
    { key: 'dashboard', href: user ? dashboardHref : '/login', icon: '📊', label: user?.role === 'ADMIN' ? 'Panel Admin' : 'Dashboard', show: true },
    { key: 'tugas', href: '/tugas', icon: '📌', label: 'Tugas', show: user?.role === 'GURU' || user?.role === 'SISWA' },
    { key: 'library', href: '/library', icon: '🗂️', label: 'Library', show: user?.role === 'GURU' || user?.role === 'SISWA' },
    { key: 'ar', href: '/ar', icon: '🧊', label: 'Misi AR', show: true },
  ].filter((m) => m.show);

  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          <div className="header-left">
            <button
              type="button"
              className="menu-btn"
              aria-label={open ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
            <Link href={brandHref} className="brand" onClick={close}>
              <span className="brand-mark">✦</span>
              <span>Sin<span>tesa</span></span>
            </Link>
          </div>

          <div className="header-actions">
            {user ? (
              <>
                {avatarSrc ? (
                  <img src={avatarSrc} alt={user.name} className="avatar avatar-img" />
                ) : (
                  <div className="avatar">{initial}</div>
                )}
                <div className="user-mini header-user-mini">
                  <div className="text-sm font-bold leading-tight">{user?.name}</div>
                  <div className="text-xs text-slate-400 leading-tight">{roleLabel}</div>
                </div>
                <button className="btn btn-soft" onClick={() => logout(router)}>Keluar</button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-soft">Masuk</Link>
                <Link href="/register" className="btn btn-primary">Daftar Gratis</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Backdrop */}
      <div
        className={`drawer-backdrop ${open ? 'drawer-backdrop-open' : ''}`}
        onClick={close}
        aria-hidden={!open}
      />

      {/* Drawer kiri */}
      <aside className={`drawer ${open ? 'drawer-open' : ''}`} aria-hidden={!open} aria-label="Menu navigasi">
        <div className="drawer-head">
          <Link href={brandHref} className="brand no-underline" onClick={close}>
            <span className="brand-mark">✦</span>
            <span>Sin<span>tesa</span></span>
          </Link>
          <button type="button" className="drawer-close" aria-label="Tutup menu" onClick={close}>✕</button>
        </div>

        <div className="drawer-scroll">
          {user && (
            <div className="drawer-profile">
              <span className="drawer-avatar-wrap">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={user.name} className="avatar avatar-lg avatar-img" />
                ) : (
                  <span className="avatar avatar-lg">{initial}</span>
                )}
                <button
                  type="button"
                  className="avatar-cam"
                  title={avatarBusy ? 'Mengunggah…' : 'Ganti foto profil'}
                  aria-label="Ganti foto profil"
                  disabled={avatarBusy}
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {avatarBusy ? '…' : '📷'}
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden-input"
                  onChange={(e) => handleAvatar(e.target.files?.[0])}
                />
              </span>
              <Link href="/profil" className="drawer-profile-text no-underline" onClick={close} title="Buka profil saya">
                <strong>{user?.name}</strong>
                <small>{roleLabel} · Kelas 10 RPL</small>
                {user?.role === 'SISWA' && (
                  <span className="drawer-xp">
                    <span aria-hidden="true">{lvl.icon}</span> Lv.{lvl.level} · {lvl.title} · {gami?.xp ?? 0} XP
                  </span>
                )}
                {user?.role === 'GURU' && (
                  <span className="drawer-xp drawer-xp-blue">
                    <span aria-hidden="true">🏫</span> {metaLoaded ? classes.length : '…'} kelas diajar
                  </span>
                )}
                {user?.role === 'ADMIN' && (
                  <span className="drawer-xp drawer-xp-dark">
                    <span aria-hidden="true">🛡️</span> Pengelola akun guru
                  </span>
                )}
              </Link>
            </div>
          )}
          {avatarError && <p className="avatar-err">{avatarError}</p>}

          <nav className="drawer-nav">
            {MENU.map((m) => (
              <Link key={m.key} href={m.href} className={linkCls(m.key)} onClick={close}>
                <span className="drawer-icon" aria-hidden="true">{m.icon}</span>
                <span>{m.label}</span>
                <span className="drawer-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </nav>

          {(user?.role === 'GURU' || user?.role === 'SISWA') && (
            <>
              <DrawerSection
                icon="🏫"
                title="Kelas Saya"
                items={metaLoaded ? classes : []}
                emptyText={metaLoaded ? 'Belum ada kelas.' : 'Memuat kelas…'}
                footerHref={user.role === 'GURU' ? '/guru' : '/ar'}
                footerLabel={user.role === 'GURU' ? '＋ Kelola kelas →' : 'Buka halaman AR →'}
                onNavigate={close}
                renderItem={(c) => (
                  <Link
                    key={c.id}
                    href={user.role === 'GURU' ? `/guru/kelas/${c.id}` : `/kelas/${c.id}`}
                    className="drawer-sub"
                    onClick={close}
                  >
                    <span className="drawer-sub-text">
                      <strong>{c.name}</strong>
                      <small>Kode {c.code}</small>
                    </span>
                    <span className="drawer-arrow" aria-hidden="true">→</span>
                  </Link>
                )}
              />
              {user.role === 'SISWA' && (
                <DrawerSection
                  icon="📌"
                  title="Tugas Saya"
                  items={metaLoaded ? tasks : []}
                  emptyText={metaLoaded ? 'Belum ada tugas.' : 'Memuat tugas…'}
                  footerHref="/tugas"
                  footerLabel="Buka halaman Tugas →"
                  onNavigate={close}
                  renderItem={(t) => {
                    const done = t.submissions?.length > 0;
                    return (
                      <Link key={t.id} href="/tugas" className="drawer-sub" onClick={close}>
                        <span className="drawer-sub-text">
                          <strong>{done ? '✅' : '•'} {t.title}</strong>
                          <small>{t.class?.name || 'Kelas'} · +{t.points || 100} XP</small>
                        </span>
                        <span className="drawer-arrow" aria-hidden="true">→</span>
                      </Link>
                    );
                  }}
                />
              )}
              {user.role === 'SISWA' && (
                <>
                  <button
                    type="button"
                    className="drawer-join-toggle"
                    aria-expanded={joinOpen}
                    onClick={() => { setJoinOpen((v) => !v); setJoinError(''); setJoinMsg(''); }}
                  >
                    {joinOpen ? '▲ Tutup' : '＋ Gabung Kelas Lain'}
                  </button>
                  {joinOpen && (
                    <form onSubmit={handleJoin} className="drawer-join-form">
                      <input
                        className="input uppercase"
                        placeholder="Kode kelas"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        maxLength={12}
                      />
                      <button className="btn btn-primary btn-sm" disabled={joinBusy || !joinCode.trim()}>
                        {joinBusy ? '…' : 'Gabung'}
                      </button>
                      {joinError && <p className="drawer-join-err">{joinError}</p>}
                      {joinMsg && <p className="drawer-join-ok">{joinMsg}</p>}
                    </form>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <div className="drawer-foot">
          {user ? (
            <>
              <div className="drawer-user">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={user.name} className="avatar avatar-img" />
                ) : (
                  <div className="avatar">{initial}</div>
                )}
                <Link href="/profil" className="no-underline text-inherit" onClick={close} title="Buka profil saya">
                  <div className="text-sm font-bold">{user?.name}</div>
                  <div className="text-xs text-slate-400">{roleLabel} · Profil →</div>
                </Link>
              </div>
              <button className="btn btn-soft w-full" onClick={() => { close(); logout(router); }}>Keluar</button>
            </>
          ) : (
            <div className="drawer-auth">
              <Link href="/login" className="btn btn-soft w-full" onClick={close}>Masuk</Link>
              <Link href="/register" className="btn btn-primary w-full" onClick={close}>Daftar Gratis</Link>
            </div>
          )}
          <p className="drawer-hint">Belajar · Bermain · Berkreasi</p>
        </div>
      </aside>
    </>
  );
}
