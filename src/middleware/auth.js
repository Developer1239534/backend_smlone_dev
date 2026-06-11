const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'smlone_secret_key_12345';

module.exports = function (req, res, next) {
  // 1. Check fallback (extremely useful for quick API testing without login flow)
  const fallbackId = req.query.trainee_id || req.query.student_id || 
                     req.headers['x-trainee-id'] || req.headers['x-student-id'] ||
                     req.body.trainee_id || req.body.student_id;
  
  if (fallbackId) {
    req.trainee = { id: fallbackId };
    return next();
  }

  // 2. Check token from header
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Access Denied: No token or identifier provided.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.trainee = decoded.trainee;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};
