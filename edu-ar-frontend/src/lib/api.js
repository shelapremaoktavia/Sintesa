export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

/** URL absolut foto profil (backend menyimpan path relatif /uploads/avatars/...). */
export function avatarUrlOf(user) {
  const u = user?.avatarUrl;
  if (!u) return null;
  if (u.startsWith('http')) return u;
  return `${API_URL.replace(/\/api$/, '')}${u}`;
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
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const form = new FormData();
  form.append('avatar', file);
  const response = await fetch(`${API_URL}/auth/avatar`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await response.json().catch(() => ({}));
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
