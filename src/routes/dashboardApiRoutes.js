const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// Helper to fetch trainee and handle errors
async function getTraineeOrError(id, res) {
  try {
    const result = await db.query(
      `SELECT * FROM dashboard_trainne WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: `Trainee dengan ID ${id} tidak ditemukan.` });
      return null;
    }
    return result.rows[0];
  } catch (err) {
    console.error(`[Dashboard API Error] ID: ${id}:`, err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
    return null;
  }
}

// 1. GET /dashboard/profile/:id
router.get('/profile/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  res.json({
    success: true,
    data: {
      id_trainee: trainee.id,
      nama_trainee: trainee.trainee_name,
      program: trainee.program,
      class: trainee.class,
      level: trainee.level,
      membership_expiry: trainee.membership_expiry,
      phone: trainee.phone,
      tanggal_lahir: trainee.tanggal_lahir,
      profile_picture: trainee.profile_picture
    }
  });
});

// 2. GET /dashboard/progress/:id
router.get('/progress/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  res.json({
    success: true,
    data: {
      id_trainee: trainee.id,
      nama_trainee: trainee.trainee_name,
      progress_ke_next_level: trainee.progress_ke_next_level,
      progress_video: trainee.progress_video
    }
  });
});

// 3. GET /dashboard/highlights/:id
router.get('/highlights/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  res.json({
    success: true,
    data: {
      id_trainee: trainee.id,
      nama_trainee: trainee.trainee_name,
      highlight_terbaru: trainee.highlight_terbaru,
      pengumuman: trainee.pengumuman
    }
  });
});

// 4. GET /dashboard/reports/:id
router.get('/reports/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  res.json({
    success: true,
    data: {
      id_trainee: trainee.id,
      nama_trainee: trainee.trainee_name,
      weekly_report: trainee.weekly_report,
      quarterly_report: trainee.quarterly_report
    }
  });
});

// 5. GET /dashboard/rankings/:id
router.get('/rankings/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  res.json({
    success: true,
    data: {
      id_trainee: trainee.id,
      nama_trainee: trainee.trainee_name,
      gold_rank: trainee.gold_rank,
      referral_code: trainee.referral_code
    }
  });
});

// 6. GET /dashboard/speaking-projects/:id
router.get('/speaking-projects/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  res.json({
    success: true,
    data: {
      id_trainee: trainee.id,
      nama_trainee: trainee.trainee_name,
      last_speaking_project: trainee.last_speaking_project,
      completed_speaking_project: trainee.completed_speaking_project
    }
  });
});

// 7. GET /dashboard/reports/previous/:id
router.get('/reports/previous/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  res.json({
    success: true,
    data: {
      id_trainee: trainee.id,
      nama_trainee: trainee.trainee_name,
      laporan_sebelumnya: trainee.laporan_sebelumnya,
      laporan_quarter_sebelumnya: trainee.laporan_quarter_sebelumnya
    }
  });
});

// 8. GET /contact/:id (Can be accessed via /contact/:id or /dashboard/contact/:id)
router.get('/contact/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  res.json({
    success: true,
    data: {
      id_trainee: trainee.id,
      nama_trainee: trainee.trainee_name,
      hubungi_kami: trainee.hubungi_kami
    }
  });
});

module.exports = router;
