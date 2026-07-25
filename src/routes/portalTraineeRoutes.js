const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// Intercept any POST request sent to /api/portal-trainee (regardless of subpath like /goldpoint-trainee, /g, /, etc.)
router.use(async (req, res, next) => {
  if (req.method === 'POST') {
  try {
    let itemsToProcess = [];
    if (Array.isArray(req.body)) {
      itemsToProcess = req.body;
    } else if (req.body && Array.isArray(req.body.daftar_siswa)) {
      itemsToProcess = req.body.daftar_siswa;
    } else if (req.body) {
      itemsToProcess = [req.body];
    }

    const updatedRecords = [];

    for (const item of itemsToProcess) {
      const id = String(item.id || item.trainee_id || '').trim();
      const name = String(item.nama_trainee || item.name || item.trainee_name || '').trim();
      const status = item.status || 'Active';
      const level = item.level || 'Sergeant';
      const house = item.house || item.house_sml || 'House of Thenova';
      const className = item.class || item.nama_kelas || 'Gladwell';
      const branch = item.branch || item.cabang || 'TIMOR';
      const totalGold = parseInt(item.total_gold || item.total_gold_periode || item.gp_month || '0') || 0;
      const kategori = item.kategori || item.junior_youth || 'Junior';
      const rank = parseInt(item.rank || '0') || 0;

      if (!id || !name || id === 'ID' || id === '2' || id === '5' || id === '6') continue;

      const queryText = `
        INSERT INTO goldpoint_trainee 
          (id, nama_trainee, status, level, house, class, branch, total_gold_periode, gp_month, kategori, rank, updated_at)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        ON CONFLICT (id) 
        DO UPDATE SET
          nama_trainee = EXCLUDED.nama_trainee,
          status = EXCLUDED.status,
          level = EXCLUDED.level,
          house = EXCLUDED.house,
          class = EXCLUDED.class,
          branch = EXCLUDED.branch,
          total_gold_periode = EXCLUDED.total_gold_periode,
          gp_month = EXCLUDED.gp_month,
          kategori = EXCLUDED.kategori,
          rank = EXCLUDED.rank,
          updated_at = NOW()
        RETURNING *;
      `;

      const result = await db.query(queryText, [id, name, status, level, house, className, branch, totalGold, totalGold, kategori, rank]);

      // Connect & Sync with portal_trainee table
      await db.query(`
        UPDATE portal_trainee 
        SET name = $2, house = $3, class = $4, branch_id = $5
        WHERE trainee_id = $1 OR id = $1
      `, [id, name, house, className, branch]).catch(() => null);

      updatedRecords.push(result.rows[0]);
    }

    return res.json({
      success: true,
      count: updatedRecords.length,
      data: updatedRecords
    });
  } catch (err) {
    console.error('Error upserting goldpoint_trainee:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
  }
  next();
});

// Enforce Read-Only access on remaining portal-trainee routes
router.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    return res.status(405).json({
      success: false,
      message: 'Akses Ditolak: API Portal Trainee hanya bersifat READ-ONLY (Hanya dapat dilihat).'
    });
  }
  next();
});

// GET /api/portal-trainee - Read-only: Get list of portal trainees
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

// GET /api/portal-trainee/stats/summary - Read-only summary statistics
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

// GET /api/portal-trainee/:id - Read-only: Get single trainee by trainee_id
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
