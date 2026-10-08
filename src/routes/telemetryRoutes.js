const express = require('express');
const router = express.Router();
const { logPortalActivity } = require('../utils/discordPortalLogger');

router.post(['/event', '/activity-log'], (req, res) => {
  const { student_id, studentId, id, student_name, studentName, name, event_type, eventType, label, target, path, pagePath, details } = req.body || {};

  const cleanId = String(student_id ?? studentId ?? id ?? '').trim();
  const cleanName = String(student_name ?? studentName ?? name ?? 'Trainee').trim();
  const cleanType = String(event_type ?? eventType ?? 'button_click').trim();
  const cleanLabel = String(label ?? target ?? 'Interaksi Komponen').trim();
  const cleanPath = String(path ?? pagePath ?? '/').trim();

  if (!cleanId) {
    return res.status(400).json({ success: false, error: 'student_id wajib diisi.' });
  }

  // Telemetry tracker dihapus sesuai instruksi Bos Rakha
  return res.status(200).json({ success: true, message: 'Telemetry disabled.' });
});

module.exports = router;
