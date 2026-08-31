const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET /api/dashboard-trainee - Get all trainees with optional search and filters
router.get('/', async (req, res) => {
  const { search, junior_youth, cabang, class: classFilter } = req.query;
  try {
    let query = `
      SELECT dt.*, 
             dt.name AS trainee_name,
             dt.cabang_id AS cabang,
             dt.cleaned_program AS junior_youth
      FROM data_dashboard_keseluruhan dt
    `;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(dt.name ILIKE $${params.length} OR CAST(dt.id AS TEXT) ILIKE $${params.length})`);
    }

    if (junior_youth) {
      params.push(`%${junior_youth}%`);
      conditions.push(`(dt.cleaned_program ILIKE $${params.length} OR dt.class ILIKE $${params.length})`);
    }

    if (cabang) {
      params.push(cabang);
      conditions.push(`dt.cabang_id ILIKE $${params.length}`);
    }

    if (classFilter) {
      params.push(classFilter);
      conditions.push(`dt.class ILIKE $${params.length}`);
    }

    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : null;

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY dt.id ASC';

    if (limit !== null) {
      params.push(limit);
      query += ` LIMIT $${params.length}`;
    }

    if (offset !== null) {
      params.push(offset);
      query += ` OFFSET $${params.length}`;
    }

    const result = await db.query(query, params);
    const sanitizedRows = result.rows.map(row => {
      delete row.password;
      delete row.plain_password;
      if (typeof row.class === 'string') {
        row.class = row.class.replace(/\s*\([^)]*\)/g, '').trim();
      }
      return {
        ...row,
        trainee_name: row.name || row.trainee_name || '',
        cabang: row.cabang_id || row.cabang || '',
        junior_youth: row.cleaned_program || row.junior_youth || '',
        total_gold_periode: '0'
      };
    });

    res.json({
      success: true,
      count: sanitizedRows.length,
      data: sanitizedRows
    });
  } catch (err) {
    console.error('[Dashboard] Fetch all error:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching all trainees.', error: err.message });
  }
});

// GET /api/dashboard-trainee/house-rank - Get all house rankings
router.get('/house-rank', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM house_rank ORDER BY id ASC').catch(() => ({ rows: [] }));
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error('[Dashboard] Fetch house rank error:', err.message);
    res.json({ success: true, count: 0, data: [] });
  }
});

// GET /api/dashboard-trainee/:id/gp-tahunan - Get annual gold point history for a trainee
router.get('/:id/gp-tahunan', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM gp_tahunan WHERE trainee_id = $1 ORDER BY id ASC',
      [id]
    ).catch(() => ({ rows: [] }));
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error('[Dashboard] Fetch gp_tahunan error:', err.message);
    res.json({ success: true, count: 0, data: [] });
  }
});

// GET /api/dashboard-trainee/:id - Get a specific trainee by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const isNumeric = /^\d+$/.test(id);
    const query = isNumeric 
      ? `SELECT dt.*, dt.name AS trainee_name, dt.cabang_id AS cabang FROM data_dashboard_keseluruhan dt WHERE dt.id = $1`
      : `SELECT dt.*, dt.name AS trainee_name, dt.cabang_id AS cabang FROM data_dashboard_keseluruhan dt WHERE CAST(dt.id AS TEXT) = $1`;
    
    const result = await db.query(query, [isNumeric ? parseInt(id, 10) : id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trainee not found.' });
    }
    const trainee = result.rows[0];
    delete trainee.password;
    delete trainee.plain_password;
    if (typeof trainee.class === 'string') {
      trainee.class = trainee.class.replace(/\s*\([^)]*\)/g, '').trim();
    }
    trainee.trainee_name = trainee.name || trainee.trainee_name || '';
    trainee.cabang = trainee.cabang_id || trainee.cabang || '';
    trainee.junior_youth = trainee.cleaned_program || trainee.junior_youth || '';

    const sanitizeUrl = (val) => {
      if (!val) return null;
      const str = String(val).trim();
      if (str === '' || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined' || str === '-' || str === '{}' || str === '[]') return null;
      if (!str.startsWith('http')) return null;
      return str;
    };

    // Fetch real stage reports if available
    const rsRes = await db.query(
      'SELECT "No. Voucher" as no_voucher, "Link Voucher Real Stage" as url FROM real_stage WHERE "ID Trainee" = $1',
      [id]
    ).catch(() => ({ rows: [] }));

    const sortedRS = rsRes.rows;

    const latestRsUrl = sortedRS[0]?.url ? sanitizeUrl(sortedRS[0].url) : null;
    const screeningTestUrl = sanitizeUrl(trainee.screening_test || trainee.screening_test_url);

    trainee.screening_test = screeningTestUrl;
    trainee.screening_test_url = screeningTestUrl;
    trainee.screeningTest = screeningTestUrl;
    trainee.real_stage = latestRsUrl;
    trainee.real_stages = sortedRS;
    trainee.realStage = latestRsUrl;
    trainee.realStages = sortedRS;
    trainee.real_stage_report = latestRsUrl;
    trainee.realStageReport = latestRsUrl;

    res.json({
      success: true,
      data: trainee
    });
  } catch (err) {
    console.error('[Dashboard] Fetch single error:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching trainee details.', error: err.message });
  }
});

module.exports = router;


