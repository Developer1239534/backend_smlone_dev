const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/neonClient');

const JWT_SECRET = process.env.JWT_SECRET || 'smlone_secret_key_12345';

// GET /api/auth/register
router.get('/register', (req, res) => {
  res.json({ success: true, message: 'Auth Register endpoint is active! Please send a POST request with id and password to register.' });
});

// GET /api/auth/login
router.get('/login', (req, res) => {
  res.json({ success: true, message: 'Auth Login endpoint is active! Please send a POST request with id/studentId and password to login.' });
});

// 1. POST /api/auth/register
router.post('/register', async (req, res) => {
  const { id, trainee_name, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ success: false, message: 'Student ID (id) dan password wajib diisi.' });
  }

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if Student ID exists in pre-seeded table
    const traineeResult = await db.query(
      'SELECT id, password FROM dashboard_trainne WHERE id = $1',
      [id]
    );

    if (traineeResult.rows.length === 0) {
      // If student ID is not pre-seeded, we can register them as a new trainee
      const name = trainee_name || `Trainee ${id}`;
      await db.query(
        'INSERT INTO dashboard_trainne (id, trainee_name, password, plain_password, status) VALUES ($1, $2, $3, $4, $5)',
        [id, name, hashedPassword, password, 'Active']
      );
      return res.status(201).json({
        success: true,
        message: 'Registrasi berhasil. Akun trainee baru telah dibuat.',
        data: { id, trainee_name: name }
      });
    } else {
      const trainee = traineeResult.rows[0];
      if (trainee.password) {
        return res.status(400).json({ success: false, message: 'Student ID ini sudah pernah terdaftar.' });
      }

      // Update pre-seeded trainee with password
      await db.query(
        'UPDATE dashboard_trainne SET password = $1, plain_password = $2 WHERE id = $3',
        [hashedPassword, password, id]
      );

      return res.status(200).json({
        success: true,
        message: 'Registrasi berhasil. Akun trainee berhasil diaktifkan.',
        data: { id }
      });
    }
  } catch (err) {
    console.error('[Auth Register Error]:', err.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat registrasi.' });
  }
});

// 2. POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log('[Auth Login] Request Body:', req.body);
  const { id, username, studentId, traineeId, student_id, password } = req.body;

  // Accept any common identifier field sent by the frontend
  const identifier = id || username || studentId || traineeId || student_id;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Student ID dan password wajib diisi.' });
  }

  try {
    // Find trainee by ID
    const traineeResult = await db.query(
      'SELECT * FROM dashboard_trainne WHERE id = $1',
      [identifier]
    );

    if (traineeResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Akun tidak ditemukan.' });
    }

    const trainee = traineeResult.rows[0];

    if (!trainee.password) {
      return res.status(400).json({ success: false, message: 'Akun ini belum diaktivasi/registrasi.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, trainee.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Password salah.' });
    }

    // Generate JWT Token
    const payload = {
      trainee: {
        id: trainee.id,
        name: trainee.trainee_name
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '7d' }, // 7 days expiry
      (err, token) => {
        if (err) throw err;

        // Return token and trainee profile information (excluding password)
        const { password, ...traineeProfile } = trainee;
        
        if (typeof traineeProfile.class === 'string') {
          traineeProfile.class = traineeProfile.class.replace(/\s*\([^)]*\)/g, '').trim();
        }

        // Add robust aliases for Student ID to ensure perfect frontend compatibility
        traineeProfile.studentId = trainee.id;
        traineeProfile.student_id = trainee.id;
        traineeProfile.traineeId = trainee.id;

        res.json({
          success: true,
          message: 'Login berhasil.',
          token,
          data: traineeProfile
        });
      }
    );
  } catch (err) {
    console.error('[Auth Login Error]:', err.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat login.' });
  }
});

module.exports = router;
