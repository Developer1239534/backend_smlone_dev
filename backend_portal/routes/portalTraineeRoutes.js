const express = require('express');
const router = express.Router();
const readOnlyMiddleware = require('../middleware/readOnlyMiddleware');
const db = require('../../src/db/neonClient');

// Enforce Read-Only Access
router.use(readOnlyMiddleware);

// GET / - Read-only list of portal trainees
router.get('/', async (req, res) => {
  try {
    const { search, branch_id, level, program, class: classFilter, page = 1, limit = 20 } = req.query;

    let query = `SELECT * FROM portal_trainee`;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR trainee_id ILIKE $${params.length})`);
    }

    if (branch_id) {
      params.push(branch_id);
      conditions.push(`branch_id ILIKE $${params.length}`);
    }

    if (level) {
      params.push(level);
      conditions.push(`level ILIKE $${params.length}`);
    }

    if (program) {
      params.push(program);
      conditions.push(`program ILIKE $${params.length}`);
    }

    if (classFilter) {
      params.push(classFilter);
      conditions.push(`class ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY trainee_id ASC`;

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const offset = (pageNum - 1) * limitNum;

    params.push(limitNum);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await db.query(query, params);

    // Total count query
    let countQuery = `SELECT COUNT(*) FROM portal_trainee`;
    if (conditions.length > 0) {
      countQuery += ` WHERE ` + conditions.join(' AND ');
    }
    const countResult = await db.query(countQuery, params.slice(0, conditions.length));
    const totalItems = parseInt(countResult.rows[0].count, 10);

    res.json({
      success: true,
      read_only: true,
      data: result.rows,
      pagination: {
        total: totalItems,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalItems / limitNum) || 1
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

// GET /stats/summary - Summary Statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalRes = await db.query(`SELECT COUNT(*) FROM portal_trainee`);
    const branchRes = await db.query(`SELECT branch_id, COUNT(*) as count FROM portal_trainee GROUP BY branch_id ORDER BY count DESC`);
    const programRes = await db.query(`SELECT program, COUNT(*) as count FROM portal_trainee GROUP BY program ORDER BY count DESC`);
    const levelRes = await db.query(`SELECT level, COUNT(*) as count FROM portal_trainee GROUP BY level ORDER BY count DESC`);

    res.json({
      success: true,
      read_only: true,
      stats: {
        total_trainees: parseInt(totalRes.rows[0].count, 10),
        by_branch: branchRes.rows,
        by_program: programRes.rows,
        by_level: levelRes.rows
      }
    });
  } catch (error) {
    console.error('[PortalTrainee] Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik portal trainee',
      error: error.message
    });
  }
});

// GET /:id - Single trainee detail by trainee_id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(`SELECT * FROM portal_trainee WHERE trainee_id = $1`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data trainee tidak ditemukan'
      });
    }

    res.json({
      success: true,
      read_only: true,
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
