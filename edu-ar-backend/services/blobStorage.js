const path = require('path');
const { del, head } = require('@vercel/blob');
const { uploadPolicy, isAllowedUpload } = require('../middleware/upload');

function isVercelBlobUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.endsWith('.blob.vercel-storage.com');
  } catch {
    return false;
  }
}

function badUpload(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function cleanOriginalName(value) {
  return String(value || 'file')
    .replace(/[\\/\r\n]/g, '_')
    .trim()
    .slice(-200) || 'file';
}

async function verifyOwnedBlob(upload, { userId, scope }) {
  if (!upload || !isVercelBlobUrl(upload.url)) {
    throw badUpload('File Blob tidak valid. Silakan unggah ulang.');
  }

  const policy = uploadPolicy(scope);
  if (!policy) throw badUpload('Jenis upload tidak didukung.');

  let blob;
  try {
    blob = await head(upload.url);
  } catch {
    throw badUpload('File Blob tidak ditemukan atau tidak dapat diverifikasi.');
  }

  const expectedPrefix = 'users/' + userId + '/' + scope + '/';
  if (
    typeof blob.pathname !== 'string' ||
    !blob.pathname.startsWith(expectedPrefix) ||
    blob.pathname.split('/').includes('..')
  ) {
    throw badUpload('File tidak cocok dengan akun atau jenis upload ini.');
  }

  const size = Number(blob.size);
  if (!Number.isFinite(size) || size < 1 || size > policy.maxBytes) {
    throw badUpload('Ukuran file melebihi batas yang diizinkan.');
  }

  const originalName = cleanOriginalName(upload.originalName || path.basename(blob.pathname));
  const mimeType = blob.contentType || upload.contentType || 'application/octet-stream';
  if (!isAllowedUpload({ originalName, mimeType }, scope)) {
    throw badUpload('Tipe file tidak didukung.');
  }

  return {
    url: blob.url,
    pathname: blob.pathname,
    originalName,
    mimeType,
    size,
  };
}

async function deleteBlobIfVercelUrl(url) {
  if (!isVercelBlobUrl(url)) return;
  try {
    await del(url);
  } catch (error) {
    // Keep the database operation successful if storage cleanup is temporarily
    // unavailable; the orphan can be removed from the Blob dashboard later.
    console.warn('Tidak dapat menghapus file Blob:', error.message);
  }
}

module.exports = { isVercelBlobUrl, verifyOwnedBlob, deleteBlobIfVercelUrl };
