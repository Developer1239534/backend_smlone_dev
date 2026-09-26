const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { handleSendCredential } = require('../controllers/credentialController');

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

module.exports = router;
