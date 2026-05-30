const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/neonClient');

const JWT_SECRET = process.env.JWT_SECRET || 'smlone_secret_key_12345';

// GET /api/auth/register
router.get('/register', (req, res) => {
  res.json({ success: true, message: 'Auth Register endpoint is active! Please send a POST request with id, email, and password to register.' });
});

// GET /api/auth/login
router.get('/login', (req, res) => {
  res.json({ success: true, message: 'Auth Login endpoint is active! Please send a POST request with email/id and password to login.' });
});

// 1. POST /api/auth/register
router.post('/register', async (req, res) => {
  const { id, trainee_name, email, password } = req.body;

  if (!id || !email || !password) {
    return res.status(400).json({ success: false, message: 'Student ID (id), email, dan password wajib diisi.' });
  }

  try {
    // Check if email is already in use
    const emailCheck = await db.query(
      'SELECT id FROM dashboard_trainne WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email sudah digunakan oleh akun lain.' });
    }

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
        'INSERT INTO dashboard_trainne (id, trainee_name, email, password, status) VALUES ($1, $2, $3, $4, $5)',
        [id, name, email, hashedPassword, 'Active']
      );
      return res.status(201).json({
        success: true,
        message: 'Registrasi berhasil. Akun trainee baru telah dibuat.',
        data: { id, trainee_name: name, email }
      });
    } else {
      const trainee = traineeResult.rows[0];
      if (trainee.password) {
        return res.status(400).json({ success: false, message: 'Student ID ini sudah pernah terdaftar.' });
      }

      // Update pre-seeded trainee with email and password
      await db.query(
        'UPDATE dashboard_trainne SET email = $1, password = $2 WHERE id = $3',
        [email, hashedPassword, id]
      );

      return res.status(200).json({
        success: true,
        message: 'Registrasi berhasil. Akun trainee berhasil diaktifkan.',
        data: { id, email }
      });
    }
  } catch (err) {
    console.error('[Auth Register Error]:', err.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat registrasi.' });
  }
});

// 2. POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, id, password } = req.body;

  // Accept either email or id (student ID) for logging in
  const identifier = email || id;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Email/ID dan password wajib diisi.' });
  }

  try {
    // Find trainee by email or ID
    const traineeResult = await db.query(
      'SELECT * FROM dashboard_trainne WHERE LOWER(email) = LOWER($1) OR id = $1',
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
        name: trainee.trainee_name,
        email: trainee.email
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
