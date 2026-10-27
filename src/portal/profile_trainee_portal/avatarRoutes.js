const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cloudinary = require('../../utils/cloudinary');
const db = require('../../db/neonClient');

const router = express.Router();

// Directory penyimpanan avatar lokal VPS
const UPLOADS_DIR = path.resolve(__dirname, '../../../uploads/avatars');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.'), false);
  }
});

// Helper: Ekstrak buffer & mimetype dari multipart file atau base64
function extractImagePayload(req) {
  if (req.file && req.file.buffer) {
    return {
      buffer: req.file.buffer,
      mimetype: req.file.mimetype || 'image/jpeg',
      extension: req.file.mimetype === 'image/png' ? 'png' : req.file.mimetype === 'image/webp' ? 'webp' : 'jpg'
    };
  }

  const base64Str = req.body?.avatar || req.body?.avatar_base64 || req.body?.dataUrl || req.body?.photo;
  if (base64Str && typeof base64Str === 'string' && base64Str.includes('base64,')) {
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const mimetype = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      const extension = mimetype === 'image/png' ? 'png' : mimetype === 'image/webp' ? 'webp' : 'jpg';
      return { buffer, mimetype, extension };
    }
  }

  return null;
}

// POST /api/profile-trainee/:id/avatar — upload / update foto profil real-time
router.post('/:id/avatar', upload.single('avatar'), async (req, res) => {
  const { id } = req.params;
  const cleanId = String(id || '').trim();
  if (!cleanId) return res.status(400).json({ success: false, message: 'ID trainee wajib diisi.' });

  const payload = extractImagePayload(req);
  if (!payload) {
    return res.status(400).json({
      success: false,
      message: 'File foto wajib diupload via multipart field "avatar" atau JSON base64 "avatar".'
    });
  }

  try {
    const check = await db.query('SELECT "ID" FROM profile_trainee WHERE "ID" = $1 LIMIT 1', [cleanId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Trainee ID ${cleanId} tidak ditemukan.` });
    }

    let avatarUrl = '';

    // 1. Coba upload ke Cloudinary terlebih dahulu jika kredensial aktif
    try {
      const dataUri = `data:${payload.mimetype};base64,${payload.buffer.toString('base64')}`;
      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: 'smlone/avatars',
        public_id: cleanId,
        overwrite: true,
        invalidate: true,
        resource_type: 'image',
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }, { quality: 'auto', fetch_format: 'auto' }]
      });
      if (uploadResult && uploadResult.secure_url) {
        avatarUrl = uploadResult.secure_url;
      }
    } catch (cErr) {
      // Abaikan error Cloudinary dan langsung gunakan storage lokal VPS
      console.warn('[Avatar Upload] Cloudinary bypass/fallback ke local VPS:', cErr.message);
    }

    // 2. Jika Cloudinary tidak mengembalikan URL, simpan ke VPS disk /uploads/avatars/
    if (!avatarUrl) {
      const filename = `${cleanId}.${payload.extension}`;
      const filePath = path.join(UPLOADS_DIR, filename);
      await fs.promises.writeFile(filePath, payload.buffer);
      // Cache-buster query param agar perubahan foto real-time seketika ter-refresh di browser
      const version = Date.now();
      avatarUrl = `https://api.smlone.cloud/uploads/avatars/${filename}?v=${version}`;
    }

    // 3. Simpan avatar_url ke database profile_trainee
    await db.query('UPDATE profile_trainee SET "avatar_url" = $1 WHERE "ID" = $2', [avatarUrl, cleanId]);

    return res.status(200).json({
      success: true,
      message: 'Foto profil berhasil diperbarui secara real-time.',
      data: {
        id: cleanId,
        avatar_url: avatarUrl
      }
    });
  } catch (err) {
    console.error('[Avatar Upload] Error:', err.message);
    if (err.message && err.message.includes('Format file')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'Ukuran file maksimal 10MB.' });
    }
    return res.status(500).json({ success: false, message: 'Gagal upload foto profil.', error: err.message });
  }
});

// DELETE /api/profile-trainee/:id/avatar — hapus foto profil
router.delete('/:id/avatar', async (req, res) => {
  const { id } = req.params;
  const cleanId = String(id || '').trim();
  try {
    const check = await db.query('SELECT "ID" FROM profile_trainee WHERE "ID" = $1 LIMIT 1', [cleanId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Trainee ID ${cleanId} tidak ditemukan.` });
    }

    // Hapus dari Cloudinary jika ada
    try {
      await cloudinary.uploader.destroy(`smlone/avatars/${cleanId}`);
    } catch (_) {}

    // Hapus dari disk lokal
    const possibleExts = ['jpg', 'png', 'webp', 'jpeg'];
    for (const ext of possibleExts) {
      const fPath = path.join(UPLOADS_DIR, `${cleanId}.${ext}`);
      if (fs.existsSync(fPath)) {
        try { fs.unlinkSync(fPath); } catch (_) {}
      }
    }

    // Reset di database
    await db.query('UPDATE profile_trainee SET "avatar_url" = NULL WHERE "ID" = $1', [cleanId]);
    return res.json({ success: true, message: 'Foto profil berhasil dihapus secara real-time.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
