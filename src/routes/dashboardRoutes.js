const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET /api/dashboard-trainee - Get all trainees
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT dt.*, 
              COALESCE(gp.total_gold_periode, '0') AS total_gold_periode,
              gp.rank_id_junior,
              gp.rank_id_youth,
              gp.rank_id_junior_timor,
              gp.rank_id_youth_timor,
              gp.rank_id_junior_tritura,
              gp.rank_id_youth_tritura,
              gp.rank_id_junior_cemara,
              gp.rank_id_youth_cemara
       FROM dashboard_trainne dt
       LEFT JOIN gp_month gp ON dt.id = gp.trainee_id
       ORDER BY dt.id ASC`
    );
    const sanitizedRows = result.rows.map(row => {
      delete row.password;
      delete row.plain_password;
      if (typeof row.class === 'string') {
        row.class = row.class.replace(/\s*\(Sat\s*4-6\)/gi, '').trim();
      }
      return row;
    });
    res.json({
      success: true,
      count: sanitizedRows.length,
      data: sanitizedRows
    });
  } catch (err) {
    console.error('[Dashboard] Fetch all error:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching all trainees.' });
  }
});

// GET /api/dashboard-trainee/house-rank - Get all house rankings
router.get('/house-rank', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM house_rank ORDER BY id ASC');
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error('[Dashboard] Fetch house rank error:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching house ranks.' });
  }
});

// GET /api/dashboard-trainee/:id/gp-tahunan - Get annual gold point history for a trainee
router.get('/:id/gp-tahunan', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM gp_tahunan WHERE trainee_id = $1 ORDER BY id ASC',
      [id]
    );
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error('[Dashboard] Fetch gp_tahunan error:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching annual gold points.' });
  }
});

// GET /api/dashboard-trainee/:id - Get a specific trainee by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT dt.*, 
              COALESCE(gp.total_gold_periode, '0') AS total_gold_periode,
              gp.rank_id_junior,
              gp.rank_id_youth,
              gp.rank_id_junior_timor,
              gp.rank_id_youth_timor,
              gp.rank_id_junior_tritura,
              gp.rank_id_youth_tritura,
              gp.rank_id_junior_cemara,
              gp.rank_id_youth_cemara
       FROM dashboard_trainne dt
       LEFT JOIN gp_month gp ON dt.id = gp.trainee_id
       WHERE dt.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trainee not found.' });
    }
    const trainee = result.rows[0];
    delete trainee.password;
    delete trainee.plain_password;
    if (typeof trainee.class === 'string') {
      trainee.class = trainee.class.replace(/\s*\(Sat\s*4-6\)/gi, '').trim();
    }

    // Fetch real stage reports
    const rsRes = await db.query(
      'SELECT periode, url FROM real_stage WHERE trainee_id = $1',
      [id]
    );

    const parseRealStagePeriod = (periodStr) => {
      if (!periodStr) return 0;
      const match = periodStr.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    };
    const sortedRS = rsRes.rows.sort((a, b) => parseRealStagePeriod(b.periode) - parseRealStagePeriod(a.periode));

    trainee.real_stage = sortedRS[0]?.url || null;
    trainee.real_stages = sortedRS;
    trainee.realStage = sortedRS[0]?.url || null;
    trainee.realStages = sortedRS;
    trainee.real_stage_report = sortedRS[0]?.url || null;
    trainee.realStageReport = sortedRS[0]?.url || null;
    trainee.screeningTest = trainee.screening_test;

    res.json({
      success: true,
      data: trainee
    });
  } catch (err) {
    console.error('[Dashboard] Fetch single error:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching trainee details.' });
  }
});

module.exports = router;
