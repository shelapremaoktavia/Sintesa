'use client';

import { formatSize, taskAttachmentIcon, taskAttachmentUrl } from '../../lib/library';

/**
 * Kotak lampiran guru pada tugas (PDF, video, gambar, dsb).
 * Tampil bila guru melampirkan file saat membuat tugas.
 */
export default function TaskAttachmentBox({ task }) {
  const url = taskAttachmentUrl(task);
  if (!url) return null;

  return (
    <div className="attach-box">
      <span className="attach-box-icon" aria-hidden="true">{taskAttachmentIcon(task)}</span>
      <span className="attach-box-text">
        <strong title={task.attachOriginalName}>{task.attachOriginalName || 'Lampiran tugas'}</strong>
        <small>
          Lampiran guru{task.attachSizeKb ? ` · ${formatSize(task.attachSizeKb)}` : ''}
        </small>
      </span>
      <a className="btn btn-soft btn-sm" href={url} target="_blank" rel="noreferrer">
        {task.attachMimeType === 'application/pdf' || task.attachMimeType?.startsWith('image/') || task.attachMimeType?.startsWith('video/')
          ? '👁️ Buka'
          : '⬇️ Unduh'}
      </a>
    </div>
  );
}
