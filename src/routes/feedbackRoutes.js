const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// Helper to clean string values
function cleanStr(v) {
  if (v === null || v === undefined || v === 'null') return null;
  const str = String(v).trim();
  return str.length > 0 ? str : null;
}

// Helper to format date into clean YYYY-MM-DD
function formatDateOnly(v) {
  if (!v || v === 'null') return null;
  if (v instanceof Date) {
    const y = v.getUTCFullYear();
    const m = String(v.getUTCMonth() + 1).padStart(2, '0');
    const d = String(v.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(v).trim();
  if (str.includes('T')) return str.split('T')[0];
  const match = str.match(/\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];
  return str.length >= 5 ? str : null;
}

// Helper to format feedback row
function formatFeedback(row) {
  if (!row) return null;
  return {
    id: row.id,
    trainee_id: cleanStr(row.trainee_id),
    student_name: cleanStr(row.student_name),
    house: cleanStr(row.house),
    class_trainers: cleanStr(row.class_trainers),
    date: formatDateOnly(row.date),
    coach_feedback: cleanStr(row.coach_feedback),
    challenge: cleanStr(row.challenge),
    speaking_project: cleanStr(row.speaking_project),
    role_2: cleanStr(row.role_2),
    role_3: cleanStr(row.role_3),
    role_4: cleanStr(row.role_4),
    life_project: cleanStr(row.life_project),
    win: cleanStr(row.win),
    fav: cleanStr(row.fav),
    total_gold: row.total_gold ? parseInt(row.total_gold, 10) : 0,
    level: cleanStr(row.level),
    latest_speaking_project: cleanStr(row.latest_speaking_project),
    last_time_speaking: cleanStr(row.last_time_speaking),
    class_name: cleanStr(row.class_name),
    class: cleanStr(row.class_name),
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

// GET all feedback entries
router.get('/', async (req, res) => {
  try {
    const traineeId = req.query.trainee_id || req.query.id;
    let query = 'SELECT * FROM feedback';
    let params = [];

    if (traineeId) {
      query += ' WHERE TRIM(trainee_id) = $1 ORDER BY id DESC;';
      params.push(String(traineeId).trim());
    } else {
      query += ' ORDER BY id DESC;';
    }

    const result = await db.query(query, params);
    const formatted = result.rows.map(formatFeedback);

    res.json({
      status: 'success',
      total: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('Error fetching feedback entries:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET single feedback entry by ID or trainee_id
router.get('/:id', async (req, res) => {
  try {
    const rawId = String(req.params.id || '').trim();
    if (!rawId) {
      return res.status(400).json({ status: 'error', message: 'ID parameter is required' });
    }

    // Search by primary key id or trainee_id
    let result = await db.query('SELECT * FROM feedback WHERE id::text = $1 OR TRIM(trainee_id) = $1 ORDER BY id DESC;', [rawId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Feedback entry with ID or trainee_id '${rawId}' not found`
      });
    }

    res.json({
      status: 'success',
      data: result.rows.map(formatFeedback)
    });
  } catch (error) {
    console.error('Error fetching feedback by ID:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST create a new feedback entry
router.post('/', async (req, res) => {
  try {
    const {
      id, trainee_id, student_name, house, class_trainers, date,
      coach_feedback, challenge, speaking_project, role_2, role_3, role_4,
      life_project, win, fav, total_gold, level, latest_speaking_project,
      last_time_speaking, class_name, class: cls
    } = req.body || {};

    const cleanTraineeId = cleanStr(trainee_id || id);
    const cleanStudentName = cleanStr(student_name);
    const finalClassName = cleanStr(class_name || cls);

    const result = await db.query(`
      INSERT INTO feedback (
        trainee_id, student_name, house, class_trainers, date,
        coach_feedback, challenge, speaking_project, role_2, role_3, role_4,
        life_project, win, fav, total_gold, level, latest_speaking_project,
        last_time_speaking, class_name
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      ) RETURNING *;
    `, [
      cleanTraineeId, cleanStudentName, house || null, class_trainers || null, date || null,
      coach_feedback || null, challenge || null, speaking_project || null, role_2 || null, role_3 || null, role_4 || null,
      life_project || null, win || null, fav || null, total_gold ? parseInt(total_gold, 10) : 0, level || null,
      latest_speaking_project || null, last_time_speaking || null, finalClassName
    ]);

    res.json({
      status: 'success',
      message: 'Feedback entry created successfully',
      data: formatFeedback(result.rows[0])
    });
  } catch (error) {
    console.error('Error creating feedback entry:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PUT update feedback entry by ID
router.put('/:id', async (req, res) => {
  try {
    const rawId = String(req.params.id || '').trim();
    if (!rawId) {
      return res.status(400).json({ status: 'error', message: 'ID parameter is required' });
    }

    const {
      trainee_id, student_name, house, class_trainers, date,
      coach_feedback, challenge, speaking_project, role_2, role_3, role_4,
      life_project, win, fav, total_gold, level, latest_speaking_project,
      last_time_speaking, class_name, class: cls
    } = req.body || {};

    const finalClassName = class_name || cls;

    const result = await db.query(`
      UPDATE feedback SET
        trainee_id = COALESCE($1, trainee_id),
        student_name = COALESCE($2, student_name),
        house = COALESCE($3, house),
        class_trainers = COALESCE($4, class_trainers),
        date = COALESCE($5, date),
        coach_feedback = COALESCE($6, coach_feedback),
        challenge = COALESCE($7, challenge),
        speaking_project = COALESCE($8, speaking_project),
        role_2 = COALESCE($9, role_2),
        role_3 = COALESCE($10, role_3),
        role_4 = COALESCE($11, role_4),
        life_project = COALESCE($12, life_project),
        win = COALESCE($13, win),
        fav = COALESCE($14, fav),
        total_gold = COALESCE($15, total_gold),
        level = COALESCE($16, level),
        latest_speaking_project = COALESCE($17, latest_speaking_project),
        last_time_speaking = COALESCE($18, last_time_speaking),
        class_name = COALESCE($19, class_name),
        updated_at = NOW()
      WHERE id::text = $20 OR TRIM(trainee_id) = $20
      RETURNING *;
    `, [
      trainee_id || null, student_name || null, house || null, class_trainers || null, date || null,
      coach_feedback || null, challenge || null, speaking_project || null, role_2 || null, role_3 || null, role_4 || null,
      life_project || null, win || null, fav || null, total_gold !== undefined ? parseInt(total_gold, 10) : null, level || null,
      latest_speaking_project || null, last_time_speaking || null, finalClassName || null, rawId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: `Feedback entry '${rawId}' not found` });
    }

    res.json({
      status: 'success',
      message: 'Feedback entry updated successfully',
      data: result.rows.map(formatFeedback)
    });
  } catch (error) {
    console.error('Error updating feedback entry:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// DELETE feedback entry by ID
router.delete('/:id', async (req, res) => {
  try {
    const rawId = String(req.params.id || '').trim();
    if (!rawId) {
      return res.status(400).json({ status: 'error', message: 'ID parameter is required' });
    }

    const result = await db.query('DELETE FROM feedback WHERE id::text = $1 OR TRIM(trainee_id) = $1 RETURNING *;', [rawId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: `Feedback entry '${rawId}' not found` });
    }

    res.json({
      status: 'success',
      message: 'Feedback entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback entry:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
