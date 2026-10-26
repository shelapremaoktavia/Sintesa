const express = require('express');
const path = require('path');
const { handleUpload } = require('@vercel/blob/client');
const { protect } = require('../middleware/authMiddleware');
const { uploadPolicy } = require('../middleware/upload');

const router = express.Router();

// Vercel calls the same endpoint after a completed upload. handleUpload checks
// the signed Blob callback; only token-generation requests need our JWT.
function authenticateTokenRequest(req, res, next) {
  if (req.body?.type === 'blob.upload-completed') return next();
  return protect(req, res, next);
}

router.post('/client', authenticateTokenRequest, async (req, res) => {
  try {
    const body = req.body || {};
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!req.user) throw new Error('Login diperlukan untuk mengunggah file.');

        const scope = String(clientPayload || '');
        const policy = uploadPolicy(scope);
        if (!policy || !policy.roles.includes(req.user.role)) {
          throw new Error('Kamu tidak berhak mengunggah jenis file ini.');
        }

        const prefix = 'users/' + req.user.userId + '/' + scope + '/';
        if (
          typeof pathname !== 'string' ||
          !pathname.startsWith(prefix) ||
          pathname.split('/').includes('..')
        ) {
          throw new Error('Lokasi upload tidak valid.');
        }
        if (!policy.allowedExt.has(path.extname(pathname).toLowerCase())) {
          throw new Error('Ekstensi file tidak didukung.');
        }

        return {
          allowedContentTypes: Array.from(policy.allowedMimes),
          maximumSizeInBytes: policy.maxBytes,
          addRandomSuffix: true,
          validUntil: Date.now() + 5 * 60 * 1000,
          tokenPayload: JSON.stringify({ userId: req.user.userId, scope }),
          ...(process.env.VERCEL_BLOB_CALLBACK_URL
            ? { callbackUrl: process.env.VERCEL_BLOB_CALLBACK_URL }
            : {}),
        };
      },
      onUploadCompleted: async () => {
        // Database records are created by the authenticated API endpoint that
        // receives the completed Blob metadata from the frontend.
      },
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message || 'Gagal memproses upload.' });
  }
});

module.exports = router;
