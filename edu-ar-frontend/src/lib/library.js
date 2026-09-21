// lib/library.js
// Helper & API client untuk dua alur yang DIPISAH dengan tegas:
// 1) TUGAS (/tugas): file yang terikat assignmentId dari guru.
//    XP = poin tugas (assignment.points), dihitung sekali per tugas.
// 2) LIBRARY (/library): arsip mandiri tanpa assignmentId (gambar, PDF, Word, dsb).
//    XP = +50 per file, tidak dinilai guru.
import { API_URL, apiFetch } from './api';

export const BACKEND_ORIGIN = API_URL.replace(/\/api$/, '');

export const FILE_TYPES = [
  { id: 'semua', label: 'Semua file', icon: '🗂️' },
  { id: 'gambar', label: 'Gambar', icon: '🖼️' },
  { id: 'pdf', label: 'PDF', icon: '📕' },
  { id: 'dokumen', label: 'Dokumen', icon: '📝' },
  { id: 'video', label: 'Video', icon: '🎬' },
  { id: 'arsip', label: 'Arsip', icon: '📦' },
];

const EXT_MAP = {
  png: 'gambar', jpg: 'gambar', jpeg: 'gambar', webp: 'gambar', gif: 'gambar', svg: 'gambar',
  pdf: 'pdf',
  doc: 'dokumen', docx: 'dokumen', ppt: 'dokumen', pptx: 'dokumen',
  xls: 'dokumen', xlsx: 'dokumen', txt: 'dokumen', csv: 'dokumen',
  mp4: 'video', mp3: 'video',
  zip: 'arsip',
};

export function fileCategoryOf(item = {}) {
  const mime = item.mimeType || '';
  if (mime.startsWith('image/')) return 'gambar';
  if (mime === 'application/pdf') return 'pdf';
  if (/word|powerpoint|excel|sheet|presentation|text|csv|msword/i.test(mime)) return 'dokumen';
  if (mime.startsWith('video/') || mime.startsWith('audio/')) return 'video';
  if (/zip/i.test(mime)) return 'arsip';
  const ext = (item.originalName || item.fileName || '').split('.').pop()?.toLowerCase();
  return EXT_MAP[ext] || 'lainnya';
}

export function fileIconOf(item = {}) {
  const cat = fileCategoryOf(item);
  if (cat === 'gambar') return '🖼️';
  if (cat === 'pdf') return '📕';
  if (cat === 'dokumen') {
    const name = (item.originalName || '').toLowerCase();
    if (name.endsWith('.ppt') || name.endsWith('.pptx')) return '📊';
    if (name.endsWith('.xls') || name.endsWith('.xlsx') || name.endsWith('.csv')) return '📗';
    if (name.endsWith('.doc') || name.endsWith('.docx')) return '📘';
    return '📝';
  }
  if (cat === 'video') return '🎬';
  if (cat === 'arsip') return '📦';
  return '📄';
}

