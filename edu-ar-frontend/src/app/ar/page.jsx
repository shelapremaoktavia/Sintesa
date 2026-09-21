'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppHeader from '../../components/ui/AppHeader';
import ViewerAR from '../../components/ARViewer/ViewerAR';
import { SectionHeading } from '../../components/ui/badges';
import { getSavedUser, apiFetch } from '../../lib/api';
import { AR_CATALOG } from '../../lib/arCatalog';

/** Kartu kuis per misi: pilih jawaban → periksa → skor + pembahasan. */
function MissionQuiz({ mission }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setAnswers({});
    setChecked(false);
  }, [mission.slug]);

  const score = mission.quiz.filter((s, i) => answers[i] === s.answer).length;
  const done = Object.keys(answers).length === mission.quiz.length;

  return (
    <div className="quiz-list">
      {mission.quiz.map((s, i) => {
        const picked = answers[i];
        return (
          <div key={i} className="panel quiz-card">
            <strong className="quiz-q">{i + 1}. {s.q}</strong>
            <div className="quiz-opts">
              {s.options.map((opt, oi) => {
                const isAnswer = oi === s.answer;
                const isPicked = picked === oi;
                let cls = 'quiz-opt';
                if (checked && isAnswer) cls += ' quiz-correct';
                else if (checked && isPicked && !isAnswer) cls += ' quiz-wrong';
                else if (isPicked) cls += ' quiz-picked';
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={checked}
                    className={cls}
                    onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                  >
                    <span className="quiz-letter">{'ABCD'[oi]}</span> {opt}
                  </button>
                );
              })}
            </div>
            {checked && (
              <p className={`quiz-explain ${picked === s.answer ? 'quiz-explain-ok' : 'quiz-explain-bad'}`}>
                {picked === s.answer ? '✅ Benar! ' : `❌ Kurang tepat. Jawaban: ${s.options[s.answer]}. `}{s.explain}
              </p>
            )}
          </div>
        );
      })}
      <div className="quiz-foot">
        {!checked ? (
          <button className="btn btn-primary" disabled={!done} onClick={() => setChecked(true)}>
            {done ? '📝 Periksa Jawaban' : `Jawab semua soal (${Object.keys(answers).length}/${mission.quiz.length})`}
          </button>
        ) : (
          <>
            <div className={`quiz-score ${score === mission.quiz.length ? 'quiz-score-perfect' : ''}`}>
              🎯 Skor: {score}/{mission.quiz.length} {score === mission.quiz.length ? '· Sempurna! 🎉' : '· Ayo coba lagi!'}
            </div>
            <button className="btn btn-soft" onClick={() => { setAnswers({}); setChecked(false); }}>🔄 Ulangi Kuis</button>
          </>
        )}
      </div>
      <p className="text-xs text-slate-500">Kuis ini latihan pemahaman (tidak menambah XP). XP +{mission.xp} didapat dari misi materi di kelas & tugas guru.</p>
    </div>
  );
}

