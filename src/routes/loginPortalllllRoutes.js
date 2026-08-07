const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// Helper to clean string values
function cleanStr(v) {
  if (v === null || v === undefined || v === 'null') return null;
  const str = String(v).trim();
  return str.length > 0 ? str : null;
}

// Helper to clean class_name by removing parenthetical schedules like (Fri 3-5)
function cleanClassName(v) {
  if (!v || v === 'null') return null;
  const cleaned = String(v).replace(/\s*\([^)]*\)/g, '').trim();
  return cleaned.length > 0 ? cleaned : null;
}

// Helper to format date into clean YYYY-MM-DD string without time/timezone
function formatDateOnly(v) {
  if (!v || v === 'null') return null;
  if (v instanceof Date) {
    const y = v.getUTCFullYear();
    const m = String(v.getUTCMonth() + 1).padStart(2, '0');
    const d = String(v.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(v).trim();
  if (str.includes('T')) {
    return str.split('T')[0];
  }
  const match = str.match(/\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];
  return str.length >= 5 ? str : null;
}

// Helper to format row from login_portalllll table
function formatTrainee(row) {
  if (!row) return null;
  const cleanId = String(row.id || '').trim();

  return {
    id: cleanId,
    trainee_id: cleanId,
    name: cleanStr(row.name),
    gender: cleanStr(row.gender),
    date_of_birth: formatDateOnly(row.date_of_birth),
    nama_sekolah: cleanStr(row.nama_sekolah),
    cleaned_program: cleanStr(row.cleaned_program),
    membership: cleanStr(row.membership),
    expiry_date: formatDateOnly(row.expiry_date),
    cabang_id: cleanStr(row.cabang_id),
    first_enroll: formatDateOnly(row.first_enroll),
    class_name: cleanClassName(row.class_name),
    class: cleanClassName(row.class_name),
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
    last_real_stage: cleanStr(row.last_real_stage),
    password: row.password || `SML${cleanId}`,
    plain_password: row.plain_password || `SML${cleanId}`,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

// GET all trainees from login_portalllll
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM login_portalllll ORDER BY name ASC;');
    const formatted = result.rows.map(formatTrainee);
    res.json({
      status: 'success',
      total: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('Error fetching login_portalllll:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST login endpoint for login_portalllll
router.post('/login', async (req, res) => {
  try {
    const { id, trainee_id, password } = req.body || {};
    const inputId = String(id || trainee_id || '').trim();
    const inputPassword = String(password || '').trim();

    if (!inputId) {
      return res.status(400).json({
        status: 'error',
        message: 'Trainee ID is required'
      });
    }

    const result = await db.query('SELECT * FROM login_portalllll WHERE TRIM(id) = $1 LIMIT 1;', [inputId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Trainee with ID '${inputId}' not found in login_portalllll`
      });
    }

    const trainee = result.rows[0];
    const expectedPassword = String(trainee.plain_password || trainee.password || `SML${inputId}`).trim();

    // If password provided, validate password. If password not provided or matches expected, allow login.
    if (inputPassword && inputPassword !== expectedPassword && inputPassword !== `SML${inputId}`) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid password'
      });
    }

    const formattedData = formatTrainee(trainee);

    res.json({
      status: 'success',
      message: 'Login successful',
      data: formattedData
    });
  } catch (error) {
    console.error('Error logging in via login_portalllll:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET single trainee by ID
router.get('/:id', async (req, res) => {
  try {
    const rawId = String(req.params.id || '').trim();
    if (!rawId) {
      return res.status(400).json({ status: 'error', message: 'ID parameter is required' });
    }

    const result = await db.query('SELECT * FROM login_portalllll WHERE TRIM(id) = $1 LIMIT 1;', [rawId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Trainee with ID '${rawId}' not found in login_portalllll`
      });
    }

    res.json({
      status: 'success',
      data: formatTrainee(result.rows[0])
    });
  } catch (error) {
    console.error('Error fetching trainee from login_portalllll:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST create a new trainee in login_portalllll
router.post('/', async (req, res) => {
  try {
    const {
      id, name, gender, date_of_birth, nama_sekolah, cleaned_program,
      membership, expiry_date, cabang_id, first_enroll, class_name, class: cls,
      house, level, house_role, cabang_kelas, newest_grade, trainee_homeroom,
      screening_test, draft_grade, prev_grade, ajy_by_class, last_real_stage,
      password, plain_password
    } = req.body || {};

    const cleanId = String(id || '').trim();
    if (!cleanId || !name) {
      return res.status(400).json({ status: 'error', message: 'ID and Name are required' });
    }

    const passVal = password ? String(password).trim() : `SML${cleanId}`;
    const plainPassVal = plain_password ? String(plain_password).trim() : (password ? String(password).trim() : `SML${cleanId}`);
    const finalClassName = class_name || cls || null;

    const result = await db.query(`
      INSERT INTO login_portalllll (
        id, name, gender, date_of_birth, nama_sekolah, cleaned_program,
        membership, expiry_date, cabang_id, first_enroll, class_name,
        house, level, house_role, cabang_kelas, newest_grade, trainee_homeroom,
        screening_test, draft_grade, prev_grade, ajy_by_class, last_real_stage,
        password, plain_password
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
      ) ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        gender = EXCLUDED.gender,
        date_of_birth = EXCLUDED.date_of_birth,
        nama_sekolah = EXCLUDED.nama_sekolah,
        cleaned_program = EXCLUDED.cleaned_program,
        membership = EXCLUDED.membership,
        expiry_date = EXCLUDED.expiry_date,
        cabang_id = EXCLUDED.cabang_id,
        first_enroll = EXCLUDED.first_enroll,
        class_name = EXCLUDED.class_name,
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
        password = EXCLUDED.password,
        plain_password = EXCLUDED.plain_password,
        updated_at = NOW()
      RETURNING *;
    `, [
      cleanId, name, gender || null, date_of_birth || null, nama_sekolah || null, cleaned_program || null,
      membership || null, expiry_date || null, cabang_id || null, first_enroll || null, finalClassName,
      house || null, level || null, house_role || null, cabang_kelas || null, newest_grade || null, trainee_homeroom || null,
      screening_test || null, draft_grade || null, prev_grade || null, ajy_by_class || null, last_real_stage || null,
      passVal, plainPassVal
    ]);

    res.json({
      status: 'success',
      message: 'Trainee created/updated successfully',
      data: formatTrainee(result.rows[0])
    });
  } catch (error) {
    console.error('Error saving trainee to login_portalllll:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PUT update trainee by ID
router.put('/:id', async (req, res) => {
  try {
    const rawId = String(req.params.id || '').trim();
    if (!rawId) {
      return res.status(400).json({ status: 'error', message: 'ID parameter is required' });
    }

    const {
      class_name, day, time, room, branch, name, level, newest_grade,
      house, house_role, trainee_homeroom, homeroom_kelas, trainer,
      membership, expiry_date, first_enroll, password, plain_password
    } = req.body || {};

    const pass = password || plain_password ? String(password || plain_password).trim() : null;

    const result = await db.query(`
      UPDATE login_portalllll SET
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
        membership = COALESCE($14, membership),
        expiry_date = COALESCE($15, expiry_date),
        first_enroll = COALESCE($16, first_enroll),
        password = COALESCE($17, password),
        plain_password = COALESCE($18, plain_password),
        updated_at = NOW()
      WHERE TRIM(id) = $19
      RETURNING *;
    `, [
      class_name, day, time, room, branch, name, level, newest_grade,
      house, house_role, trainee_homeroom, homeroom_kelas, trainer,
      membership, expiry_date, first_enroll, pass, pass, rawId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: `Trainee ID '${rawId}' not found` });
    }

    res.json({
      status: 'success',
      message: 'Trainee updated successfully',
      data: formatTrainee(result.rows[0])
    });
  } catch (error) {
    console.error('Error updating trainee in login_portalllll:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// DELETE trainee by ID
router.delete('/:id', async (req, res) => {
  try {
    const rawId = String(req.params.id || '').trim();
    if (!rawId) {
      return res.status(400).json({ status: 'error', message: 'ID parameter is required' });
    }

    const result = await db.query('DELETE FROM login_portalllll WHERE TRIM(id) = $1 RETURNING *;', [rawId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: `Trainee ID '${rawId}' not found` });
    }

    res.json({
      status: 'success',
      message: `Trainee with ID '${rawId}' deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting trainee from login_portalllll:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