export function formatSize(kb = 0) {
  if (!kb || kb <= 0) return '0 KB';
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

export function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

export function fileAbsoluteUrl(item = {}) {
  if (!item.fileUrl) return '#';
  if (item.fileUrl.startsWith('http')) return item.fileUrl;
  return `${BACKEND_ORIGIN}${item.fileUrl}`;
}

export function canPreviewInline(item = {}) {
  const mime = item.mimeType || '';
  return mime.startsWith('image/') || mime === 'application/pdf';
}

export async function fetchLibrary(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const { response, data } = await apiFetch(`/library${suffix}`);
  if (!response.ok) throw new Error(data.message || 'Gagal memuat library.');
  return Array.isArray(data) ? data : [];
}

export async function fetchLibraryStats() {
  const { response, data } = await apiFetch('/library/stats');
  if (!response.ok) return { total: 0, taskFiles: 0, archiveFiles: 0, totalSizeKb: 0, gambar: 0, pdf: 0, dokumen: 0, lainnya: 0 };
  return {
    total: 0, taskFiles: 0, archiveFiles: 0, totalSizeKb: 0,
    gambar: 0, pdf: 0, dokumen: 0, lainnya: 0, ...data,
  };
}

/** Pisahkan file campuran menjadi tugas vs arsip agar UI tidak membingungkan. */
export function splitLibraryItems(items = []) {
  const taskFiles = items.filter((i) => i?.assignmentId || i?.assignment);
  const archiveFiles = items.filter((i) => !(i?.assignmentId || i?.assignment));
  return { taskFiles, archiveFiles };
}

export function xpPreviewForAssignment(assignment) {
  const pts = Number(assignment?.points);
  return Number.isFinite(pts) ? pts : 100;
}

export async function uploadLibraryFile({ file, assignmentId, classId, materialId, description }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const form = new FormData();
  form.append('file', file);
  if (assignmentId) form.append('assignmentId', assignmentId);
  if (classId) form.append('classId', classId);
  if (materialId) form.append('materialId', materialId);
  if (description) form.append('description', description);

  const response = await fetch(`${API_URL}/library/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Gagal mengunggah file.');
  return data;
}

/**
 * Upload khusus TUGAS guru — assignmentId WAJIB.
 * Mengembalikan { ...submission, earnedXp } dari backend.
 */
export async function uploadTaskFile({ file, assignment, description }) {
  if (!assignment?.id) throw new Error('Pilih tugas guru terlebih dahulu.');
  return uploadLibraryFile({
    file,
    assignmentId: assignment.id,
    classId: assignment.classId || assignment.class?.id || undefined,
    materialId: assignment.materialId || assignment.material?.id || undefined,
    description,
  });
}

/** Upload khusus ARSIP Library mandiri — tanpa assignmentId, tanpa XP. */
export async function uploadArchiveFile({ file, description }) {
  return uploadLibraryFile({ file, description });
}

export async function deleteLibraryFile(id) {
  const { response, data } = await apiFetch(`/library/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(data.message || 'Gagal menghapus file.');
  return data;
}

export async function gradeLibraryFile(id, { grade, feedback }) {
  const { response, data } = await apiFetch(`/library/${id}/grade`, {
    method: 'PATCH',
    body: JSON.stringify({ grade, feedback }),
  });
  if (!response.ok) throw new Error(data.message || 'Gagal menyimpan nilai.');
  return data;
}

export async function fetchMyAssignments() {
  const { response, data } = await apiFetch('/assignments/my');
  if (!response.ok) throw new Error(data.message || 'Gagal memuat tugas.');
  return Array.isArray(data) ? data : [];
}

export async function fetchClassAssignments(classId) {
  const { response, data } = await apiFetch(`/assignments/class/${classId}`);
  if (!response.ok) throw new Error(data.message || 'Gagal memuat tugas kelas.');
  return Array.isArray(data) ? data : [];
}

export async function createAssignment(payload, attachmentFile) {
  // Guru boleh melampirkan 1 file penjelas (PDF, video, gambar, dsb).
  // Jika ada file → kirim multipart; jika tidak → JSON seperti biasa.
  if (attachmentFile) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const form = new FormData();
    Object.entries(payload || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') form.append(key, String(value));
    });
    form.append('attachment', attachmentFile);
    const response = await fetch(`${API_URL}/assignments`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Gagal membuat tugas.');
    return data;
  }
  const { response, data } = await apiFetch('/assignments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(data.message || 'Gagal membuat tugas.');
  return data;
}

/** URL absolut lampiran guru pada tugas (atau null bila tidak ada). */
export function taskAttachmentUrl(task = {}) {
  const u = task.attachFileUrl;
  if (!u) return null;
  if (u.startsWith('http')) return u;
  return `${BACKEND_ORIGIN}${u}`;
}

/** Ikon emoji berdasarkan tipe lampiran tugas. */
export function taskAttachmentIcon(task = {}) {
  const name = (task.attachOriginalName || '').toLowerCase();
  const mime = task.attachMimeType || '';
  if (mime.startsWith('image/')) return '🖼️';
  if (mime === 'application/pdf' || name.endsWith('.pdf')) return '📕';
  if (mime.startsWith('video/') || name.endsWith('.mp4')) return '🎬';
  if (/pptx?$/.test(name)) return '📊';
  if (/xlsx?|csv$/.test(name)) return '📗';
  if (/docx?$/.test(name)) return '📘';
  if (/zip$/.test(name)) return '📦';
  return '📎';
}
