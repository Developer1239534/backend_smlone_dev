const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db/neonClient');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

const upload = multer({ storage: multer.memoryStorage() });
const uploadMiddleware = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'profile_picture', maxCount: 1 }
]);

const uploadToCloudinary = (fileBuffer, folder = 'smlone/profiles') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// 3. Forgot / Reset Password
// PATCH or POST or PUT /api/students/:id
const handlePasswordReset = async (req, res) => {
  const { id } = req.params;
  const { password, newPassword, phone } = req.body;

  const targetPassword = password || newPassword;

  if (!targetPassword) {
    return res.status(400).json({ success: false, message: 'Password baru (password / newPassword) wajib diisi.' });
  }

  if (!phone) {
    return res.status(400).json({ success: false, message: 'Nomor telepon (phone) wajib diisi untuk verifikasi.' });
  }

  try {
    // Check if student exists and retrieve phone number
    const traineeResult = await db.query(
      'SELECT id, phone FROM dashboard_trainne WHERE id = $1',
      [id]
    );

    if (traineeResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Trainee dengan ID ${id} tidak ditemukan.` });
    }

    const trainee = traineeResult.rows[0];

    // Normalize phone numbers for robust comparison (keep only digits)
    const normalizedInputPhone = String(phone).replace(/\D/g, '');
    const normalizedDbPhone = trainee.phone ? String(trainee.phone).replace(/\D/g, '') : '';

    if (!normalizedDbPhone || normalizedInputPhone !== normalizedDbPhone) {
      return res.status(400).json({ success: false, message: 'Nomor telepon tidak cocok atau tidak terdaftar untuk ID ini.' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(targetPassword, salt);

    // Update password in database
    await db.query(
      'UPDATE dashboard_trainne SET password = $1 WHERE id = $2',
      [hashedPassword, id]
    );

    res.json({
      success: true,
      message: 'Password berhasil diubah / direset dengan sukses.',
      data: { id }
    });
  } catch (err) {
    console.error('[Reset Password Error]:', err.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat mereset password.' });
  }
};

const handleStudentUpdate = async (req, res) => {
  const { id } = req.params;

  console.log('[Student Update Request]:', {
    id,
    body: req.body,
    files: req.files ? Object.keys(req.files) : null
  });

  const { password, newPassword, phone, profile_picture, trainee_name } = req.body;

  // If password/newPassword is provided in request body, delegate to handlePasswordReset
  if (password || newPassword) {
    return handlePasswordReset(req, res);
  }

  try {
    // Check if trainee exists
    const traineeResult = await db.query(
      'SELECT id FROM dashboard_trainne WHERE id = $1',
      [id]
    );

    if (traineeResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Trainee dengan ID ${id} tidak ditemukan.` });
    }

    let resolvedProfilePicture = profile_picture;

    // Check for uploaded file in req.files
    let uploadedFile = null;
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        uploadedFile = req.files.image[0];
      } else if (req.files.profile_picture && req.files.profile_picture[0]) {
        uploadedFile = req.files.profile_picture[0];
      }
    }

    if (uploadedFile) {
      console.log(`[Cloudinary Upload] Uploading file for student ID: ${id} via PUT/PATCH`);
      const uploadResult = await uploadToCloudinary(uploadedFile.buffer);
      resolvedProfilePicture = uploadResult.secure_url;
    } else if (profile_picture && (profile_picture.startsWith('data:image/') || (profile_picture.startsWith('http') && !profile_picture.includes('cloudinary.com')))) {
      console.log(`[Cloudinary Upload] Uploading body string/url for student ID: ${id} via PUT/PATCH`);
      const uploadResult = await cloudinary.uploader.upload(profile_picture, {
        folder: 'smlone/profiles'
      });
      resolvedProfilePicture = uploadResult.secure_url;
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (resolvedProfilePicture !== undefined) {
      updates.push(`profile_picture = $${paramIndex++}`);
      values.push(resolvedProfilePicture);
    }

    if (trainee_name !== undefined) {
      updates.push(`trainee_name = $${paramIndex++}`);
      values.push(trainee_name);
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data profil yang dikirim untuk diperbarui.' });
    }

    values.push(id);
    const query = `UPDATE dashboard_trainne SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
    await db.query(query, values);

    // Get updated trainee profile (excluding password)
    const updatedResult = await db.query('SELECT * FROM dashboard_trainne WHERE id = $1', [id]);
    const updatedTrainee = updatedResult.rows[0];
    if (updatedTrainee) {
      delete updatedTrainee.password;
    }

    res.json({
      success: true,
      message: 'Profil trainee berhasil diperbarui.',
      data: updatedTrainee
    });
  } catch (err) {
    console.error('[Profile Update Error]:', err.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat memperbarui profil.' });
  }
};

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Student endpoint is active! To reset password, send a PATCH, POST, or PUT request to /api/students/:id with the new password in the request body.'
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: `Student Reset Password endpoint is active for ID: ${id}! Please send a PATCH, POST, or PUT request with 'password' in the request body to reset the password.`
  });
});

router.patch('/:id', uploadMiddleware, handleStudentUpdate);
router.post('/:id', handlePasswordReset);
router.put('/:id', uploadMiddleware, handleStudentUpdate);


router.post('/:id/profile-picture', uploadMiddleware, async (req, res) => {
  const { id } = req.params;

  console.log('[Student Profile Picture Upload Request]:', {
    id,
    body: req.body,
    files: req.files ? Object.keys(req.files) : null
  });

  const { imageUrl, image: bodyImage } = req.body;

  try {
    // Check if trainee exists
    const checkResult = await db.query('SELECT id FROM dashboard_trainne WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Trainee dengan ID ${id} tidak ditemukan.` });
    }

    let secureUrl = '';

    // Scenario 1: File Upload (multipart/form-data)
    let uploadedFile = null;
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        uploadedFile = req.files.image[0];
      } else if (req.files.profile_picture && req.files.profile_picture[0]) {
        uploadedFile = req.files.profile_picture[0];
      }
    }

    if (uploadedFile) {
      console.log(`[Cloudinary Upload] Uploading file for student ID: ${id}`);
      const uploadResult = await uploadToCloudinary(uploadedFile.buffer);
      secureUrl = uploadResult.secure_url;
    } 
    // Scenario 2: Base64 String or URL from request body
    else if (imageUrl || bodyImage) {
      const inputImage = imageUrl || bodyImage;
      console.log(`[Cloudinary Upload] Uploading image link/base64 for student ID: ${id}`);
      const uploadResult = await cloudinary.uploader.upload(inputImage, {
        folder: 'smlone/profiles'
      });
      secureUrl = uploadResult.secure_url;
    } 
    // No image provided
    else {
      return res.status(400).json({ 
        success: false, 
        message: 'Silakan kirim file gambar (multipart form-data dengan nama field "image" atau "profile_picture"), atau kirim JSON body dengan "imageUrl" / "image".' 
      });
    }

    // Save Cloudinary URL to database
    await db.query(
      'UPDATE dashboard_trainne SET profile_picture = $1 WHERE id = $2',
      [secureUrl, id]
    );

    res.json({
      success: true,
      message: 'Foto profil berhasil diperbarui.',
      profile_picture: secureUrl
    });
  } catch (error) {
    console.error('[Cloudinary Upload Error]:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat mengunggah foto profil ke Cloudinary.', 
      error: error.message 
    });
  }
});

module.exports = router;
