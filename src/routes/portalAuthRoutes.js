const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/neonClient');

const JWT_SECRET = process.env.JWT_SECRET || 'smlone-portal-jwt-secret-2026';

// Helper to auto-create login account if not exists
async function getOrCreateTraineeAccount(studentId) {
  const cleanId = String(studentId).trim();

  // Check existing login account
  const accountRes = await db.query(
    'SELECT id, student_id, password, plain_password FROM login_trainee WHERE LOWER(student_id) = LOWER($1)',
    [cleanId]
  );

  if (accountRes.rows.length > 0) {
    return accountRes.rows[0];
  }

  // Check if trainee exists in portal_trainee
  const traineeRes = await db.query(
    'SELECT trainee_id FROM portal_trainee WHERE LOWER(trainee_id) = LOWER($1)',
    [cleanId]
  );

  if (traineeRes.rows.length === 0) {
    return null; // Trainee not found in system
  }

  // Create default account with password = SML + student_id
  const defaultPassword = `SML${cleanId}`;
  const hash = await bcrypt.hash(defaultPassword, 10);

  const insertRes = await db.query(`
    INSERT INTO login_trainee (student_id, password, plain_password)
    VALUES ($1, $2, $3)
    ON CONFLICT (student_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `, [cleanId, hash, defaultPassword]);

  return insertRes.rows[0];
}

// 1. POST /api/auth/trainee/login - Trainee Login (Student ID & Password)
router.post('/login', async (req, res) => {
  try {
    const { student_id, password } = req.body;

    if (!student_id || !password) {
      return res.status(400).json({
        success: false,
        message: 'Student ID dan Password wajib diisi.'
      });
    }

    const cleanStudentId = String(student_id).trim();
    const account = await getOrCreateTraineeAccount(cleanStudentId);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Student ID tidak terdaftar.'
      });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Password salah. Password default adalah SML + Student ID (Contoh: SML27).'
      });
    }

    // Fetch Trainee Profile details
    const profileRes = await db.query(
      'SELECT * FROM portal_trainee WHERE LOWER(trainee_id) = LOWER($1)',
      [cleanStudentId]
    );
    const profile = profileRes.rows[0] || {};

    // Generate JWT Token
    const token = jwt.sign(
      { student_id: account.student_id, role: 'trainee' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      message: 'Login berhasil!',
      token,
      data: {
        student_id: account.student_id,
        name: profile.name || null,
        program: profile.program || null,
        class: profile.class || null,
        level: profile.level || null,
        branch_id: profile.branch_id || null,
        profile
      }
    });
  } catch (error) {
    console.error('[Trainee Auth] Login error:', error);
    res.status(500).json({ success: false, message: 'Server error saat login.', error: error.message });
  }
});

// 2. POST /api/auth/trainee/forgot-password - Generate Reset Token / OTP Code
router.post('/forgot-password', async (req, res) => {
  try {
    const { student_id } = req.body;

    if (!student_id) {
      return res.status(400).json({ success: false, message: 'Student ID wajib diisi.' });
    }

    const cleanStudentId = String(student_id).trim();
    const account = await getOrCreateTraineeAccount(cleanStudentId);

    if (!account) {
      return res.status(404).json({ success: false, message: 'Student ID tidak terdaftar.' });
    }

    // Generate 6-digit Reset OTP Token
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Valid for 15 mins

    await db.query(`
      UPDATE login_trainee
      SET reset_token = $1, reset_token_expires = $2, updated_at = CURRENT_TIMESTAMP
      WHERE LOWER(student_id) = LOWER($3)
    `, [resetCode, expiresAt, cleanStudentId]);

    return res.json({
      success: true,
      message: 'Kode reset password berhasil dibuat.',
      student_id: cleanStudentId,
      reset_token: resetCode,
      expires_in: '15 menit',
      instructions: 'Gunakan reset_token ini pada endpoint /api/auth/trainee/reset-password'
    });
  } catch (error) {
    console.error('[Trainee Auth] Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error saat forgot password.', error: error.message });
  }
});

// 3. POST /api/auth/trainee/reset-password - Reset Password with Token
router.post('/reset-password', async (req, res) => {
  try {
    const { student_id, reset_token, new_password } = req.body;

    if (!student_id || !reset_token || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, reset_token, dan new_password wajib diisi.'
      });
    }

    const cleanStudentId = String(student_id).trim();

    const accountRes = await db.query(
      'SELECT * FROM login_trainee WHERE LOWER(student_id) = LOWER($1)',
      [cleanStudentId]
    );

    if (accountRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student ID tidak terdaftar.' });
    }

    const account = accountRes.rows[0];

    if (!account.reset_token || account.reset_token !== String(reset_token).trim()) {
      return res.status(400).json({ success: false, message: 'Kode reset_token tidak valid.' });
    }

    if (new Date() > new Date(account.reset_token_expires)) {
      return res.status(400).json({ success: false, message: 'Kode reset_token telah kedaluwarsa (kadaluwarsa 15 menit).' });
    }

    // Hash new password
    const hash = await bcrypt.hash(new_password, 10);

    await db.query(`
      UPDATE login_trainee
      SET password = $1, plain_password = $2, reset_token = NULL, reset_token_expires = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE LOWER(student_id) = LOWER($3)
    `, [hash, new_password, cleanStudentId]);

    return res.json({
      success: true,
      message: 'Password berhasil diperbarui! Silakan login kembali dengan password baru.'
    });
  } catch (error) {
    console.error('[Trainee Auth] Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error saat reset password.', error: error.message });
  }
});

// 4. POST /api/auth/trainee/change-password - Change Password directly
router.post('/change-password', async (req, res) => {
  try {
    const { student_id, current_password, new_password } = req.body;

    if (!student_id || !current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, current_password, dan new_password wajib diisi.'
      });
    }

    const cleanStudentId = String(student_id).trim();
    const account = await getOrCreateTraineeAccount(cleanStudentId);

    if (!account) {
      return res.status(404).json({ success: false, message: 'Student ID tidak terdaftar.' });
    }

    const isMatch = await bcrypt.compare(current_password, account.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Password saat ini salah.' });
    }

    const hash = await bcrypt.hash(new_password, 10);

    await db.query(`
      UPDATE login_trainee
      SET password = $1, plain_password = $2, updated_at = CURRENT_TIMESTAMP
      WHERE LOWER(student_id) = LOWER($3)
    `, [hash, new_password, cleanStudentId]);

    return res.json({
      success: true,
      message: 'Password berhasil diubah!'
    });
  } catch (error) {
    console.error('[Trainee Auth] Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error saat ubah password.', error: error.message });
  }
});

module.exports = router;
