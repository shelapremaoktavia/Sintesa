'use client';

import { fileAbsoluteUrl, formatDate, formatSize } from '../../lib/library';

/**
 * Modal preview file yang sudah dikumpulkan (gambar & PDF inline,
 * tipe lain tampil info + tombol unduh). Dipakai di kartu tugas
 * siswa & guru agar file terkumpul bisa dicek tanpa mengunduh.
 */
export default function FilePreview({ file, onClose }) {
  if (!file) return null;

  const url = fileAbsoluteUrl(file);
  const mime = file.mimeType || '';
  const isImage = mime.startsWith('image/');
  const isPdf = mime === 'application/pdf';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <strong title={file.originalName} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            👁️ {file.originalName}
          </strong>
          <button className="btn btn-soft btn-sm" onClick={onClose}>✕ Tutup</button>
        </div>
        <div className="modal-body">
          {isImage ? (
            <img src={url} alt={file.originalName} className="modal-img" />
          ) : isPdf ? (
            <iframe title={file.originalName} src={url} className="modal-frame" />
          ) : (
            <div className="panel empty" style={{ padding: 28 }}>
              <div style={{ fontSize: 52 }}>📄</div>
              <p className="text-sm mt-2">Preview langsung hanya untuk gambar & PDF.<br />Unduh file untuk membukanya.</p>
            </div>
          )}
          {(file.student || file.description) && (
            <p className="text-xs text-slate-500 mt-3">
              {file.student ? `👤 ${file.student.name} · ` : ''}{formatSize(file.sizeKb)} · {formatDate(file.createdAt)}
              {file.description ? ` · “${file.description}”` : ''}
            </p>
          )}
        </div>
        <div className="modal-foot">
          <span className="text-xs text-slate-500">{file.mimeType || 'file'}</span>
          <a className="btn btn-primary btn-sm" href={url} target="_blank" rel="noreferrer" download>
            ⬇️ Unduh asli
          </a>
        </div>
      </div>
    </div>
  );
}
