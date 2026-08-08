const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// --- LINK REPORT ADMIN CRUD ENDPOINTS ---

// GET /api/portal-admin/link-report - Admin view list of link_report
router.get('/link-report', async (req, res) => {
  try {
    const { search, term, status, page = 1, limit = 50, all } = req.query;

    let query = `SELECT * FROM link_report`;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(trainee_id ILIKE $${params.length} OR nama ILIKE $${params.length} OR term ILIKE $${params.length})`);
    }

    if (term) {
      params.push(term);
      conditions.push(`term = $${params.length}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`status ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY trainee_id ASC, term DESC`;

    const countRes = await db.query(`SELECT COUNT(*) FROM link_report` + (conditions.length > 0 ? ` WHERE ` + conditions.join(' AND ') : ''), params);
    const totalItems = parseInt(countRes.rows[0].count, 10);

    if (all === 'true' || all === '1' || limit === '0') {
      const result = await db.query(query, params);
      return res.json({ success: true, data: result.rows, total: totalItems });
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
    console.error('[PortalAdmin] LinkReport list error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/portal-admin/link-report - Admin create/upsert link_report
router.post('/link-report', async (req, res) => {
  try {
    const { trainee_id, term = 'May 2026 - Jun 2026', nama, status = 'Active', link_term, link_youtube, link_weekly, raw_data } = req.body;

    if (!trainee_id) {
      return res.status(400).json({ success: false, message: 'Trainee ID wajib diisi' });
    }

    const payloadRawData = raw_data || { trainee_id, term, nama, status, link_term, link_youtube, link_weekly };

    const result = await db.query(
      `INSERT INTO link_report (trainee_id, term, nama, status, link_term, link_youtube, link_weekly, raw_data, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
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
      message: 'Link report berhasil disimpan oleh Admin',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[PortalAdmin] LinkReport create error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/portal-admin/link-report/:trainee_id/:term - Admin update link_report
router.put('/link-report/:trainee_id/:term', async (req, res) => {
  try {
    const { trainee_id, term } = req.params;
    const { nama, status, link_term, link_youtube, link_weekly, raw_data } = req.body;

    const currentRes = await db.query(`SELECT * FROM link_report WHERE trainee_id = $1 AND term = $2`, [trainee_id, term]);
    if (currentRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data link report tidak ditemukan' });
    }

    const cur = currentRes.rows[0];
    const nNama = nama !== undefined ? nama : cur.nama;
    const nStatus = status !== undefined ? status : cur.status;
    const nLinkTerm = link_term !== undefined ? link_term : cur.link_term;
    const nLinkYoutube = link_youtube !== undefined ? link_youtube : cur.link_youtube;
    const nLinkWeekly = link_weekly !== undefined ? link_weekly : cur.link_weekly;

    const payloadRawData = raw_data || {
      trainee_id, term, nama: nNama, status: nStatus, link_term: nLinkTerm, link_youtube: nLinkYoutube, link_weekly: nLinkWeekly, created_at: cur.created_at
    };

    const result = await db.query(
      `UPDATE link_report
       SET nama = $1, status = $2, link_term = $3, link_youtube = $4, link_weekly = $5, raw_data = $6
       WHERE trainee_id = $7 AND term = $8
       RETURNING *`,
      [nNama, nStatus, nLinkTerm, nLinkYoutube, nLinkWeekly, JSON.stringify(payloadRawData), trainee_id, term]
    );

    res.json({
      success: true,
      message: 'Link report berhasil diperbarui oleh Admin',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[PortalAdmin] LinkReport update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/portal-admin/link-report/:trainee_id/:term - Admin delete link_report
router.delete('/link-report/:trainee_id/:term', async (req, res) => {
  try {
    const { trainee_id, term } = req.params;
    const result = await db.query(`DELETE FROM link_report WHERE trainee_id = $1 AND term = $2 RETURNING *`, [trainee_id, term]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data link report tidak ditemukan' });
    }

    res.json({
      success: true,
      message: 'Link report berhasil dihapus oleh Admin',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[PortalAdmin] LinkReport delete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- REPORT ACTIVITY ADMIN CRUD ENDPOINTS ---

// GET /api/portal-admin/report-activity - Admin view list of report_activity
router.get('/report-activity', async (req, res) => {
  try {
    const { search, branch, cleaned_class, cleaned_program, level, page = 1, limit = 50, all } = req.query;

    let query = `SELECT * FROM report_activity`;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(trainee_id ILIKE $${params.length} OR name ILIKE $${params.length} OR cleaned_class ILIKE $${params.length})`);
    }

    if (branch) {
      params.push(branch);
      conditions.push(`branch ILIKE $${params.length}`);
    }

    if (cleaned_class) {
      params.push(cleaned_class);
      conditions.push(`cleaned_class ILIKE $${params.length}`);
    }

    if (cleaned_program) {
      params.push(cleaned_program);
      conditions.push(`cleaned_program ILIKE $${params.length}`);
    }

    if (level) {
      params.push(level);
      conditions.push(`level ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY trainee_id ASC`;

    const countRes = await db.query(`SELECT COUNT(*) FROM report_activity` + (conditions.length > 0 ? ` WHERE ` + conditions.join(' AND ') : ''), params);
    const totalItems = parseInt(countRes.rows[0].count, 10);

    if (all === 'true' || all === '1' || limit === '0') {
      const result = await db.query(query, params);
      return res.json({ success: true, data: result.rows, total: totalItems });
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
    console.error('[PortalAdmin] ReportActivity list error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/portal-admin/report-activity - Admin create/upsert report_activity
router.post('/report-activity', async (req, res) => {
  try {
    let {
      trainee_id, name, branch, cleaned_program, cleaned_class,
      level, speaking_project_to_next_level, life_project_to_next_level,
      last_speaking_project, level_up_sp, level_up_lp, raw_data
    } = req.body;

    if (!trainee_id || !name) {
      return res.status(400).json({ success: false, message: 'Trainee ID dan Nama wajib diisi' });
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
      message: 'Data report activity berhasil disimpan oleh Admin',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[PortalAdmin] ReportActivity create error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/portal-admin/report-activity/:trainee_id - Admin update report_activity
router.put('/report-activity/:trainee_id', async (req, res) => {
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
      return res.status(404).json({ success: false, message: 'Data report activity tidak ditemukan' });
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
      message: 'Data report activity berhasil diperbarui oleh Admin',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[PortalAdmin] ReportActivity update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/portal-admin/report-activity/:trainee_id - Admin delete report_activity
router.delete('/report-activity/:trainee_id', async (req, res) => {
  const { trainee_id } = req.params;
  try {
    const result = await db.query(`DELETE FROM report_activity WHERE trainee_id = $1 RETURNING *`, [trainee_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data report activity tidak ditemukan' });
    }

    res.json({
      success: true,
      message: 'Data report activity berhasil dihapus oleh Admin',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[PortalAdmin] ReportActivity delete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- MAIN PORTAL ADMIN ENDPOINTS ---

// GET /api/portal-admin - List portal admin data with search, filtering & pagination
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      branch, 
      class_name, 
      house, 
      level, 
      membership_status, 
      trainer,
      all,
      page = 1, 
      limit = 50 
    } = req.query;

    let query = `SELECT * FROM profile_trainee`;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR trainee_id ILIKE $${params.length} OR class_name ILIKE $${params.length})`);
    }

    if (branch) {
      params.push(branch);
      conditions.push(`branch ILIKE $${params.length}`);
    }

    if (class_name) {
      params.push(class_name);
      conditions.push(`class_name ILIKE $${params.length}`);
    }

    if (house) {
      params.push(house);
      conditions.push(`house ILIKE $${params.length}`);
    }

    if (level) {
      params.push(level);
      conditions.push(`level ILIKE $${params.length}`);
    }

    if (membership_status) {
      params.push(membership_status);
      conditions.push(`membership_status ILIKE $${params.length}`);
    }

    if (trainer) {
      params.push(trainer);
      conditions.push(`trainer ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY trainee_id ASC`;

    let totalItems = 0;
    let countQuery = `SELECT COUNT(*) FROM profile_trainee`;
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
    console.error('[PortalAdmin] Fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data portal admin',
      error: error.message
    });
  }
});

// GET /api/portal-admin/stats/summary - Summary statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalRes = await db.query(`SELECT COUNT(*) FROM profile_trainee`);
    const branchRes = await db.query(`SELECT branch, COUNT(*) as count FROM profile_trainee GROUP BY branch ORDER BY count DESC`);
    const classRes = await db.query(`SELECT class_name, COUNT(*) as count FROM profile_trainee GROUP BY class_name ORDER BY count DESC`);
    const houseRes = await db.query(`SELECT house, COUNT(*) as count FROM profile_trainee GROUP BY house ORDER BY count DESC`);
    const statusRes = await db.query(`SELECT membership_status, COUNT(*) as count FROM profile_trainee GROUP BY membership_status ORDER BY count DESC`);

    res.json({
      success: true,
      stats: {
        total_records: parseInt(totalRes.rows[0].count, 10),
        by_branch: branchRes.rows,
        by_class: classRes.rows,
        by_house: houseRes.rows,
        by_status: statusRes.rows
      }
    });
  } catch (error) {
    console.error('[PortalAdmin] Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik portal admin',
      error: error.message
    });
  }
});

// GET /api/portal-admin/:trainee_id - Get single record by trainee_id
router.get('/:trainee_id', async (req, res) => {
  const { trainee_id } = req.params;
  try {
    const result = await db.query(`SELECT * FROM profile_trainee WHERE trainee_id = $1`, [trainee_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data portal admin tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[PortalAdmin] Fetch single error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail data portal admin',
      error: error.message
    });
  }
});

// POST /api/portal-admin - Create or insert a new record
router.post('/', async (req, res) => {
  try {
    const {
      class_name, day, time, room, branch, trainee_id, name, level,
      newest_grade, house, house_role, trainee_homeroom, homeroom_kelas,
      trainer, membership_status, membership_expired_date, first_enroll, raw_data
    } = req.body;

    const payloadRawData = raw_data || {
      class_name, day, time, room, branch, trainee_id, name, level,
      newest_grade, house, house_role, trainee_homeroom, homeroom_kelas,
      trainer, membership_status, membership_expired_date, first_enroll
    };

    const queryText = `
      INSERT INTO profile_trainee (
        class_name, day, time, room, branch, trainee_id, name, level,
        newest_grade, house, house_role, trainee_homeroom, homeroom_kelas,
        trainer, membership_status, membership_expired_date, first_enroll, raw_data, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW()
      ) RETURNING *;
    `;

    const values = [
      class_name || null, day || null, time || null, room || null, branch || null,
      trainee_id || null, name || null, level || null, newest_grade || null,
      house || null, house_role || null, trainee_homeroom || null, homeroom_kelas || null,
      trainer || null, membership_status || null, membership_expired_date || null, first_enroll || null,
      JSON.stringify(payloadRawData)
    ];

    const result = await db.query(queryText, values);

    res.status(201).json({
      success: true,
      message: 'Data portal admin berhasil ditambahkan',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[PortalAdmin] Create error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan data portal admin',
      error: error.message
    });
  }
});

// PUT /api/portal-admin/:trainee_id - Update existing record by trainee_id
router.put('/:trainee_id', async (req, res) => {
  const { trainee_id } = req.params;
  try {
    const {
      class_name, day, time, room, branch, name, level,
      newest_grade, house, house_role, trainee_homeroom, homeroom_kelas,
      trainer, membership_status, membership_expired_date, first_enroll, raw_data
    } = req.body;

    const payloadRawData = raw_data || {
      class_name, day, time, room, branch, trainee_id, name, level,
      newest_grade, house, house_role, trainee_homeroom, homeroom_kelas,
      trainer, membership_status, membership_expired_date, first_enroll
    };

    const queryText = `
      UPDATE profile_trainee SET
        class_name = COALESCE($1, class_name),
        day = COALESCE($2, day),
        time = COALESCE($3, time),
        room = COALESCE($4, room),
        branch = COALESCE($5, branch),
        name = COALESCE($6, name),
        level = COALESCE($7, level),
        newest_grade = COALESCE($8, newest_grade),
        house = COALESCE($9, house),
        house_role = COALESCE($10, house_role),
        trainee_homeroom = COALESCE($11, trainee_homeroom),
        homeroom_kelas = COALESCE($12, homeroom_kelas),
        trainer = COALESCE($13, trainer),
        membership_status = COALESCE($14, membership_status),
        membership_expired_date = COALESCE($15, membership_expired_date),
        first_enroll = COALESCE($16, first_enroll),
        raw_data = $17,
        updated_at = NOW()
      WHERE trainee_id = $18
      RETURNING *;
    `;

    const values = [
      class_name, day, time, room, branch, name, level,
      newest_grade, house, house_role, trainee_homeroom, homeroom_kelas,
      trainer, membership_status, membership_expired_date, first_enroll,
      JSON.stringify(payloadRawData),
      trainee_id
    ];

    const result = await db.query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data portal admin tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Data portal admin berhasil diperbarui',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[PortalAdmin] Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data portal admin',
      error: error.message
    });
  }
});

// DELETE /api/portal-admin/:trainee_id - Delete record by trainee_id
router.delete('/:trainee_id', async (req, res) => {
  const { trainee_id } = req.params;
  try {
    const result = await db.query(`DELETE FROM profile_trainee WHERE trainee_id = $1 RETURNING *`, [trainee_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data portal admin tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Data portal admin berhasil dihapus',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[PortalAdmin] Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data portal admin',
      error: error.message
    });
  }
});

module.exports = router;
