const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db/neonClient');

// 3. Forgot / Reset Password
// PATCH or POST or PUT /api/students/:id
const handlePasswordReset = async (req, res) => {
  const { id } = req.params;
  const { password, newPassword } = req.body;

  const targetPassword = password || newPassword;

  if (!targetPassword) {
    return res.status(400).json({ success: false, message: 'Password baru (password / newPassword) wajib diisi.' });
  }

  try {
    // Check if student exists
    const traineeResult = await db.query(
      'SELECT id FROM dashboard_trainne WHERE id = $1',
      [id]
    );

    if (traineeResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Trainee dengan ID ${id} tidak ditemukan.` });
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

router.patch('/:id', handlePasswordReset);
router.post('/:id', handlePasswordReset);
router.put('/:id', handlePasswordReset);

module.exports = router;
