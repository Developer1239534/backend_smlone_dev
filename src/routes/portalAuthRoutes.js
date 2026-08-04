const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/neonClient');

const JWT_SECRET = process.env.JWT_SECRET || 'smlone-portal-jwt-secret-2026';

// Helper to auto-create login account if not exists
async function getOrCreateTraineeAccount(studentId) {
  const cleanId = String(studentId).trim();

  // Check if trainee exists in login_portal_fix
  const traineeRes = await db.query(
    'SELECT * FROM login_portal_fix WHERE LOWER(id) = LOWER($1)',
    [cleanId]
  );

  if (traineeRes.rows.length === 0) {
    return null; // Trainee not found in system
  }

  const trainee = traineeRes.rows[0];

  return {
    student_id: trainee.id,
    password: trainee.password || `SML${trainee.id}`,
    plain_password: `SML${trainee.id}`,
    trainee
  };
}

// 1. POST /api/auth/trainee/login - Trainee Login (Student ID & Password)
router.post('/login', async (req, res) => {
  try {
    const { student_id, id, password } = req.body;
    const rawId = student_id || id || '';
    const cleanStudentId = String(rawId).trim();

    if (!cleanStudentId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Student ID dan Password wajib diisi.'
      });
    }

    const account = await getOrCreateTraineeAccount(cleanStudentId);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Student ID tidak terdaftar.'
      });
    }

    const cleanPassword = String(password).trim();
    const storedPassword = String(account.password || '').trim();
    const expectedDefault = `SML${cleanStudentId}`;

    let isMatch = false;
    if (cleanPassword === storedPassword || cleanPassword === expectedDefault) {
      isMatch = true;
    } else if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(cleanPassword, storedPassword).catch(() => false);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: `Password salah. Format password yang benar adalah ${expectedDefault}`
      });
    }

    const profile = account.trainee;

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
        program: profile.cleaned_program || null,
        class: profile.class || null,
        level: profile.level || null,
        branch_id: profile.cabang_id || null,
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
