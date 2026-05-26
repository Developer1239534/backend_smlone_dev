const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// POST /api/auth/login
// Password bekerja seperti parent_phone:
// - Jika trainee_id ada, login selalu berhasil
// - Password yang dimasukkan SELALU disimpan/diupdate ke DB
// - Tidak ada validasi password lama (bisa ganti kapan saja)
router.post('/login', async (req, res) => {
  const { student_id, password } = req.body;
  if (!student_id || !password) {
    return res.status(400).json({ success: false, message: 'Student ID dan password wajib diisi.' });
  }
  try {
    const result = await db.query(
      `SELECT trainee_id, trainee_name, status, profile_url
       FROM trainees WHERE trainee_id = $1`,
      [student_id.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Student ID tidak ditemukan.' });
    }

    const trainee = result.rows[0];

    // Selalu simpan/update password ke DB (seperti parent_phone)
    await db.query(
      `UPDATE trainees SET password = $1 WHERE trainee_id = $2`,
      [password, student_id.trim()]
    );

    return res.json({
      success: true,
      student: {
        student_id: trainee.trainee_id,
        full_name: trainee.trainee_name,
        status: trainee.status,
        profile_url: trainee.profile_url,
      }
    });
  } catch (err) {
    console.error('[Auth] Login error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/students/:student_id — ambil data trainee
router.get('/:student_id', async (req, res) => {
  const { student_id } = req.params;
  try {
    const result = await db.query(
      `SELECT trainee_id, trainee_name, status, profile_url
       FROM trainees WHERE trainee_id = $1`,
      [student_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trainee tidak ditemukan.' });
    }
    const t = result.rows[0];
    return res.json({
      success: true,
      student: {
        student_id: t.trainee_id,
        full_name: t.trainee_name,
        status: t.status,
        profile_url: t.profile_url,
      }
    });
  } catch (err) {
    console.error('[Students] Fetch error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PUT /api/students/:student_id — update password trainee
router.put('/:student_id', async (req, res) => {
  const { student_id } = req.params;
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password wajib diisi.' });
  }
  try {
    const check = await db.query(
      `SELECT trainee_id FROM trainees WHERE trainee_id = $1`,
      [student_id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student ID tidak ditemukan.' });
    }
    await db.query(
      `UPDATE trainees SET password = $1 WHERE trainee_id = $2`,
      [password, student_id]
    );
    return res.json({ success: true, message: 'Password berhasil diubah.' });
  } catch (err) {
    console.error('[Students] Update error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
