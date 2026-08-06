const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// Helper to clean string values
function cleanStr(v) {
  if (v === null || v === undefined || v === 'null') return null;
  const str = String(v).trim();
  return str.length > 0 ? str : null;
}

// Helper to format row from login_portalllll table
function formatTrainee(row) {
  if (!row) return null;
  const cleanId = String(row.id || '').trim();

  return {
    id: cleanId,
    trainee_id: cleanId,
    class_name: cleanStr(row.class_name),
    class: cleanStr(row.class_name),
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
    created_at: row.created_at
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

module.exports = router;
