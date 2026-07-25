const express = require('express');
const router = express.Router();
const db = require('../src/db/neonClient');

// GET /api/portal-trainee - Read-only: Get list of portal trainees (supports search, branch, level, program, pagination)
router.get('/', async (req, res) => {
  try {
    const { search, branch, level, program, page = 1, limit = 20 } = req.query;

    let query = `SELECT * FROM portal_trainee`;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(full_name ILIKE $${params.length} OR trainee_id ILIKE $${params.length} OR student_id ILIKE $${params.length})`);
    }

    if (branch) {
      params.push(branch);
      conditions.push(`branch ILIKE $${params.length}`);
    }

    if (level) {
      params.push(level);
      conditions.push(`level ILIKE $${params.length}`);
    }

    if (program) {
      params.push(program);
      conditions.push(`program ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY id ASC`;

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const offset = (pageNum - 1) * limitNum;

    params.push(limitNum);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await db.query(query, params);

    // Get total count for pagination metadata
    let countQuery = `SELECT COUNT(*) FROM portal_trainee`;
    if (conditions.length > 0) {
      countQuery += ` WHERE ` + conditions.join(' AND ');
    }
    const countResult = await db.query(countQuery, params.slice(0, conditions.length));
    const totalItems = parseInt(countResult.rows[0].count, 10);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: totalItems,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalItems / limitNum)
      }
    });
  } catch (error) {
    console.error('[PortalTrainee] Fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data portal trainee',
      error: error.message
    });
  }
});

// GET /api/portal-trainee/:id - Read-only: Get single trainee by ID, trainee_id, or student_id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const isNumeric = /^\d+$/.test(id);
    const query = isNumeric
      ? `SELECT * FROM portal_trainee WHERE id = $1 OR trainee_id = $2 OR student_id = $2`
      : `SELECT * FROM portal_trainee WHERE trainee_id = $1 OR student_id = $1`;

    const params = isNumeric ? [parseInt(id, 10), id] : [id];
    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data trainee tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[PortalTrainee] Fetch single error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil rincian data portal trainee',
      error: error.message
    });
  }
});

module.exports = router;
