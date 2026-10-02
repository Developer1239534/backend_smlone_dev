const express = require('express');
const router = express.Router();
const {
  getStudentLevel6Reports,
  upsertStudentLevel6Reports
} = require('../controllers/studentLevel6Controller');

// GET /api/v1/students/:id/level6-reports
router.get('/:id/level6-reports', getStudentLevel6Reports);

// POST /api/v1/students/:id/level6-reports (Sinkronisasi n8n via HTTP)
router.post('/:id/level6-reports', upsertStudentLevel6Reports);

// POST /api/v1/students/level6-reports (Bulk sinkronisasi n8n jika student_id ada di body)
router.post('/level6-reports', upsertStudentLevel6Reports);

module.exports = router;
