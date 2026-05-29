const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET /api/dashboard-trainee - Get all trainees
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM dashboard_trainne ORDER BY id ASC`
    );
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error('[Dashboard] Fetch all error:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching all trainees.' });
  }
});

// GET /api/dashboard-trainee/:id - Get a specific trainee by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT * FROM dashboard_trainne WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trainee not found.' });
    }
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('[Dashboard] Fetch single error:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching trainee details.' });
  }
});

module.exports = router;
