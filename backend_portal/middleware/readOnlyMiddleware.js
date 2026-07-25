/**
 * Read-Only Enforcer Middleware
 * Ensures that only HTTP GET methods are allowed for Portal Trainee API.
 */
module.exports = function readOnlyMiddleware(req, res, next) {
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    return res.status(405).json({
      success: false,
      message: 'Akses Ditolak: API Portal Trainee hanya bersifat READ-ONLY (Hanya dapat dilihat). Operasi perubahan data (POST, PUT, DELETE, PATCH) tidak diizinkan.'
    });
  }
  next();
};