/** Bagian "Kelasku": gabung kelas + materi dari guru (pindah dari dashboard agar rapi). */
function MyClasses({ user }) {
  const [classes, setClasses] = useState([]);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    const { response, data } = await apiFetch('/classes/student-classes');
    if (response.ok && Array.isArray(data)) setClasses(data);
  }, []);

  useEffect(() => {
    if (user?.role === 'SISWA') load();
  }, [user, load]);

  const join = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true); setErr(''); setMsg('');
    const { response, data } = await apiFetch('/classes/join', {
      method: 'POST',
      body: JSON.stringify({ code: code.trim().toUpperCase() }),
    });
    if (!response.ok) setErr(data.message || 'Gagal bergabung.');
    else {
      setMsg(data.message || 'Berhasil bergabung!');
      setCode('');
      await load();
    }
    setBusy(false);
  };

  if (user?.role !== 'SISWA') return null;

  return (
    <section className="landing-section">
      <div className="landing-container">
        <SectionHeading
          eyebrow="🏫 KELASKU"
          title="Materi AR dari gurumu"
          subtitle="Gabung kelas dengan kode, lalu buka materi 3D/AR-nya (+100 XP per misi selesai)."
        />
        <form onSubmit={join} className="panel join-panel">
          <div>
            <h2 className="font-extrabold text-lg m-0">Gabung Kelas Baru</h2>
            <p className="text-sm text-slate-500 mt-1">Masukkan kode kelas dari guru.</p>
          </div>
          <div className="join-form">
            <input className="input uppercase" placeholder="Contoh: KELAS-X9K2A" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={12} />
            <button className="btn btn-primary whitespace-nowrap" disabled={busy}>{busy ? 'Bergabung…' : 'Gabung Kelas'}</button>
          </div>
        </form>
        {err && <div className="toast-error">{err}</div>}
        {msg && <div className="toast-ok">{msg}</div>}
        {classes.length === 0 ? (
          <div className="panel empty">📚 Belum ada kelas. Gabung dengan kode dari gurumu.</div>
        ) : (
          classes.map((c) => (
            <div key={c.id} className="mb-3">
              <div className="section-head">
                <div>
                  <h2 className="section-title">{c.name}</h2>
                  <p className="section-subtitle">Guru: {c.teacher?.name || '—'} · Kode {c.code}</p>
                </div>
              </div>
              {(c.materials?.length || 0) === 0 ? (
                <div className="panel empty">Guru belum membagikan materi di kelas ini.</div>
              ) : (
                <div className="material-grid">
                  {c.materials.map((m) => (
                    <article key={m.id} className="panel material-card">
                      <div className="material-thumb">
                        <div className="text-center px-5 text-blue-700/70">
                          <div className="text-5xl mb-2">🧊</div>
                          <div className="text-xs font-bold">3D / AR READY · +100 XP</div>
                        </div>
                      </div>
                      <div className="material-body">
                        <div className="eyebrow">{m.jenjang} · {m.subject?.name || 'Materi'}</div>
                        <h3 className="material-title">{m.title}</h3>
                        <div className="card-footer">
                          <span className={`text-xs font-extrabold ${m.progress?.completed ? 'text-emerald-600' : 'text-slate-500'}`}>
                            {m.progress?.completed ? '✓ Selesai' : 'Belum dibuka'}
                          </span>
                          <Link href={`/siswa/materi/${m.id}`} className="btn btn-primary">Buka Misi</Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

/**
 * /ar — halaman Misi AR sendiri (tidak campur dashboard).
 * Tiap misi: viewer 3D/AR + tab Misi | Materi | Soal.
 */
export default function ARPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState(AR_CATALOG[0]);
  const [jenjang, setJenjang] = useState('Semua');
  const [tab, setTab] = useState('misi');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const saved = getSavedUser();
    if (!token || !saved) { router.replace('/login'); return; }
    setUser(saved);
    setReady(true);
  }, [router]);

  const filtered = useMemo(
    () => (jenjang === 'Semua' ? AR_CATALOG : AR_CATALOG.filter((a) => a.jenjang === jenjang)),
    [jenjang]
  );

  useEffect(() => {
    if (!filtered.find((f) => f.slug === selected.slug)) setSelected(filtered[0] || AR_CATALOG[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jenjang]);

  if (!ready) return <main className="page-loading">Membuka misi AR…</main>;

  return (
    <div className="page-shell">
      <AppHeader active="ar" />

      <div className="container hero">
        <section className="hero-card">
          <p className="text-sm font-semibold text-white/75">🧊 MISI AR PER PELAJARAN</p>
          <h1 className="hero-title">Pilih misimu, pelajari materinya, jawab soalnya.</h1>
          <p className="hero-text">6 misi tematik SD–SMA. Setiap misi punya model 3D/AR, materi ringkas, dan kuis latihan.</p>
          <div className="hero-stat">
            <span className="stat-pill">🧊 6 misi AR</span>
            <span className="stat-pill">📖 {AR_CATALOG.reduce((a, m) => a + m.materi.length, 0)} materi</span>
            <span className="stat-pill">📝 {AR_CATALOG.reduce((a, m) => a + m.quiz.length, 0)} soal latihan</span>
          </div>
          <div className="quick-links mt-3">
            <Link href={user?.role === 'GURU' ? '/guru' : '/siswa'} className="btn btn-light btn-sm">📊 Dashboard</Link>
            <Link href="/tugas" className="btn btn-light btn-sm">📌 Tugas</Link>
          </div>
        </section>
      </div>

      <main className="container section">
        <div className="ar-filter">
          {['Semua', 'SD', 'SMP', 'SMA'].map((j) => (
            <button key={j} onClick={() => setJenjang(j)} className={`pill-btn ${jenjang === j ? 'pill-active' : ''}`}>
              {j === 'Semua' ? '🌍 Semua Jenjang' : `🎓 ${j}`}
            </button>
          ))}
        </div>

        <div className="ar-showcase-grid">
          <div className="ar-list">
            {filtered.map((item) => (
              <button
                key={item.slug}
                onClick={() => { setSelected(item); setTab('misi'); }}
                className={`ar-item ${selected.slug === item.slug ? 'ar-item-active' : ''}`}
              >
                <span className="ar-item-emoji" style={{ background: item.gradient }}>{item.emoji}</span>
                <span className="ar-item-text">
                  <strong>{item.title}</strong>
                  <small>{item.jenjang} · {item.subject} · +{item.xp} XP</small>
                </span>
                <span className="ar-item-arrow">→</span>
              </button>
            ))}
          </div>

          <div className="ar-preview panel">
            <div className="ar-preview-head">
              <span className="ar-item-emoji" style={{ background: selected.gradient }}>{selected.emoji}</span>
              <div>
                <div className="eyebrow">{selected.jenjang} · {selected.subject} · +{selected.xp} XP</div>
                <h3 className="ar-preview-title">{selected.title}</h3>
              </div>
            </div>

            <div className="ar-preview-view">
              <ViewerAR key={selected.slug} glbSrc={selected.glb} usdzSrc={selected.usdz} alt={`Model AR ${selected.title}`} />
            </div>

            <div className="ar-tabs">
              {[['misi', '🎯 Misi'], ['materi', `📖 Materi (${selected.materi.length})`], ['soal', `📝 Soal (${selected.quiz.length})`]].map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)} className={`pill-btn ${tab === id ? 'pill-active' : ''}`}>{label}</button>
              ))}
            </div>

            <div className="ar-mission-box">
              {tab === 'misi' && (
                <>
                  <strong>🎯 Misi: {selected.mission}</strong>
                  <p>📱 {selected.instruction}</p>
                  <div className="ar-skills">
                    {selected.skills.map((s) => <span key={s} className="meta-chip">{s}</span>)}
                  </div>
                </>
              )}
              {tab === 'materi' && (
                <div className="ar-materi">
                  {selected.materi.map((m, i) => (
                    <article key={i} className="ar-materi-card">
                      <span className="ar-materi-num">{i + 1}</span>
                      <div>
                        <strong>{m.judul}</strong>
                        <p>{m.isi}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              {tab === 'soal' && <MissionQuiz mission={selected} />}
            </div>
          </div>
        </div>
      </main>

      <div className="landing-alt">
        <MyClasses user={user} />
      </div>
    </div>
  );
}
