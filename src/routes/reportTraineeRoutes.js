const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET /api/report-trainee - Get all report_trainee entries
router.get('/', async (req, res) => {
  try {
    const { id, trainee_id, search, page = 1, limit = 100 } = req.query;

    let query = `SELECT * FROM report_trainee`;
    const conditions = [];
    const params = [];

    const targetId = id || trainee_id;
    if (targetId) {
      params.push(targetId);
      conditions.push(`(id = $${params.length} OR trainee_id = $${params.length})`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(id ILIKE $${params.length} OR trainee_id ILIKE $${params.length} OR report_title ILIKE $${params.length} OR link_yt ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY id ASC`;

    const countResult = await db.query(`SELECT COUNT(*) FROM report_trainee` + (conditions.length > 0 ? ` WHERE ` + conditions.join(' AND ') : ''), params);
    const totalItems = parseInt(countResult.rows[0].count, 10);

    if (req.query.all === 'true' || limit === '0') {
      const result = await db.query(query, params);
      return res.json({
        success: true,
        data: result.rows,
        total: totalItems
      });
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 100;
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
    console.error('[ReportTrainee] Fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data report_trainee',
      error: error.message
    });
  }
});

// GET /api/report-trainee/:id - Get specific report_trainee by ID or trainee_id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = String(id).trim();

    const result = await db.query(
      `SELECT * FROM report_trainee WHERE id = $1 OR trainee_id = $1`,
      [cleanId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data report_trainee dengan ID ${cleanId} tidak ditemukan`
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[ReportTrainee] Fetch single error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data report_trainee',
      error: error.message
    });
  }
});

// POST /api/report-trainee - Create or Update report_trainee
router.post('/', async (req, res) => {
  try {
    const { id, trainee_id, report_title, link_yt } = req.body;
    const targetId = String(id || trainee_id || '').trim();

    if (!targetId) {
      return res.status(400).json({
        success: false,
        message: 'ID / trainee_id wajib diisi'
      });
    }

    const result = await db.query(`
      INSERT INTO report_trainee (id, trainee_id, report_title, link_yt, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (id)
      DO UPDATE SET
        trainee_id = EXCLUDED.trainee_id,
        report_title = EXCLUDED.report_title,
        link_yt = EXCLUDED.link_yt,
        updated_at = NOW()
      RETURNING *
    `, [targetId, targetId, report_title || '▶️ Progress Video', link_yt || '']);

    res.json({
      success: true,
      message: 'Berhasil menyimpan data report_trainee',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[ReportTrainee] Create/Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan data report_trainee',
      error: error.message
    });
  }
});

// DELETE /api/report-trainee/:id - Delete report_trainee
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = String(id).trim();

    await db.query(`DELETE FROM report_trainee WHERE id = $1 OR trainee_id = $1`, [cleanId]);

    res.json({
      success: true,
      message: `Berhasil menghapus data report_trainee ${cleanId}`
    });
  } catch (error) {
    console.error('[ReportTrainee] Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data report_trainee',
      error: error.message
    });
  }
});

module.exports = router;
