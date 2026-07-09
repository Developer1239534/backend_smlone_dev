const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// 1. GET / — Get all questions
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM questions ORDER BY id ASC');
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('[Admin Questions] GET All Error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 2. GET /:id — Get single question
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM questions WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Question with ID ${id} not found.` });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(`[Admin Questions] GET Single Error (ID: ${id}):`, err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 3. POST / — Create a new question
router.post('/', async (req, res) => {
  const { question_text, option_a, option_b, option_c, option_d, option_e } = req.body;

  if (!question_text || !option_a || !option_b || !option_c || !option_d || !option_e) {
    return res.status(400).json({ success: false, message: 'All options (A, B, C, D, E) and question_text are required.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, option_e)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [question_text, option_a, option_b, option_c, option_d, option_e]
    );

    res.status(201).json({ success: true, message: 'Question created successfully.', data: result.rows[0] });
  } catch (err) {
    console.error('[Admin Questions] POST Error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
});

// 4. PUT /:id — Update an existing question
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { question_text, option_a, option_b, option_c, option_d, option_e } = req.body;

  if (!question_text || !option_a || !option_b || !option_c || !option_d || !option_e) {
    return res.status(400).json({ success: false, message: 'All options (A, B, C, D, E) and question_text are required.' });
  }

  try {
    const check = await db.query('SELECT 1 FROM questions WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Question with ID ${id} not found.` });
    }

    const result = await db.query(
      `UPDATE questions
       SET question_text = $1, option_a = $2, option_b = $3, option_c = $4, option_d = $5, option_e = $6
       WHERE id = $7
       RETURNING *`,
      [question_text, option_a, option_b, option_c, option_d, option_e, id]
    );

    res.json({ success: true, message: 'Question updated successfully.', data: result.rows[0] });
  } catch (err) {
    console.error(`[Admin Questions] PUT Error (ID: ${id}):`, err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
});

// 5. DELETE /:id — Delete a question
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const check = await db.query('SELECT 1 FROM questions WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Question with ID ${id} not found.` });
    }

    const result = await db.query('DELETE FROM questions WHERE id = $1 RETURNING *', [id]);
    res.json({ success: true, message: 'Question deleted successfully.', data: result.rows[0] });
  } catch (err) {
    console.error(`[Admin Questions] DELETE Error (ID: ${id}):`, err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
