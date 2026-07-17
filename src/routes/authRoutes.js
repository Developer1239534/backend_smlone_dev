const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/neonClient');

const JWT_SECRET = process.env.JWT_SECRET || 'smlone_secret_key_12345';

// GET /api/auth/login
router.get('/login', (req, res) => {
  res.json({ success: true, message: 'Admin Auth Login endpoint is active. Send POST request to login.' });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log('[Admin Auth Login] Request Body:', req.body);
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username dan password wajib diisi.' });
  }

  try {
    const result = await db.query('SELECT * FROM admin_akun WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Akun admin tidak ditemukan.' });
    }

    const admin = result.rows[0];

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Password salah.' });
    }

    const payload = {
      admin: {
        id: admin.id,
        username: admin.username
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;

        res.json({
          success: true,
          message: 'Login Admin berhasil.',
          token,
          data: {
            id: admin.id,
            username: admin.username
          }
        });
      }
    );
  } catch (err) {
    console.error('[Admin Auth Login Error]:', err.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat login.' });
  }
});

module.exports = router;
