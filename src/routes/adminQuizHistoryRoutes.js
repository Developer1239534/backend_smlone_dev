const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// Helper to check if student exists
async function checkStudentExists(studentId) {
  const res = await db.query('SELECT 1 FROM dashboard_trainne WHERE id = $1', [studentId]);
  return res.rows.length > 0;
}

// Helper to check if house exists
async function checkHouseExists(houseId) {
  const res = await db.query('SELECT 1 FROM houses WHERE id = $1', [houseId]);
  return res.rows.length > 0;
}

// 1. GET / — Get all quiz histories with optional filter/search
router.get('/', async (req, res) => {
  const { search, assigned_house, sort_by, order } = req.query;
  try {
    let query = `
      SELECT qh.*, dt.trainee_name, h.name as house_name, h.core_value as house_core_value
      FROM quiz_history qh
      LEFT JOIN dashboard_trainne dt ON qh.student_id = dt.id
      LEFT JOIN houses h ON qh.assigned_house = h.id
    `;
    let params = [];
    let whereClauses = [];
    let idx = 1;

    if (search) {
      whereClauses.push(`(qh.student_id = $${idx} OR dt.trainee_name ILIKE $${idx+1})`);
      params.push(search);
      params.push(`%${search}%`);
      idx += 2;
    }

    if (assigned_house) {
      whereClauses.push(`qh.assigned_house = $${idx}`);
      params.push(assigned_house);
      idx += 1;
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    // Sort order config
    const validSortFields = ['submitted_at', 'student_id', 'assigned_house', 'trainee_name'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'submitted_at';
    const sortOrder = order && order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    let orderClause = '';
    if (sortField === 'submitted_at') orderClause = 'qh.submitted_at';
    else if (sortField === 'student_id') orderClause = 'qh.student_id';
    else if (sortField === 'assigned_house') orderClause = 'qh.assigned_house';
    else if (sortField === 'trainee_name') orderClause = 'dt.trainee_name';

    query += ` ORDER BY ${orderClause} ${sortOrder}`;

    const result = await db.query(query, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('[Admin Quiz History] GET All Error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 2. GET /:student_id — Get single quiz history entry
router.get('/:student_id', async (req, res) => {
  const { student_id } = req.params;
  try {
    const result = await db.query(
      `SELECT qh.*, dt.trainee_name, h.name as house_name, h.description as house_description, h.core_value as house_core_value
       FROM quiz_history qh
       LEFT JOIN dashboard_trainne dt ON qh.student_id = dt.id
       LEFT JOIN houses h ON qh.assigned_house = h.id
       WHERE qh.student_id = $1`,
      [student_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Quiz history for student ID ${student_id} not found.` });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(`[Admin Quiz History] GET Single Error (ID: ${student_id}):`, err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 3. POST / — Create a new quiz history entry
router.post('/', async (req, res) => {
  const { student_id, assigned_house, scores, submitted_at } = req.body;

  if (!student_id || !assigned_house || !scores) {
    return res.status(400).json({ success: false, message: 'Required fields: student_id, assigned_house, scores' });
  }

  try {
    // Verify trainee exists
    const traineeExists = await checkStudentExists(student_id);
    if (!traineeExists) {
      return res.status(400).json({ success: false, message: `Trainee with ID ${student_id} does not exist.` });
    }

    // Verify house exists
    const houseExists = await checkHouseExists(assigned_house);
    if (!houseExists) {
      return res.status(400).json({ success: false, message: `House with ID ${assigned_house} does not exist.` });
    }

    // Check duplicate
    const existing = await db.query('SELECT 1 FROM quiz_history WHERE student_id = $1', [student_id]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: `Quiz history for student ID ${student_id} already exists.` });
    }

    // Parse scores if passed as string
    let scoresObj = scores;
    if (typeof scores === 'string') {
      try {
        scoresObj = JSON.parse(scores);
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid JSON format for scores field.' });
      }
    }

    const finalSubmittedAt = submitted_at || new Date();

    await db.query('BEGIN');

    // 1. Insert history
    const result = await db.query(
      `INSERT INTO quiz_history (student_id, assigned_house, scores, submitted_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [student_id, assigned_house, JSON.stringify(scoresObj), finalSubmittedAt]
    );

    // 2. Sync to trainee class & house_sml
    await db.query(
      `UPDATE dashboard_trainne SET class = $1, house_sml = $1 WHERE id = $2`,
      [assigned_house, student_id]
    );

    await db.query('COMMIT');

    res.status(201).json({ success: true, message: 'Quiz history entry created successfully.', data: result.rows[0] });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('[Admin Quiz History] POST Error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
});

// 4. PUT /:student_id — Replace a quiz history entry
router.put('/:student_id', async (req, res) => {
  const { student_id } = req.params;
  const { assigned_house, scores, submitted_at } = req.body;

  if (!assigned_house || !scores) {
    return res.status(400).json({ success: false, message: 'Required fields: assigned_house, scores' });
  }

  try {
    const existing = await db.query('SELECT 1 FROM quiz_history WHERE student_id = $1', [student_id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Quiz history for student ID ${student_id} not found.` });
    }

    const houseExists = await checkHouseExists(assigned_house);
    if (!houseExists) {
      return res.status(400).json({ success: false, message: `House with ID ${assigned_house} does not exist.` });
    }

    let scoresObj = scores;
    if (typeof scores === 'string') {
      try {
        scoresObj = JSON.parse(scores);
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid JSON format for scores field.' });
      }
    }

    const finalSubmittedAt = submitted_at || new Date();

    await db.query('BEGIN');

    const result = await db.query(
      `UPDATE quiz_history
       SET assigned_house = $1, scores = $2, submitted_at = $3
       WHERE student_id = $4
       RETURNING *`,
      [assigned_house, JSON.stringify(scoresObj), finalSubmittedAt, student_id]
    );

    // Sync to trainee class & house_sml
    await db.query(
      `UPDATE dashboard_trainne SET class = $1, house_sml = $1 WHERE id = $2`,
      [assigned_house, student_id]
    );

    await db.query('COMMIT');

    res.json({ success: true, message: 'Quiz history entry replaced successfully.', data: result.rows[0] });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(`[Admin Quiz History] PUT Error (ID: ${student_id}):`, err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
});

// 5. PATCH /:student_id — Partially update a quiz history entry
router.patch('/:student_id', async (req, res) => {
  const { student_id } = req.params;
  const updates = { ...req.body };

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No fields provided to update.' });
  }

  try {
    const existingResult = await db.query('SELECT * FROM quiz_history WHERE student_id = $1', [student_id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Quiz history for student ID ${student_id} not found.` });
    }

    const currentData = existingResult.rows[0];

    if (updates.assigned_house) {
      const houseExists = await checkHouseExists(updates.assigned_house);
      if (!houseExists) {
        return res.status(400).json({ success: false, message: `House with ID ${updates.assigned_house} does not exist.` });
      }
    }

    let scoresVal = currentData.scores;
    if (updates.scores) {
      let scoresObj = updates.scores;
      if (typeof updates.scores === 'string') {
        try {
          scoresObj = JSON.parse(updates.scores);
        } catch (e) {
          return res.status(400).json({ success: false, message: 'Invalid JSON format for scores field.' });
        }
      }
      scoresVal = JSON.stringify(scoresObj);
    }

    const assignedHouseVal = updates.assigned_house || currentData.assigned_house;
    const submittedAtVal = updates.submitted_at || currentData.submitted_at;

    await db.query('BEGIN');

    const result = await db.query(
      `UPDATE quiz_history
       SET assigned_house = $1, scores = $2, submitted_at = $3
       WHERE student_id = $4
       RETURNING *`,
      [assignedHouseVal, scoresVal, submittedAtVal, student_id]
    );

    // Sync to trainee class & house_sml if assigned_house changed
    if (updates.assigned_house) {
      await db.query(
        `UPDATE dashboard_trainne SET class = $1, house_sml = $1 WHERE id = $2`,
        [updates.assigned_house, student_id]
      );
    }

    await db.query('COMMIT');

    res.json({ success: true, message: 'Quiz history entry updated successfully.', data: result.rows[0] });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(`[Admin Quiz History] PATCH Error (ID: ${student_id}):`, err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
});

// 6. DELETE /:student_id — Delete a quiz history entry
router.delete('/:student_id', async (req, res) => {
  const { student_id } = req.params;
  try {
    const check = await db.query('SELECT 1 FROM quiz_history WHERE student_id = $1', [student_id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Quiz history for student ID ${student_id} not found.` });
    }

    await db.query('BEGIN');

    // 1. Delete history
    const result = await db.query('DELETE FROM quiz_history WHERE student_id = $1 RETURNING *', [student_id]);

    // 2. Reset trainee class & house_sml to NULL
    await db.query(
      `UPDATE dashboard_trainne SET class = NULL, house_sml = NULL WHERE id = $1`,
      [student_id]
    );

    await db.query('COMMIT');

    res.json({ success: true, message: 'Quiz history entry deleted successfully.', data: result.rows[0] });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(`[Admin Quiz History] DELETE Error (ID: ${student_id}):`, err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
});

module.exports = router;
