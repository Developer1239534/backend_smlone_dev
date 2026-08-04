const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// Helper to format trainee row matching exact JSON format requested
function formatTrainee(row) {
  if (!row) return null;
  const cleanStr = (v) => (v === null || v === undefined || v === 'null' ? null : String(v).trim() || null);
  const formatDate = (v) => {
    if (!v) return null;
    if (v instanceof Date) return v.toISOString().split('T')[0];
    const str = String(v).trim();
    return str.length >= 5 ? str : null;
  };
  const parseNum = (v) => {
    if (v === null || v === undefined || v === '') return null;
    const num = parseInt(v, 10);
    return isNaN(num) ? v : num;
  };

  const cleanIdStr = String(row.id || '').trim();
  const numericId = parseInt(cleanIdStr, 10);

  // If level is a numeric string matching newest_grade/draft_grade, it belongs to grade, not level.
  let levelVal = cleanStr(row.level);
  let houseRoleVal = cleanStr(row.house_role);

  if (levelVal && /^\d+$/.test(levelVal) && houseRoleVal) {
    // In spreadsheet column 13 (Level), role string like 'General' / 'Sergeant' was entered.
    levelVal = houseRoleVal;
    houseRoleVal = null;
  }

  const numericGrade = parseNum(row.newest_grade) || parseNum(row.draft_grade);

  return {
    // Requested exact format fields
    id: isNaN(numericId) ? cleanIdStr : numericId,
    name: cleanStr(row.name),
    gender: cleanStr(row.gender),
    date_of_birth: formatDate(row.date_of_birth),
    school_name: cleanStr(row.nama_sekolah) || cleanStr(row.school_name) || "-",
    email: cleanStr(row.email) || "-",
    wa_trainee: cleanStr(row.wa_trainee) || "-",
    wa_orang_tua: cleanStr(row.wa_orang_tua) || "-",
    program: cleanStr(row.cleaned_program),
    membership: cleanStr(row.membership),
    expiry_date: formatDate(row.expiry_date),
    branch_id: cleanStr(row.cabang_id),
    first_enroll: formatDate(row.first_enroll),
    class: cleanStr(row.class),
    house: cleanStr(row.house),
    level: levelVal,
    house_role: houseRoleVal,
    class_branch: cleanStr(row.cabang_kelas),
    newest_grade: numericGrade,
    trainee_homeroom: cleanStr(row.trainee_homeroom),
    screening_test: cleanStr(row.screening_test),
    ajy_by_class: cleanStr(row.ajy_by_class),
    last_real_stage: formatDate(row.last_real_stage),

    // Backward-compatibility aliases
    password: cleanStr(row.password) || `SML${cleanIdStr}`,
    nama_sekolah: null,
    cleaned_program: cleanStr(row.cleaned_program),
    cabang_id: cleanStr(row.cabang_id),
    cabang_kelas: cleanStr(row.cabang_kelas)
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

    query += ` ORDER BY NULLIF(regexp_replace(id, '\\D', '', 'g'), '')::bigint ASC, id ASC`;

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
    const { id, student_id, password, ID, StudentID } = req.body;
    const rawId = id || student_id || ID || StudentID || '';
    const cleanId = String(rawId).trim();

    if (!cleanId || password === undefined || password === null || String(password).trim() === '') {
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
    const storedPassword = String(trainee.password || '').trim();
    const expectedDefault = `SML${cleanId}`;

    let isMatch = false;

    // 1. Direct equality check (case-insensitive)
    if (cleanPassword.toLowerCase() === storedPassword.toLowerCase()) {
      isMatch = true;
    }
    // 2. Default SML + ID (case-insensitive, e.g. "sml60", "SML60")
    else if (cleanPassword.toLowerCase() === expectedDefault.toLowerCase()) {
      isMatch = true;
    }
    // 3. Just numeric ID match (e.g. user typed "60" for ID "60")
    else if (cleanPassword === cleanId) {
      isMatch = true;
    }
    // 4. Bcrypt hash check (if password was hashed)
    else if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
      const bcrypt = require('bcryptjs');
      try {
        isMatch = await bcrypt.compare(cleanPassword, storedPassword);
      } catch (err) {
        isMatch = false;
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: `Password salah. Password default adalah ${expectedDefault} atau ID Anda (${cleanId}).`
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
        house_role, cabang_kelas, newest_grade, trainee_homeroom,
        draft_grade, prev_grade, ajy_by_class, last_real_stage, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW())
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

// 5. PUT/PATCH /api/login-portal-fix/:id - Update user-editable profile fields (school_name, wa_trainee, wa_orang_tua, email)
const updateTraineeProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = String(id || '').trim();

    const { school_name, nama_sekolah, wa_trainee, wa_orang_tua, email, email_trainee } = req.body;

    const schoolVal = school_name !== undefined ? school_name : nama_sekolah;
    const emailVal = email !== undefined ? email : email_trainee;

    const result = await db.query(
      `UPDATE login_portal_fix SET
        nama_sekolah = COALESCE($1, nama_sekolah),
        wa_trainee = COALESCE($2, wa_trainee),
        wa_orang_tua = COALESCE($3, wa_orang_tua),
        email = COALESCE($4, email),
        updated_at = NOW()
       WHERE LOWER(id) = LOWER($5)
       RETURNING *`,
      [
        schoolVal !== undefined ? (String(schoolVal).trim() || null) : null,
        wa_trainee !== undefined ? (String(wa_trainee).trim() || null) : null,
        wa_orang_tua !== undefined ? (String(wa_orang_tua).trim() || null) : null,
        emailVal !== undefined ? (String(emailVal).trim() || null) : null,
        cleanId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trainee tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Profil trainee berhasil diperbarui!',
      data: formatTrainee(result.rows[0])
    });
  } catch (error) {
    console.error('[LoginPortalFix] Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui profil trainee',
      error: error.message
    });
  }
};

router.put('/:id', updateTraineeProfile);
router.patch('/:id', updateTraineeProfile);

// 6. DELETE /api/login-portal-fix/:id - Delete trainee record
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

router.formatTrainee = formatTrainee;
module.exports = router;
