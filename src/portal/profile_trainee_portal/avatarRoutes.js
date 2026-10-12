const express = require('express');
const multer = require('multer');
const cloudinary = require('../../utils/cloudinary');
const db = require('../../db/neonClient');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.'), false);
  }
});

// POST /api/profile-trainee/:id/avatar — upload foto profil ke Cloudinary
router.post('/:id/avatar', upload.single('avatar'), async (req, res) => {
  const { id } = req.params;
  const cleanId = String(id || '').trim();
  if (!cleanId) return res.status(400).json({ success: false, message: 'ID trainee wajib diisi.' });
  if (!req.file) return res.status(400).json({ success: false, message: 'File foto wajib diupload. Field: avatar' });
  try {
    const check = await db.query('SELECT "ID" FROM profile_trainee WHERE "ID" = $1 LIMIT 1', [cleanId]);
    if (check.rows.length === 0) return res.status(404).json({ success: false, message: `Trainee ID ${cleanId} tidak ditemukan.` });

    const b64 = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: 'smlone/avatars',
      public_id: cleanId,
      overwrite: true,
      resource_type: 'image',
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }, { quality: 'auto', fetch_format: 'auto' }]
    });
    const avatarUrl = uploadResult.secure_url;
    await db.query('UPDATE profile_trainee SET "avatar_url" = $1 WHERE "ID" = $2', [avatarUrl, cleanId]);
    return res.status(200).json({ success: true, message: 'Foto profil berhasil diupload.', data: { id: cleanId, avatar_url: avatarUrl, public_id: uploadResult.public_id } });
  } catch (err) {
    console.error('[Avatar Upload] Error:', err.message);
    if (err.message && err.message.includes('Format file')) return res.status(400).json({ success: false, message: err.message });
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, message: 'Ukuran file maksimal 2MB.' });
    return res.status(500).json({ success: false, message: 'Gagal upload foto profil.', error: err.message });
  }
});

// DELETE /api/profile-trainee/:id/avatar — hapus foto
router.delete('/:id/avatar', async (req, res) => {
  const { id } = req.params;
  const cleanId = String(id || '').trim();
  try {
    const check = await db.query('SELECT "ID" FROM profile_trainee WHERE "ID" = $1 LIMIT 1', [cleanId]);
    if (check.rows.length === 0) return res.status(404).json({ success: false, message: `Trainee ID ${cleanId} tidak ditemukan.` });
    try { await cloudinary.uploader.destroy(`smlone/avatars/${cleanId}`); } catch (_) {}
    await db.query('UPDATE profile_trainee SET "avatar_url" = NULL WHERE "ID" = $1', [cleanId]);
    return res.json({ success: true, message: 'Foto profil berhasil dihapus.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
