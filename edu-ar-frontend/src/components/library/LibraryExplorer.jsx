'use client';

import { useMemo, useState } from 'react';
import {
  FILE_TYPES, canPreviewInline, fileAbsoluteUrl, fileCategoryOf,
  fileIconOf, formatDate, formatSize,
} from '../../lib/library';

/** Penjelajah Library: filter + grid kartu + preview + nilai (guru). */
export default function LibraryExplorer({ items = [], user, loading, onDelete, onGrade, onRefresh }) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('semua');
  const [sort, setSort] = useState('terbaru');
  const [preview, setPreview] = useState(null);
  const [grading, setGrading] = useState(null);
  const [gradeVal, setGradeVal] = useState('');
  const [feedbackVal, setFeedbackVal] = useState('');
  const [busyId, setBusyId] = useState('');

  const filtered = useMemo(() => {
    let rows = [...items];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((r) =>
        (r.originalName || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.assignment?.title || '').toLowerCase().includes(q) ||
        (r.student?.name || '').toLowerCase().includes(q)
      );
    }
    if (type !== 'semua') rows = rows.filter((r) => fileCategoryOf(r) === type);
    rows.sort((a, b) => {
      if (sort === 'terlama') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === 'terbesar') return (b.sizeKb || 0) - (a.sizeKb || 0);
      if (sort === 'nama') return (a.originalName || '').localeCompare(b.originalName || '');
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return rows;
  }, [items, search, type, sort]);

  const openGrade = (item) => {
    setGrading(item);
    setGradeVal(item.grade ?? '');
    setFeedbackVal(item.feedback ?? '');
  };

  const submitGrade = async () => {
    if (!grading) return;
    setBusyId(grading.id);
    try {
      await onGrade?.(grading.id, { grade: gradeVal === '' ? null : Number(gradeVal), feedback: feedbackVal });
      setGrading(null);
    } finally {
      setBusyId('');
    }
  };

  const remove = async (id) => {
    if (!confirm('Hapus file ini dari Library?')) return;
    setBusyId(id);
    try {
      await onDelete?.(id);
    } finally {
      setBusyId('');
    }
  };

  return (
    <div>
      <div className="panel library-toolbar">
        <input
          className="input library-search"
          placeholder="🔍 Cari nama file, tugas, siswa, catatan…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="library-pills">
          {FILE_TYPES.map((t) => (
            <button key={t.id} onClick={() => setType(t.id)} className={`pill-btn ${type === t.id ? 'pill-active' : ''}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <select className="input library-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="terbaru">Terbaru</option>
          <option value="terlama">Terlama</option>
          <option value="terbesar">Terbesar</option>
          <option value="nama">Nama A–Z</option>
        </select>
      </div>

      {loading ? (
        <div className="panel empty">⏳ Memuat library…</div>
      ) : filtered.length === 0 ? (
        <div className="panel empty">
          <div className="text-4xl mb-3">🗂️</div>
          <h3 className="font-extrabold text-lg text-slate-700">Arsip masih kosong</h3>
          <p className="text-sm mt-1">
            {items.length === 0
              ? 'Simpan arsip pertamamu lewat panel di atas (arsip tanpa XP). Untuk tugas guru (+XP), kumpulkan di halaman Tugas.'
              : 'Tidak ada arsip yang cocok dengan filter. Coba kata kunci atau tipe lain.'}
          </p>
          {onRefresh && <button className="btn btn-soft mt-4" onClick={onRefresh}>🔄 Muat ulang</button>}
        </div>
      ) : (
        <>
          <p className="library-count">Menampilkan {filtered.length} dari {items.length} file</p>
          <div className="library-grid">
            {filtered.map((item) => (
              <article key={item.id} className="panel library-card">
                <div className="library-thumb">
                  {item.mimeType?.startsWith('image/') ? (
                    <img src={fileAbsoluteUrl(item)} alt={item.originalName} loading="lazy" />
                  ) : (
                    <span className="library-big-icon">{fileIconOf(item)}</span>
                  )}
                  {item.grade !== null && item.grade !== undefined && (
                    <span className={`grade-badge ${item.grade >= 75 ? 'grade-good' : 'grade-low'}`}>★ {item.grade}</span>
                  )}
                </div>
                <div className="library-body">
                  <h4 title={item.originalName}>{item.originalName}</h4>
                  <div className="library-meta">
                    <span>{formatSize(item.sizeKb)}</span>·<span>{formatDate(item.createdAt)}</span>
                  </div>
                  {item.assignment && <div className="library-task">📌 {item.assignment.title}</div>}
                  {item.description && <p className="library-desc">{item.description}</p>}
                  {user?.role === 'GURU' && item.student && (
                    <div className="library-student">👤 {item.student.name}</div>
                  )}
                  {item.feedback && <div className="library-feedback">💬 {item.feedback}</div>}
                  <div className="library-actions">
                    {canPreviewInline(item) && (
                      <button className="btn btn-soft btn-sm" onClick={() => setPreview(item)}>👁️ Preview</button>
                    )}
                    <a className="btn btn-soft btn-sm" href={fileAbsoluteUrl(item)} target="_blank" rel="noreferrer" download>
                      ⬇️ Unduh
                    </a>
                    {user?.role === 'GURU' && item.assignment && (
                      <button className="btn btn-soft btn-sm" onClick={() => openGrade(item)}>★ Nilai</button>
                    )}
                    <button className="btn btn-danger btn-sm" disabled={busyId === item.id} onClick={() => remove(item.id)}>
                      {busyId === item.id ? '…' : '🗑️'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {preview && (
        <div className="modal-backdrop" onClick={() => setPreview(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <strong>{preview.originalName}</strong>
              <button className="btn btn-soft btn-sm" onClick={() => setPreview(null)}>✕ Tutup</button>
            </div>
            <div className="modal-body">
              {preview.mimeType?.startsWith('image/') ? (
                <img src={fileAbsoluteUrl(preview)} alt={preview.originalName} className="modal-img" />
              ) : (
                <iframe title={preview.originalName} src={fileAbsoluteUrl(preview)} className="modal-frame" />
              )}
            </div>
            <div className="modal-foot">
              <span className="text-xs text-slate-500">{formatSize(preview.sizeKb)} · {formatDate(preview.createdAt)}</span>
              <a className="btn btn-primary btn-sm" href={fileAbsoluteUrl(preview)} target="_blank" rel="noreferrer" download>
                ⬇️ Unduh asli
              </a>
            </div>
          </div>
        </div>
      )}

      {grading && (
        <div className="modal-backdrop" onClick={() => setGrading(null)}>
          <div className="modal-card modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <strong>★ Nilai: {grading.originalName}</strong>
              <button className="btn btn-soft btn-sm" onClick={() => setGrading(null)}>✕</button>
            </div>
            <div className="modal-body form-grid">
              <div className="form-group">
                <label className="form-label">Nilai (0–100, kosongkan untuk belum dinilai)</label>
                <input
                  type="number" min="0" max="100" className="input"
                  value={gradeVal} onChange={(e) => setGradeVal(e.target.value)} placeholder="Contoh: 90"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Feedback untuk siswa</label>
                <textarea
                  className="input textarea" value={feedbackVal}
                  onChange={(e) => setFeedbackVal(e.target.value)}
                  placeholder="Contoh: Analisisnya tajam! Tambahkan sumber pada bagian kesimpulan."
                />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-soft btn-sm" onClick={() => setGrading(null)}>Batal</button>
              <button className="btn btn-primary btn-sm" disabled={busyId === grading.id} onClick={submitGrade}>
                {busyId === grading.id ? 'Menyimpan…' : '💾 Simpan Nilai'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
