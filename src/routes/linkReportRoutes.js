const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET /api/link-report - List link report data with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { trainee_id, term, search, page = 1, limit = 50, all } = req.query;
    
    let query = `SELECT * FROM link_report`;
    const conditions = [];
    const params = [];

    if (trainee_id) {
      params.push(trainee_id);
      conditions.push(`trainee_id = $${params.length}`);
    }

    if (term) {
      params.push(term);
      conditions.push(`term = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(trainee_id ILIKE $${params.length} OR nama ILIKE $${params.length} OR term ILIKE $${params.length} OR status ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY trainee_id ASC, term DESC`;

    // Count query
    let countQuery = `SELECT COUNT(*) FROM link_report`;
    if (conditions.length > 0) {
      countQuery += ` WHERE ` + conditions.join(' AND ');
    }
    const countResult = await db.query(countQuery, params);
    const totalItems = parseInt(countResult.rows[0].count, 10);

    if (all === 'true' || all === '1' || limit === '0') {
      const result = await db.query(query, params);
      return res.json({
        success: true,
        data: result.rows,
        total: totalItems
      });
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const offset = (pageNum - 1) * limitNum;

    params.push(limitNum);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: totalItems,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalItems / limitNum) || 1
      }
    });
  } catch (error) {
    console.error('[LinkReport] Fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data link report',
      error: error.message
    });
  }
});

// GET /api/link-report/trainee/:trainee_id - Get real-time link report data for specific trainee
router.get('/trainee/:trainee_id', async (req, res) => {
  try {
    const { trainee_id } = req.params;
    const result = await db.query(
      `SELECT * FROM link_report WHERE trainee_id = $1 ORDER BY term DESC`,
      [trainee_id]
    );

    res.json({
      success: true,
      trainee_id,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('[LinkReport] Trainee fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil link report trainee',
      error: error.message
    });
  }
});

// GET /api/link-report/:trainee_id/:term - Get single link report
router.get('/:trainee_id/:term', async (req, res) => {
  try {
    const { trainee_id, term } = req.params;
    const result = await db.query(
      `SELECT * FROM link_report WHERE trainee_id = $1 AND term = $2`,
      [trainee_id, term]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data link report tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[LinkReport] Get single error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail link report',
      error: error.message
    });
  }
});

// POST /api/link-report - Create/insert new link report (Admin / Service)
router.post('/', async (req, res) => {
  try {
    const {
      trainee_id,
      term = 'May 2026 - Jun 2026',
      nama,
      status = 'Active',
      link_term,
      link_youtube,
      link_weekly,
      raw_data
    } = req.body;

    if (!trainee_id) {
      return res.status(400).json({
        success: false,
        message: 'Trainee ID wajib diisi'
      });
    }

    const payloadRawData = raw_data || {
      trainee_id,
      term,
      nama,
      status,
      link_term,
      link_youtube,
      link_weekly
    };

    const result = await db.query(
      `INSERT INTO link_report 
        (trainee_id, term, nama, status, link_term, link_youtube, link_weekly, raw_data, created_at) 
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) 
       ON CONFLICT (trainee_id, term) 
       DO UPDATE SET 
        nama = COALESCE(EXCLUDED.nama, link_report.nama),
        status = COALESCE(EXCLUDED.status, link_report.status),
        link_term = COALESCE(EXCLUDED.link_term, link_report.link_term),
        link_youtube = COALESCE(EXCLUDED.link_youtube, link_report.link_youtube),
        link_weekly = COALESCE(EXCLUDED.link_weekly, link_report.link_weekly),
        raw_data = EXCLUDED.raw_data
       RETURNING *`,
      [trainee_id, term, nama || null, status || null, link_term || null, link_youtube || null, link_weekly || null, JSON.stringify(payloadRawData)]
    );

    res.status(201).json({
      success: true,
      message: 'Link report berhasil disimpan',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[LinkReport] Create error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan link report',
      error: error.message
    });
  }
});

// PUT /api/link-report/:trainee_id/:term - Update link report
router.put('/:trainee_id/:term', async (req, res) => {
  try {
    const { trainee_id, term } = req.params;
    const { nama, status, link_term, link_youtube, link_weekly, raw_data } = req.body;

    const existingRes = await db.query(
      `SELECT * FROM link_report WHERE trainee_id = $1 AND term = $2`,
      [trainee_id, term]
    );

    if (existingRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data link report tidak ditemukan'
      });
    }

    const current = existingRes.rows[0];
    const newNama = nama !== undefined ? nama : current.nama;
    const newStatus = status !== undefined ? status : current.status;
    const newLinkTerm = link_term !== undefined ? link_term : current.link_term;
    const newLinkYoutube = link_youtube !== undefined ? link_youtube : current.link_youtube;
    const newLinkWeekly = link_weekly !== undefined ? link_weekly : current.link_weekly;

    const payloadRawData = raw_data || {
      trainee_id,
      term,
      nama: newNama,
      status: newStatus,
      link_term: newLinkTerm,
      link_youtube: newLinkYoutube,
      link_weekly: newLinkWeekly,
      created_at: current.created_at
    };

    const result = await db.query(
      `UPDATE link_report 
       SET nama = $1, status = $2, link_term = $3, link_youtube = $4, link_weekly = $5, raw_data = $6 
       WHERE trainee_id = $7 AND term = $8 
       RETURNING *`,
      [newNama, newStatus, newLinkTerm, newLinkYoutube, newLinkWeekly, JSON.stringify(payloadRawData), trainee_id, term]
    );

    res.json({
      success: true,
      message: 'Link report berhasil diperbarui',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[LinkReport] Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui link report',
      error: error.message
    });
  }
});

// DELETE /api/link-report/:trainee_id/:term - Delete single link report record
router.delete('/:trainee_id/:term', async (req, res) => {
  try {
    const { trainee_id, term } = req.params;

    const result = await db.query(
      `DELETE FROM link_report WHERE trainee_id = $1 AND term = $2 RETURNING *`,
      [trainee_id, term]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data link report tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Link report berhasil dihapus',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[LinkReport] Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus link report',
      error: error.message
    });
  }
});

// DELETE /api/link-report/:trainee_id - Delete all reports for a trainee_id
router.delete('/:trainee_id', async (req, res) => {
  try {
    const { trainee_id } = req.params;

    const result = await db.query(
      `DELETE FROM link_report WHERE trainee_id = $1 RETURNING *`,
      [trainee_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data link report tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: `Semua link report untuk trainee_id ${trainee_id} berhasil dihapus`,
      deletedCount: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('[LinkReport] Delete all trainee reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus link report',
      error: error.message
    });
  }
});

module.exports = router;
