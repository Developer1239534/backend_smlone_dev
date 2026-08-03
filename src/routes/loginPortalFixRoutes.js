const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// Helper to format trainee row
function formatTrainee(row) {
  if (!row) return null;
  const cleanStr = (v) => (v === null || v === undefined || v === 'null' ? '' : String(v).trim());
  const formatDate = (v) => {
    if (!v) return '';
    if (v instanceof Date) return v.toISOString().split('T')[0];
    return cleanStr(v);
  };

  return {
    ...row,
    id: cleanStr(row.id),
    name: cleanStr(row.name),
    password: cleanStr(row.password),
    gender: cleanStr(row.gender),
    date_of_birth: formatDate(row.date_of_birth),
    nama_sekolah: cleanStr(row.nama_sekolah),
    cleaned_program: cleanStr(row.cleaned_program),
    membership: cleanStr(row.membership),
    expiry_date: formatDate(row.expiry_date),
    cabang_id: cleanStr(row.cabang_id),
    first_enroll: formatDate(row.first_enroll),
    class: cleanStr(row.class),
    house: cleanStr(row.house),
    level: cleanStr(row.level),
    house_role: cleanStr(row.house_role),
    cabang_kelas: cleanStr(row.cabang_kelas),
    newest_grade: cleanStr(row.newest_grade),
    trainee_homeroom: cleanStr(row.trainee_homeroom),
    screening_test: cleanStr(row.screening_test),
    draft_grade: cleanStr(row.draft_grade),
    prev_grade: cleanStr(row.prev_grade),
    ajy_by_class: cleanStr(row.ajy_by_class),
    last_real_stage: cleanStr(row.last_real_stage)
  };
}

