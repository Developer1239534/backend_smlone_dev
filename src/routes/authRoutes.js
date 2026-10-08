const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const db = require('../db/neonClient');
const { handleSendCredential } = require('../controllers/credentialController');
const { logPortalLogin } = require('../utils/discordPortalLogger');

const JWT_SECRET = process.env.JWT_SECRET || 'smlone_secret_key_12345';

// Rate limiting: Maks 3 request per 10 menit per IP
const emailLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 menit
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Terlalu banyak permintaan. Silakan coba 10 menit lagi.'
  }
});

router.post('/send-credential', emailLimiter, handleSendCredential);

// Endpoint /api/v1/auth/token & /login untuk menghasilkan JWT trainee
router.post(['/token', '/login'], async (req, res) => {
  const { id, ID, studentId, student_id, password, Password } = req.body || {};
  const rawId = String(id ?? ID ?? studentId ?? student_id ?? '').trim();
  const rawPass = String(password ?? Password ?? '');
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  if (!rawId) {
    return res.status(400).json({ success: false, error: 'ID Trainee wajib diisi.' });
  }

  try {
    const cred = await db.query(
      'SELECT "ID", "Name", "Password" FROM credential_portal WHERE "ID" = $1 OR "ID" ILIKE $1 LIMIT 1',
      [rawId]
    );

    if (cred.rows.length === 0) {
      // Async Discord Logging (Gagal - ID tidak ditemukan)
      setImmediate(() => {
        logPortalLogin({
          traineeId: rawId,
          traineeName: 'Unknown',
          success: false,
          statusText: 'ID Trainee tidak ditemukan',
          ip: clientIp,
          userAgent
        });
      });

      return res.status(404).json({ success: false, error: 'Trainee dengan ID tersebut tidak ditemukan.' });
    }

    const trainee = cred.rows[0];
    if (rawPass && String(trainee.Password) !== rawPass) {
      // Async Discord Logging (Gagal - Password Salah)
      setImmediate(() => {
        logPortalLogin({
          traineeId: trainee.ID,
          traineeName: trainee.Name,
          success: false,
          statusText: 'Password Salah',
          ip: clientIp,
          userAgent
        });
      });

      return res.status(401).json({ success: false, error: 'Password salah.' });
    }

    let email = '';
    try {
      const p = await db.query(
        'SELECT "Parents Email Account" AS email FROM profile_trainee WHERE "ID" = $1 LIMIT 1',
        [trainee.ID]
      );
      if (p.rows.length > 0 && p.rows[0].email) {
        email = String(p.rows[0].email).trim().toLowerCase();
      }
    } catch (_) {}

    const token = jwt.sign(
      {
        id: trainee.ID,
        trainee_id: trainee.ID,
        name: trainee.Name,
        email
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Async Discord Logging (Berhasil Login)
    setImmediate(() => {
      logPortalLogin({
        traineeId: trainee.ID,
        traineeName: trainee.Name,
        success: true,
        statusText: 'Login Berhasil',
        ip: clientIp,
        userAgent
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Token JWT berhasil dibuat.',
      token,
      user: {
        id: trainee.ID,
        trainee_id: trainee.ID,
        name: trainee.Name,
        email
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
