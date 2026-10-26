// File policies for Vercel Blob uploads. Files no longer go through a Vercel
// Function or its temporary filesystem.
const path = require('path');

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const ALLOWED_MIMES = new Set([
  'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv',
  'application/zip', 'application/x-zip-compressed',
  'video/mp4', 'audio/mpeg',
  'model/gltf-binary', 'model/gltf+json',
  'application/octet-stream',
]);

const ALLOWED_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg',
  '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.csv',
  '.zip', '.mp4', '.mp3', '.glb', '.gltf',
]);

const AVATAR_MIMES = new Set([
  'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif',
]);
const AVATAR_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

const UPLOAD_POLICIES = {
  avatar: {
    maxBytes: MAX_AVATAR_BYTES,
    allowedMimes: AVATAR_MIMES,
    allowedExt: AVATAR_EXT,
    roles: ['SISWA', 'GURU', 'ADMIN'],
  },
  submission: {
    maxBytes: MAX_FILE_BYTES,
    allowedMimes: ALLOWED_MIMES,
    allowedExt: ALLOWED_EXT,
    roles: ['SISWA'],
  },
  assignment: {
    maxBytes: MAX_FILE_BYTES,
    allowedMimes: ALLOWED_MIMES,
    allowedExt: ALLOWED_EXT,
    roles: ['GURU'],
  },
};

function uploadPolicy(scope) {
  return UPLOAD_POLICIES[scope] || null;
}

function isAllowedUpload({ originalName = '', mimeType = '' } = {}, scope = 'submission') {
  const policy = uploadPolicy(scope);
  if (!policy) return false;
  const extension = path.extname(originalName).toLowerCase();
  return policy.allowedMimes.has(mimeType) || policy.allowedExt.has(extension);
}

module.exports = {
  ALLOWED_MIMES,
  ALLOWED_EXT,
  AVATAR_MIMES,
  AVATAR_EXT,
  MAX_FILE_BYTES,
  MAX_AVATAR_BYTES,
  uploadPolicy,
  isAllowedUpload,
};