// 1. GET /api/login-portal-fix - List, filter, search & pagination
router.get('/', async (req, res) => {
  try {
    const { search, cabang_id, class: classParam, house, level, all, page = 1, limit = 50 } = req.query;

    let query = `SELECT * FROM login_portal_fix`;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR id ILIKE $${params.length} OR nama_sekolah ILIKE $${params.length} OR class ILIKE $${params.length})`);
    }

    if (cabang_id) {
      params.push(cabang_id);
      conditions.push(`cabang_id ILIKE $${params.length}`);
    }

    if (classParam) {
      params.push(classParam);
      conditions.push(`class ILIKE $${params.length}`);
    }

    if (house) {
      params.push(house);
      conditions.push(`house ILIKE $${params.length}`);
    }

    if (level) {
      params.push(level);
      conditions.push(`level ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY id ASC`;

    if (all === 'true' || all === '1' || limit === '0') {
      const result = await db.query(query, params);
      return res.json({
        success: true,
        data: result.rows.map(formatTrainee),
        total: result.rows.length
      });
    }

    // Count
    let countQuery = `SELECT COUNT(*) FROM login_portal_fix`;
    if (conditions.length > 0) {
      countQuery += ` WHERE ` + conditions.join(' AND ');
    }
    const countRes = await db.query(countQuery, params);
    const totalItems = parseInt(countRes.rows[0].count, 10);

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
      data: result.rows.map(formatTrainee),
      pagination: {
        total: totalItems,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalItems / limitNum) || 1
      }
    });
  } catch (error) {
    console.error('[LoginPortalFix] Fetch list error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data login_portal_fix',
      error: error.message
    });
  }
});

// 2. POST /api/login-portal-fix/login - Login authentication
router.post('/login', async (req, res) => {
  try {
    const { id, student_id, password } = req.body;
    const cleanId = String(id || student_id || '').trim();

    if (!cleanId || !password) {
      return res.status(400).json({
        success: false,
        message: 'ID / Student ID dan Password wajib diisi'
      });
    }

    const result = await db.query(`SELECT * FROM login_portal_fix WHERE LOWER(id) = LOWER($1)`, [cleanId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ID Trainee tidak terdaftar'
      });
    }

    const trainee = result.rows[0];
    const cleanPassword = String(password).trim();
    const expectedDefault = `SML${cleanId}`;

    if (cleanPassword !== trainee.password && cleanPassword !== expectedDefault) {
      return res.status(401).json({
        success: false,
        message: 'Password salah'
      });
    }

    res.json({
      success: true,
      message: 'Login berhasil!',
      data: formatTrainee(trainee)
    });
  } catch (error) {
    console.error('[LoginPortalFix] Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal melakukan login',
      error: error.message
    });
  }
});

// 3. GET /api/login-portal-fix/:id - Get single trainee profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = String(id || '').trim();

    const result = await db.query(`SELECT * FROM login_portal_fix WHERE LOWER(id) = LOWER($1)`, [cleanId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data trainee tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: formatTrainee(result.rows[0])
    });
  } catch (error) {
    console.error('[LoginPortalFix] Fetch single error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data trainee',
      error: error.message
    });
  }
});

// 4. POST /api/login-portal-fix - Create / Upsert new trainee
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const cleanId = String(body.id || body.ID || '').trim();
    const name = String(body.name || body.Name || '').trim();

    if (!cleanId || !name) {
      return res.status(400).json({
        success: false,
        message: 'ID dan Name wajib diisi'
      });
    }

    // Auto-generate password: SML + ID if not provided
    const password = body.password ? String(body.password).trim() : `SML${cleanId}`;

    // Replace Junior/Youth Program -> Core/Orator Society
    let cleaned_program = String(body.cleaned_program || body['Cleaned Program'] || '').trim();
    if (cleaned_program === 'Junior/Youth Program') {
      cleaned_program = 'Core/Orator Society';
    }

    const query = `
      INSERT INTO login_portal_fix (
        id, name, password, gender, date_of_birth, nama_sekolah, cleaned_program,
        membership, expiry_date, cabang_id, first_enroll, class, house, level,
        house_role, cabang_kelas, newest_grade, trainee_homeroom, screening_test,
        draft_grade, prev_grade, ajy_by_class, last_real_stage, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        password = EXCLUDED.password,
        gender = EXCLUDED.gender,
        date_of_birth = EXCLUDED.date_of_birth,
        nama_sekolah = EXCLUDED.nama_sekolah,
        cleaned_program = EXCLUDED.cleaned_program,
        membership = EXCLUDED.membership,
        expiry_date = EXCLUDED.expiry_date,
        cabang_id = EXCLUDED.cabang_id,
        first_enroll = EXCLUDED.first_enroll,
        class = EXCLUDED.class,
        house = EXCLUDED.house,
        level = EXCLUDED.level,
        house_role = EXCLUDED.house_role,
        cabang_kelas = EXCLUDED.cabang_kelas,
        newest_grade = EXCLUDED.newest_grade,
        trainee_homeroom = EXCLUDED.trainee_homeroom,
        screening_test = EXCLUDED.screening_test,
        draft_grade = EXCLUDED.draft_grade,
        prev_grade = EXCLUDED.prev_grade,
        ajy_by_class = EXCLUDED.ajy_by_class,
        last_real_stage = EXCLUDED.last_real_stage,
        updated_at = NOW()
      RETURNING *;
    `;

    const values = [
      cleanId,
      name,
      password,
      body.gender || body.Gender || null,
      body.date_of_birth || body['Date of Birth'] || null,
      body.nama_sekolah || body['Nama Sekolah'] || null,
      cleaned_program,
      body.membership || body.MEMBERSHIP || null,
      body.expiry_date || body['EXPIRY DATE'] || null,
      body.cabang_id || body['CABANG ID'] || null,
      body.first_enroll || body['FIRST ENROLL'] || null,
      body.class || body.CLASS || null,
      body.house || body.HOUSE || null,
      body.level || body.Level || null,
      body.house_role || body['House Role'] || null,
      body.cabang_kelas || body['CABANG KELAS'] || null,
      body.newest_grade || body['NEWEST GRADE'] || null,
      body.trainee_homeroom || body['Trainee Homeroom'] || null,
      body.screening_test || body['Screening Test'] || null,
      body.draft_grade || body['Draft Grade'] || null,
      body.prev_grade || body['Prev Grade'] || null,
      body.ajy_by_class || body['A/J/Y by Class'] || null,
      body.last_real_stage || body['Last Real Stage'] || null
    ];

    const result = await db.query(query, values);
    res.json({
      success: true,
      message: 'Data trainee berhasil disimpan',
      data: formatTrainee(result.rows[0])
    });
  } catch (error) {
    console.error('[LoginPortalFix] Save error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan data trainee',
      error: error.message
    });
  }
});

// 5. DELETE /api/login-portal-fix/:id - Delete trainee record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = String(id || '').trim();

    await db.query(`DELETE FROM login_portal_fix WHERE LOWER(id) = LOWER($1)`, [cleanId]);
    res.json({
      success: true,
      message: `Trainee ${cleanId} berhasil dihapus`
    });
  } catch (error) {
    console.error('[LoginPortalFix] Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data trainee',
      error: error.message
    });
  }
});

module.exports = router;
