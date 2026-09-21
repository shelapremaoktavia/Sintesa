'use client';

const MAX_MB = 15;
const ACCEPT = '.png,.jpg,.jpeg,.webp,.gif,.svg,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,.mp4,.mp3';

/**
 * Pemilih lampiran tugas guru (PDF, video, gambar, dsb — maks 15 MB).
 * Dipakai di form "Buat Tugas" dashboard guru & detail kelas.
 */
export default function AttachmentPicker({ file, inputRef, onPick, onClear, error }) {
  const pick = (f) => {
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      onPick(null, `Ukuran file maksimal ${MAX_MB} MB.`);
      return;
    }
    onPick(f, '');
  };

  return (
    <div className="form-group">
      <label className="form-label">Lampiran penjelas (opsional)</label>
      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="attach-picker"
        >
          <span className="attach-picker-icon">📎</span>
          <span>
            <strong>Klik untuk melampirkan file</strong>
            <small>PDF · Video · Gambar · Word · PPT — maks. {MAX_MB} MB</small>
          </span>
        </button>
      ) : (
        <div className="attach-chosen">
          <span className="attach-chosen-name">📄 {file.name} <small>· {(file.size / 1024).toFixed(1)} KB</small></span>
          <span className="flex gap-2">
            <button type="button" className="btn btn-soft btn-sm" onClick={() => inputRef.current?.click()}>Ganti</button>
            <button type="button" className="btn btn-danger btn-sm" onClick={onClear}>✕</button>
          </span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden-input"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          if (inputRef.current) inputRef.current.value = '';
        }}
      />
      {error && <p className="text-xs mt-2" style={{ color: '#b91c1c' }}>{error}</p>}
    </div>
  );
}

export { MAX_MB as ATTACH_MAX_MB };
