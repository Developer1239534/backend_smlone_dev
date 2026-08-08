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

// Helper to format feedback row (using ONLY id)
function formatFeedback(row) {
  if (!row) return null;
  return {
    id: cleanStr(row.id),
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
    const targetId = req.query.id || req.query.trainee_id;
    let query = 'SELECT * FROM feedback';
    let params = [];

    if (targetId) {
      query += ' WHERE TRIM(id) = $1 ORDER BY created_at DESC;';
      params.push(String(targetId).trim());
    } else {
      query += ' ORDER BY created_at DESC;';
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

// GET single feedback entry by ID
router.get('/:id', async (req, res) => {
  try {
    const rawId = String(req.params.id || '').trim();
    if (!rawId) {
      return res.status(400).json({ status: 'error', message: 'ID parameter is required' });
    }

    const result = await db.query('SELECT * FROM feedback WHERE TRIM(id) = $1;', [rawId]);

    if (result.rows.length === 0) {
      return res.json({
        status: 'success',
        data: null,
        message: `Belum ada data feedback untuk ID '${rawId}'`
      });
    }

    res.json({
      status: 'success',
      data: formatFeedback(result.rows[0])
    });
  } catch (error) {
    console.error('Error fetching feedback by ID:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST create / upsert feedback entry
router.post('/', async (req, res) => {
  try {
    const {
      id, trainee_id, student_name, house, class_trainers, date,
      coach_feedback, challenge, speaking_project, role_2, role_3, role_4,
      life_project, win, fav, total_gold, level, latest_speaking_project,
      last_time_speaking, class_name, class: cls
    } = req.body || {};

    const cleanId = cleanStr(id || trainee_id);
    if (!cleanId) {
      return res.status(400).json({ status: 'error', message: 'Field "id" is required' });
    }

    const cleanStudentName = cleanStr(student_name);
    const finalClassName = cleanStr(class_name || cls);

    const result = await db.query(`
      INSERT INTO feedback (
        id, student_name, house, class_trainers, date,
        coach_feedback, challenge, speaking_project, role_2, role_3, role_4,
        life_project, win, fav, total_gold, level, latest_speaking_project,
        last_time_speaking, class_name
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      )
      ON CONFLICT (id) DO UPDATE SET
        student_name = EXCLUDED.student_name,
        house = EXCLUDED.house,
        class_trainers = EXCLUDED.class_trainers,
        date = EXCLUDED.date,
        coach_feedback = EXCLUDED.coach_feedback,
        challenge = EXCLUDED.challenge,
        speaking_project = EXCLUDED.speaking_project,
        role_2 = EXCLUDED.role_2,
        role_3 = EXCLUDED.role_3,
        role_4 = EXCLUDED.role_4,
        life_project = EXCLUDED.life_project,
        win = EXCLUDED.win,
        fav = EXCLUDED.fav,
        total_gold = EXCLUDED.total_gold,
        level = EXCLUDED.level,
        latest_speaking_project = EXCLUDED.latest_speaking_project,
        last_time_speaking = EXCLUDED.last_time_speaking,
        class_name = EXCLUDED.class_name,
        updated_at = NOW()
      RETURNING *;
    `, [
      cleanId, cleanStudentName, house || null, class_trainers || null, date || null,
      coach_feedback || null, challenge || null, speaking_project || null, role_2 || null, role_3 || null, role_4 || null,
      life_project || null, win || null, fav || null, total_gold ? parseInt(total_gold, 10) : 0, level || null,
      latest_speaking_project || null, last_time_speaking || null, finalClassName
    ]);

    res.json({
      status: 'success',
      message: 'Feedback entry saved successfully',
      data: formatFeedback(result.rows[0])
    });
  } catch (error) {
    console.error('Error saving feedback entry:', error);
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
      student_name, house, class_trainers, date,
      coach_feedback, challenge, speaking_project, role_2, role_3, role_4,
      life_project, win, fav, total_gold, level, latest_speaking_project,
      last_time_speaking, class_name, class: cls
    } = req.body || {};

    const finalClassName = class_name || cls;

    const result = await db.query(`
      UPDATE feedback SET
        student_name = COALESCE($1, student_name),
        house = COALESCE($2, house),
        class_trainers = COALESCE($3, class_trainers),
        date = COALESCE($4, date),
        coach_feedback = COALESCE($5, coach_feedback),
        challenge = COALESCE($6, challenge),
        speaking_project = COALESCE($7, speaking_project),
        role_2 = COALESCE($8, role_2),
        role_3 = COALESCE($9, role_3),
        role_4 = COALESCE($10, role_4),
        life_project = COALESCE($11, life_project),
        win = COALESCE($12, win),
        fav = COALESCE($13, fav),
        total_gold = COALESCE($14, total_gold),
        level = COALESCE($15, level),
        latest_speaking_project = COALESCE($16, latest_speaking_project),
        last_time_speaking = COALESCE($17, last_time_speaking),
        class_name = COALESCE($18, class_name),
        updated_at = NOW()
      WHERE TRIM(id) = $19
      RETURNING *;
    `, [
      student_name || null, house || null, class_trainers || null, date || null,
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
      data: formatFeedback(result.rows[0])
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

    const result = await db.query('DELETE FROM feedback WHERE TRIM(id) = $1 RETURNING *;', [rawId]);

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
