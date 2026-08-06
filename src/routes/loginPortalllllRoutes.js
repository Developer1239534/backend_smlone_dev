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

// Helper to format row from login_portalllll table
function formatTrainee(row) {
  if (!row) return null;
  const cleanId = String(row.id || '').trim();

  return {
    id: cleanId,
    trainee_id: cleanId,
    class_name: cleanClassName(row.class_name),
    class: cleanClassName(row.class_name),
    day: cleanStr(row.day),
    time: cleanStr(row.time),
    room: cleanStr(row.room),
    branch: cleanStr(row.branch),
    name: cleanStr(row.name),
    level: cleanStr(row.level),
    newest_grade: cleanStr(row.newest_grade),
    house: cleanStr(row.house),
    house_role: cleanStr(row.house_role),
    trainee_homeroom: cleanStr(row.trainee_homeroom),
    homeroom_kelas: cleanStr(row.homeroom_kelas),
    trainer: cleanStr(row.trainer),
    membership: cleanStr(row.membership),
    expiry_date: cleanStr(row.expiry_date),
    first_enroll: cleanStr(row.first_enroll),
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
      id, class_name, day, time, room, branch, name, level, newest_grade,
      house, house_role, trainee_homeroom, homeroom_kelas, trainer,
      membership, expiry_date, first_enroll, password, plain_password
    } = req.body || {};

    const cleanId = String(id || '').trim();
    if (!cleanId || !name) {
      return res.status(400).json({ status: 'error', message: 'ID and Name are required' });
    }

    const pass = String(password || plain_password || `SML${cleanId}`).trim();

    const result = await db.query(`
      INSERT INTO login_portalllll (
        id, class_name, day, time, room, branch, name, level, newest_grade,
        house, house_role, trainee_homeroom, homeroom_kelas, trainer,
        membership, expiry_date, first_enroll, password, plain_password
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      ) ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        class_name = EXCLUDED.class_name,
        day = EXCLUDED.day,
        time = EXCLUDED.time,
        room = EXCLUDED.room,
        branch = EXCLUDED.branch,
        level = EXCLUDED.level,
        newest_grade = EXCLUDED.newest_grade,
        house = EXCLUDED.house,
        house_role = EXCLUDED.house_role,
        trainee_homeroom = EXCLUDED.trainee_homeroom,
        homeroom_kelas = EXCLUDED.homeroom_kelas,
        trainer = EXCLUDED.trainer,
        membership = EXCLUDED.membership,
        expiry_date = EXCLUDED.expiry_date,
        first_enroll = EXCLUDED.first_enroll,
        password = EXCLUDED.password,
        plain_password = EXCLUDED.plain_password,
        updated_at = NOW()
      RETURNING *;
    `, [
      cleanId, class_name || null, day || null, time || null, room || null, branch || null,
      name, level || null, newest_grade || null, house || null, house_role || null,
      trainee_homeroom || null, homeroom_kelas || null, trainer || null,
      membership || null, expiry_date || null, first_enroll || null, pass, pass
    ]);

    res.json({
      status: 'success',
      message: 'Trainee created/updated successfully',
      data: formatTrainee(result.rows[0])
    });
  } catch (error) {
    console.error('Error creating trainee in login_portalllll:', error);
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
