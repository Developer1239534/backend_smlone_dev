const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// Intercept any POST request sent to /api/portal-trainee
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

      for (let idx = 0; idx < itemsToProcess.length; idx++) {
        const item = itemsToProcess[idx];
        const id = String(item.id || item.trainee_id || '').trim();
        const name = String(item.nama_trainee || item.name || item.trainee_name || '').trim();
        const status = item.status || 'Active';
        const level = item.level || 'Sergeant';
        const house = item.house || item.house_sml || 'House of Thenova';
        const className = item.class || item.nama_kelas || 'Gladwell';
        const branch = item.branch || item.cabang || 'TIMOR';
        const totalGold = parseInt(item.total_gold || item.total_gold_periode || item.gp_month || '0') || 0;
        const kategori = item.kategori || item.junior_youth || 'Junior';
        let rank = parseInt(item.rank || '0') || (idx + 1);

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

      // Auto-fix any 0 or null ranks in database
      await db.query(`
        WITH ranked AS (
          SELECT id, ROW_NUMBER() OVER (
            PARTITION BY kategori, branch 
            ORDER BY total_gold_periode DESC, nama_trainee ASC
          ) AS calculated_rank
          FROM goldpoint_trainee
        )
        UPDATE goldpoint_trainee g
        SET rank = r.calculated_rank
        FROM ranked r
        WHERE g.id = r.id AND (g.rank IS NULL OR g.rank = 0);
      `).catch(() => null);

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

// Helper to ensure report URLs return pure null when missing or invalid
const sanitizeReportUrl = (val) => {
  if (!val) return null;
  const str = String(val).trim();
  if (str === '' || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined' || str === '-' || str === '{}' || str === '[]') {
    return null;
  }
  if (!str.startsWith('http')) return null;
  return str;
};

const sanitizeTraineeRecord = (row) => {
  if (!row) return row;
  return {
    ...row,
    screening_test_url: sanitizeReportUrl(row.screening_test_url),
    quarterly_report_url: sanitizeReportUrl(row.quarterly_report_url),
    weekly_report_url: sanitizeReportUrl(row.weekly_report_url),
    real_stage_report_url: sanitizeReportUrl(row.real_stage_report_url),
    progress_video_url: sanitizeReportUrl(row.progress_video_url)
  };
};

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
    const sanitizedData = result.rows.map(sanitizeTraineeRecord);

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
      data: sanitizedData,
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

// GET /api/portal-trainee/:id/link-report - Real-time assigned link_report data for specific trainee
router.get('/:id/link-report', async (req, res) => {
  const { id } = req.params;
  try {
    const linkReports = await db.query(
      `SELECT * FROM link_report WHERE trainee_id = $1 ORDER BY term DESC`,
      [id]
    );

    res.json({
      success: true,
      read_only: true,
      trainee_id: id,
      total_reports: linkReports.rows.length,
      data: linkReports.rows
    });
  } catch (error) {
    console.error('[PortalTrainee] Link report error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil link report trainee',
      error: error.message
    });
  }
});

// GET /api/portal-trainee/:id/report-activity - Real-time assigned report_activity data for specific trainee
router.get('/:id/report-activity', async (req, res) => {
  const { id } = req.params;
  try {
    const reportActivity = await db.query(
      `SELECT * FROM report_activity WHERE trainee_id = $1`,
      [id]
    );

    if (reportActivity.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report activity trainee tidak ditemukan'
      });
    }

    res.json({
      success: true,
      read_only: true,
      trainee_id: id,
      data: reportActivity.rows[0]
    });
  } catch (error) {
    console.error('[PortalTrainee] Report activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil report activity trainee',
      error: error.message
    });
  }
});

// GET /api/portal-trainee/:id/profile-trainee or /portal-admin - Real-time assigned profile_trainee data for specific trainee
const handleGetProfileTrainee = async (req, res) => {
  const { id } = req.params;
  try {
    const profileTraineeRes = await db.query(
      `SELECT * FROM profile_trainee WHERE trainee_id = $1`,
      [id]
    );

    if (profileTraineeRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data profile trainee tidak ditemukan'
      });
    }

    res.json({
      success: true,
      read_only: true,
      trainee_id: id,
      data: profileTraineeRes.rows[0]
    });
  } catch (error) {
    console.error('[PortalTrainee] Profile trainee error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data profile trainee',
      error: error.message
    });
  }
};

router.get('/:id/profile-trainee', handleGetProfileTrainee);
router.get('/:id/portal-admin', handleGetProfileTrainee);

// GET /api/portal-trainee/:id - Read-only: Get single trainee by trainee_id with real-time link_report, report_activity, and profile_trainee
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

    const sanitizedTrainee = sanitizeTraineeRecord(result.rows[0]);

    // Fetch real-time link_report entries
    const linkReportRes = await db.query(
      `SELECT * FROM link_report WHERE trainee_id = $1 ORDER BY term DESC`,
      [id]
    );

    // Fetch real-time report_activity entry
    const reportActivityRes = await db.query(
      `SELECT * FROM report_activity WHERE trainee_id = $1`,
      [id]
    );

    // Fetch real-time profile_trainee entry
    const profileTraineeRes = await db.query(
      `SELECT * FROM profile_trainee WHERE trainee_id = $1`,
      [id]
    );

    sanitizedTrainee.link_reports = linkReportRes.rows;
    sanitizedTrainee.report_activity = reportActivityRes.rows[0] || null;
    sanitizedTrainee.profile_trainee = profileTraineeRes.rows[0] || null;
    sanitizedTrainee.portal_admin = profileTraineeRes.rows[0] || null;

    res.json({
      success: true,
      read_only: true,
      data: sanitizedTrainee
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
