const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'smlone_secret_key_12345';

/**
 * Middleware untuk memverifikasi token JWT dari header request.
 */
const verifyToken = (req, res, next) => {
  // Ambil token dari header Authorization (format: Bearer <token>)
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token autentikasi tidak disediakan.'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Format token harus "Bearer <token>".'
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Simpan data trainee yang didekodekan ke request
    req.trainee = decoded.trainee;
    req.user = decoded; // Menyimpan objek utuh untuk fleksibilitas tambahan
    
    next();
  } catch (err) {
    console.error('[Auth Middleware Error]:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token tidak valid atau kedaluwarsa.'
    });
  }
};

module.exports = verifyToken;
