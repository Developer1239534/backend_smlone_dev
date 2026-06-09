const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// ============================================================
// ADMIN AWARDS ROUTES — Full CRUD for awards table
// ============================================================

// Helper function to dynamically build update queries
const buildUpdateQuery = (table, fields, id) => {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  if (keys.length === 0) return null;
  const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
  const query = `UPDATE ${table} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
  return { query, values: [...values, id] };
};

// 0. GET /api/admin/awards/summary — Summary stats per award
router.get('/summary', async (req, res) => {
  const { period, award_type } = req.query;
  try {
    let where = [];
    let params = [];
    let idx = 1;

    if (period) { where.push(`period = $${idx++}`); params.push(period); }
    if (award_type) { where.push(`award_type = $${idx++}`); params.push(award_type); }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const result = await db.query(`
      SELECT 
        award_type, award_name, category, medal,
        COUNT(*) as winner_count
      FROM awards
      ${whereClause}
      GROUP BY award_type, award_name, category, medal
      ORDER BY award_type, award_name, 
        CASE category WHEN 'apprentice' THEN 1 WHEN 'junior' THEN 2 WHEN 'youth' THEN 3 END,
        CASE medal WHEN 'bronze' THEN 1 WHEN 'silver' THEN 2 WHEN 'gold' THEN 3 END
    `, params);

    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('[Admin Awards] GET Summary Error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 1. GET /api/admin/awards — Get all awards with optional filters
router.get('/', async (req, res) => {
  const { award_type, award_name, category, medal, period, trainee_id } = req.query;
  try {
    let where = [];
    let params = [];
    let idx = 1;

    if (award_type) { where.push(`award_type = $${idx++}`); params.push(award_type); }
    if (award_name) { where.push(`award_name ILIKE $${idx++}`); params.push(`%${award_name}%`); }
    if (category) { where.push(`category = $${idx++}`); params.push(category); }
    if (medal) { where.push(`medal = $${idx++}`); params.push(medal); }
    if (period) { where.push(`period = $${idx++}`); params.push(period); }
    if (trainee_id) { where.push(`trainee_id = $${idx++}`); params.push(trainee_id); }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const result = await db.query(
      `SELECT * FROM awards ${whereClause} ORDER BY award_type, award_name, category, medal, score DESC`,
      params
    );

    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('[Admin Awards] GET All Error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 2. GET /api/admin/awards/:id — Get single award entry
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM awards WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Award entry with ID ${id} not found.` });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(`[Admin Awards] GET Single Error (ID: ${id}):`, err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 3. POST /api/admin/awards — Create a new award entry
router.post('/', async (req, res) => {
  const data = req.body;

  if (!data.award_type || !data.award_name || !data.category || !data.medal || !data.trainee_name) {
    return res.status(400).json({
      success: false,
      message: 'Required fields: award_type, award_name, category, medal, trainee_name'
    });
  }

  try {
    const result = await db.query(`
      INSERT INTO awards (award_type, award_name, category, medal, trainee_id, trainee_name, score, threshold, period)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (award_name, category, trainee_id, period)
      DO UPDATE SET
        award_type = EXCLUDED.award_type,
        medal = EXCLUDED.medal,
        trainee_name = EXCLUDED.trainee_name,
        score = EXCLUDED.score,
        threshold = EXCLUDED.threshold
      RETURNING *
    `, [
      data.award_type,
      data.award_name,
      data.category,
      data.medal,
      data.trainee_id || '',
      data.trainee_name,
      data.score || 0,
      data.threshold || 0,
      data.period || 'jun-2026'
    ]);

    res.status(201).json({ success: true, message: 'Award entry created successfully.', data: result.rows[0] });
  } catch (err) {
    console.error('[Admin Awards] POST Error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
});

// 4. PUT /api/admin/awards/:id — Replace an award entry
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  if (!data.award_type || !data.award_name || !data.category || !data.medal || !data.trainee_name) {
    return res.status(400).json({
      success: false,
      message: 'Required fields: award_type, award_name, category, medal, trainee_name'
    });
  }

  try {
    const check = await db.query('SELECT * FROM awards WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Award entry with ID ${id} not found.` });
    }

    const result = await db.query(`
      UPDATE awards SET
        award_type = $1, award_name = $2, category = $3, medal = $4,
        trainee_id = $5, trainee_name = $6, score = $7, threshold = $8, period = $9
      WHERE id = $10 RETURNING *
    `, [
      data.award_type,
      data.award_name,
      data.category,
      data.medal,
      data.trainee_id || check.rows[0].trainee_id,
      data.trainee_name,
      data.score !== undefined ? data.score : check.rows[0].score,
      data.threshold !== undefined ? data.threshold : check.rows[0].threshold,
      data.period || check.rows[0].period,
      id
    ]);

    res.json({ success: true, message: 'Award entry replaced successfully.', data: result.rows[0] });
  } catch (err) {
    console.error(`[Admin Awards] PUT Error (ID: ${id}):`, err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
});

// 5. PATCH /api/admin/awards/:id — Partially update an award entry
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  delete updates.id;
  delete updates.created_at;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No fields provided to update.' });
  }

  try {
    const check = await db.query('SELECT 1 FROM awards WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Award entry with ID ${id} not found.` });
    }

    const { query, values } = buildUpdateQuery('awards', updates, id);
    if (!query) {
      return res.status(400).json({ success: false, message: 'Invalid update fields.' });
    }

    const result = await db.query(query, values);
    res.json({ success: true, message: 'Award entry updated successfully.', data: result.rows[0] });
  } catch (err) {
    console.error(`[Admin Awards] PATCH Error (ID: ${id}):`, err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
});

// 6. DELETE /api/admin/awards/:id — Delete a single award entry
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM awards WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Award entry with ID ${id} not found.` });
    }
    res.json({ success: true, message: 'Award entry deleted successfully.', data: result.rows[0] });
  } catch (err) {
    console.error(`[Admin Awards] DELETE Error (ID: ${id}):`, err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
});

// 7. DELETE /api/admin/awards/period/:period — Bulk delete by period
router.delete('/period/:period', async (req, res) => {
  const { period } = req.params;
  try {
    const result = await db.query('DELETE FROM awards WHERE period = $1', [period]);
    res.json({
      success: true,
      message: `Deleted ${result.rowCount} award entries for period '${period}'.`,
      deleted_count: result.rowCount
    });
  } catch (err) {
    console.error(`[Admin Awards] DELETE Period Error (${period}):`, err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
});

module.exports = router;
