import { upload } from '@vercel/blob/client';

export const API_URL = process.env.NEXT_PUBLIC_API_URL_VERCEL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const LEGACY_UPLOADS_ORIGIN = (
  process.env.NEXT_PUBLIC_LEGACY_UPLOADS_URL || API_URL.replace(/\/api$/, '')
).replace(/\/+$/, '');

export async function apiFetch(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return { response, data };
}

export function getSavedUser() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

/** Upload browser langsung ke Blob; server hanya membuat token terbatas dan memeriksa metadata. */
export async function uploadFileToBlob(file, scope) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const user = getSavedUser();
  if (!token || !user?.id) throw new Error('Silakan login ulang sebelum mengunggah file.');

  const isAvatar = scope === 'avatar';
  const maximumSize = isAvatar ? 2 * 1024 * 1024 : 15 * 1024 * 1024;
  if (!file || file.size < 1 || file.size > maximumSize) {
    throw new Error(isAvatar ? 'Ukuran foto maksimal 2 MB.' : 'Ukuran file maksimal 15 MB.');
  }

  const safeName = String(file.name || 'file')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(-120) || 'file';
  const pathname = 'users/' + user.id + '/' + scope + '/' + Date.now() + '-' + safeName;
  const blob = await upload(pathname, file, {
    access: 'public',
    handleUploadUrl: API_URL + '/uploads/client',
    headers: { Authorization: 'Bearer ' + token },
    clientPayload: scope,
    multipart: file.size > 4.5 * 1024 * 1024,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    originalName: file.name || safeName,
    contentType: blob.contentType || file.type || 'application/octet-stream',
    size: file.size,
  };
}

/** URL absolut untuk foto baru (Blob) atau file lama dari backend sebelumnya. */
export function avatarUrlOf(user) {
  const u = user?.avatarUrl;
  if (!u) return null;
  if (u.startsWith('http')) return u;
  return LEGACY_UPLOADS_ORIGIN + u;
}

/** Ubah profil sendiri (nama dan/atau password). */
export async function updateMe(payload) {
  const { response, data } = await apiFetch('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(data.message || 'Gagal memperbarui profil.');
  if (data.user && typeof window !== 'undefined') {
    const saved = getSavedUser() || {};
    localStorage.setItem('user', JSON.stringify({ ...saved, ...data.user }));
  }
  return data;
}

/** Gabung kelas dengan kode (murid). Mengembalikan { message, class }. */
export async function joinClass(code) {
  const { response, data } = await apiFetch('/classes/join', {
    method: 'POST',
    body: JSON.stringify({ code: code.trim().toUpperCase() }),
  });
  if (!response.ok) throw new Error(data.message || 'Gagal bergabung ke kelas.');
  return data;
}

/** Unggah foto profil baru (gambar, maks 2 MB). Mengembalikan { message, user }. */
export async function uploadAvatar(file) {
  const uploadedFile = await uploadFileToBlob(file, 'avatar');
  const { response, data } = await apiFetch('/auth/avatar', {
    method: 'POST',
    body: JSON.stringify({ file: uploadedFile }),
  });
  if (!response.ok) throw new Error(data.message || 'Gagal mengunggah foto profil.');
  if (data.user && typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
}

export function logout(router) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
}
