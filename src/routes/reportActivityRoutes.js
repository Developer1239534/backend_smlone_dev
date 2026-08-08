const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET /api/report-activity - List report activity data with search, filtering & pagination
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      branch, 
      cleaned_program, 
      cleaned_class, 
      level, 
      all,
      page = 1, 
      limit = 50 
    } = req.query;

    let query = `SELECT * FROM report_activity`;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR trainee_id ILIKE $${params.length} OR cleaned_class ILIKE $${params.length})`);
    }

    if (branch) {
      params.push(branch);
      conditions.push(`branch ILIKE $${params.length}`);
    }

    if (cleaned_program) {
      params.push(cleaned_program);
      conditions.push(`cleaned_program ILIKE $${params.length}`);
    }

    if (cleaned_class) {
      params.push(cleaned_class);
      conditions.push(`cleaned_class ILIKE $${params.length}`);
    }

    if (level) {
      params.push(level);
      conditions.push(`level ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY trainee_id ASC`;

    let totalItems = 0;
    let countQuery = `SELECT COUNT(*) FROM report_activity`;
    if (conditions.length > 0) {
      countQuery += ` WHERE ` + conditions.join(' AND ');
    }
    const countResult = await db.query(countQuery, params);
    totalItems = parseInt(countResult.rows[0].count, 10);

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
    console.error('[ReportActivity] Fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data report activity',
      error: error.message
    });
  }
});

// GET /api/report-activity/stats/summary - Summary statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalRes = await db.query(`SELECT COUNT(*) FROM report_activity`);
    const branchRes = await db.query(`SELECT branch, COUNT(*) as count FROM report_activity GROUP BY branch ORDER BY count DESC`);
    const programRes = await db.query(`SELECT cleaned_program, COUNT(*) as count FROM report_activity GROUP BY cleaned_program ORDER BY count DESC`);
    const classRes = await db.query(`SELECT cleaned_class, COUNT(*) as count FROM report_activity GROUP BY cleaned_class ORDER BY count DESC`);
    const levelRes = await db.query(`SELECT level, COUNT(*) as count FROM report_activity GROUP BY level ORDER BY count DESC`);

    res.json({
      success: true,
      stats: {
        total_records: parseInt(totalRes.rows[0].count, 10),
        by_branch: branchRes.rows,
        by_program: programRes.rows,
        by_class: classRes.rows,
        by_level: levelRes.rows
      }
    });
  } catch (error) {
    console.error('[ReportActivity] Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik report activity',
      error: error.message
    });
  }
});

// GET /api/report-activity/:trainee_id - Get single record
router.get('/:trainee_id', async (req, res) => {
  const { trainee_id } = req.params;
  try {
    const result = await db.query(`SELECT * FROM report_activity WHERE trainee_id = $1`, [trainee_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data report activity tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[ReportActivity] Fetch single error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail report activity',
      error: error.message
    });
  }
});

// POST /api/report-activity - Create record
router.post('/', async (req, res) => {
  try {
    let {
      trainee_id, name, branch, cleaned_program, cleaned_class,
      level, speaking_project_to_next_level, life_project_to_next_level,
      last_speaking_project, level_up_sp, level_up_lp, raw_data
    } = req.body;

    if (!trainee_id || !name) {
      return res.status(400).json({
        success: false,
        message: 'Trainee ID dan Nama wajib diisi'
      });
    }

    if (cleaned_program) {
      cleaned_program = cleaned_program.replace(/Junior\/Youth Program/gi, 'Core/Society Program');
    }

    const payloadRawData = raw_data || {
      trainee_id, name, branch, cleaned_program, cleaned_class,
      level, speaking_project_to_next_level, life_project_to_next_level,
      last_speaking_project, level_up_sp, level_up_lp
    };

    const queryText = `
      INSERT INTO report_activity (
        trainee_id, name, branch, cleaned_program, cleaned_class,
        level, speaking_project_to_next_level, life_project_to_next_level,
        last_speaking_project, level_up_sp, level_up_lp, raw_data, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW()
      )
      ON CONFLICT (trainee_id) DO UPDATE SET
        name = EXCLUDED.name,
        branch = COALESCE(EXCLUDED.branch, report_activity.branch),
        cleaned_program = COALESCE(EXCLUDED.cleaned_program, report_activity.cleaned_program),
        cleaned_class = COALESCE(EXCLUDED.cleaned_class, report_activity.cleaned_class),
        level = COALESCE(EXCLUDED.level, report_activity.level),
        speaking_project_to_next_level = COALESCE(EXCLUDED.speaking_project_to_next_level, report_activity.speaking_project_to_next_level),
        life_project_to_next_level = COALESCE(EXCLUDED.life_project_to_next_level, report_activity.life_project_to_next_level),
        last_speaking_project = COALESCE(EXCLUDED.last_speaking_project, report_activity.last_speaking_project),
        level_up_sp = COALESCE(EXCLUDED.level_up_sp, report_activity.level_up_sp),
        level_up_lp = COALESCE(EXCLUDED.level_up_lp, report_activity.level_up_lp),
        raw_data = EXCLUDED.raw_data,
        updated_at = NOW()
      RETURNING *;
    `;

    const values = [
      trainee_id, name, branch || null, cleaned_program || null, cleaned_class || null,
      level || null, speaking_project_to_next_level || null, life_project_to_next_level || null,
      last_speaking_project || null, level_up_sp || null, level_up_lp || null, JSON.stringify(payloadRawData)
    ];

    const result = await db.query(queryText, values);

    res.status(201).json({
      success: true,
      message: 'Data report activity berhasil ditambahkan',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[ReportActivity] Create error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan data report activity',
      error: error.message
    });
  }
});

// PUT /api/report-activity/:trainee_id - Update record
router.put('/:trainee_id', async (req, res) => {
  const { trainee_id } = req.params;
  try {
    let {
      name, branch, cleaned_program, cleaned_class,
      level, speaking_project_to_next_level, life_project_to_next_level,
      last_speaking_project, level_up_sp, level_up_lp, raw_data
    } = req.body;

    if (cleaned_program) {
      cleaned_program = cleaned_program.replace(/Junior\/Youth Program/gi, 'Core/Society Program');
    }

    const currentRes = await db.query(`SELECT * FROM report_activity WHERE trainee_id = $1`, [trainee_id]);
    if (currentRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data report activity tidak ditemukan'
      });
    }

    const cur = currentRes.rows[0];
    const payloadRawData = raw_data || {
      trainee_id,
      name: name !== undefined ? name : cur.name,
      branch: branch !== undefined ? branch : cur.branch,
      cleaned_program: cleaned_program !== undefined ? cleaned_program : cur.cleaned_program,
      cleaned_class: cleaned_class !== undefined ? cleaned_class : cur.cleaned_class,
      level: level !== undefined ? level : cur.level,
      speaking_project_to_next_level: speaking_project_to_next_level !== undefined ? speaking_project_to_next_level : cur.speaking_project_to_next_level,
      life_project_to_next_level: life_project_to_next_level !== undefined ? life_project_to_next_level : cur.life_project_to_next_level,
      last_speaking_project: last_speaking_project !== undefined ? last_speaking_project : cur.last_speaking_project,
      level_up_sp: level_up_sp !== undefined ? level_up_sp : cur.level_up_sp,
      level_up_lp: level_up_lp !== undefined ? level_up_lp : cur.level_up_lp,
      created_at: cur.created_at
    };

    const queryText = `
      UPDATE report_activity SET
        name = COALESCE($1, name),
        branch = COALESCE($2, branch),
        cleaned_program = COALESCE($3, cleaned_program),
        cleaned_class = COALESCE($4, cleaned_class),
        level = COALESCE($5, level),
        speaking_project_to_next_level = COALESCE($6, speaking_project_to_next_level),
        life_project_to_next_level = COALESCE($7, life_project_to_next_level),
        last_speaking_project = COALESCE($8, last_speaking_project),
        level_up_sp = COALESCE($9, level_up_sp),
        level_up_lp = COALESCE($10, level_up_lp),
        raw_data = $11,
        updated_at = NOW()
      WHERE trainee_id = $12
      RETURNING *;
    `;

    const values = [
      name, branch, cleaned_program, cleaned_class,
      level, speaking_project_to_next_level, life_project_to_next_level,
      last_speaking_project, level_up_sp, level_up_lp,
      JSON.stringify(payloadRawData),
      trainee_id
    ];

    const result = await db.query(queryText, values);

    res.json({
      success: true,
      message: 'Data report activity berhasil diperbarui',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[ReportActivity] Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data report activity',
      error: error.message
    });
  }
});

// DELETE /api/report-activity/:trainee_id - Delete record
router.delete('/:trainee_id', async (req, res) => {
  const { trainee_id } = req.params;
  try {
    const result = await db.query(`DELETE FROM report_activity WHERE trainee_id = $1 RETURNING *`, [trainee_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data report activity tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Data report activity berhasil dihapus',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[ReportActivity] Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data report activity',
      error: error.message
    });
  }
});

module.exports = router;
