'use client';

import { useRef, useState } from 'react';
import { uploadArchiveFile } from '../../lib/library';

const MAX_MB = 15;
const ACCEPT = '.png,.jpg,.jpeg,.webp,.gif,.svg,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,.mp4,.mp3,.glb,.gltf';

/**
 * Upload ARSIP Library mandiri (tanpa tugas, tanpa XP).
 * Untuk mengumpulkan tugas guru (+XP poin guru), gunakan halaman /tugas.
 */
export default function LibraryUploader({ onUploaded }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const pick = (f) => {
    setError(''); setOk('');
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`Ukuran file maksimal ${MAX_MB} MB.`);
      return;
    }
    setFile(f);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file || uploading) return;
    setUploading(true); setError(''); setOk('');
    try {
      await uploadArchiveFile({ file, description: description.trim() || undefined });
      setOk(`“${file.name}” tersimpan sebagai arsip 📁`);
      setFile(null); setDescription('');
      if (inputRef.current) inputRef.current.value = '';
      onUploaded?.();
    } catch (err) {
      setError(err.message || 'Gagal mengunggah file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="panel library-upload"
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files?.[0]); }}
    >
      <div className="lib-upload-head">
        <div>
          <h3>🗂️ Simpan Arsip Pribadi</h3>
          <p>Gambar, PDF, Word, PPT, Excel, TXT, ZIP, MP4, <strong>model 3D (GLB)</strong> — maks. {MAX_MB} MB per file. Arsip tidak menambah XP.</p>
        </div>
        <span className="xp-chip xp-chip-neutral">0 XP · arsip</span>
      </div>

      {error && <div className="toast-error">{error}</div>}
      {ok && <div className="toast-ok">{ok}</div>}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`dropzone ${dragging ? 'dropzone-active' : ''} ${file ? 'dropzone-filled' : ''}`}
      >
        <span className="dropzone-icon">{file ? '📄' : '☁️'}</span>
        <strong>{file ? file.name : 'Seret file ke sini atau klik untuk memilih'}</strong>
        <small>{file ? `${(file.size / 1024).toFixed(1)} KB · klik untuk mengganti` : ACCEPT.replaceAll(',', ' · ')}</small>
      </button>
      <input ref={inputRef} type="file" accept={ACCEPT} className="hidden-input" onChange={(e) => pick(e.target.files?.[0])} />

      <div className="form-group">
        <label className="form-label">Catatan arsip (opsional)</label>
        <input
          className="input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Contoh: Foto praktikum sel — arsip pribadi"
          maxLength={280}
        />
      </div>

      <button className="btn btn-primary w-full mt-3" disabled={!file || uploading}>
        {uploading ? 'Mengunggah…' : file ? `💾 Simpan “${file.name}” sebagai arsip` : 'Pilih file terlebih dahulu'}
      </button>
    </form>
  );
}
