const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET all monthly gold points
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM gp_month ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[Admin GP Month] GET error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST - Create new monthly gold point record
router.post('/', async (req, res) => {
  const { 
    periode, total_gold_periode, rank_id_junior, rank_id_youth, rank_id_junior_timor, 
    trainee_id, rank_id_junior_tritura, rank_id_youth_tritura, rank_id_junior_cemara, 
    rank_id_youth_cemara, rank_id_youth_timor 
  } = req.body;

  if (!trainee_id || !periode) {
    return res.status(400).json({ success: false, message: 'Trainee ID dan Periode wajib diisi.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO gp_month (
        periode, total_gold_periode, rank_id_junior, rank_id_youth, rank_id_junior_timor, 
        trainee_id, rank_id_junior_tritura, rank_id_youth_tritura, rank_id_junior_cemara, 
        rank_id_youth_cemara, rank_id_youth_timor
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        periode, total_gold_periode, rank_id_junior, rank_id_youth, rank_id_junior_timor, 
        trainee_id, rank_id_junior_tritura, rank_id_youth_tritura, rank_id_junior_cemara, 
        rank_id_youth_cemara, rank_id_youth_timor
      ]
    );
    res.status(201).json({ success: true, message: 'Berhasil ditambahkan.', data: result.rows[0] });
  } catch (err) {
    console.error('[Admin GP Month] POST error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT - Update monthly gold point record
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    periode, total_gold_periode, rank_id_junior, rank_id_youth, rank_id_junior_timor, 
    trainee_id, rank_id_junior_tritura, rank_id_youth_tritura, rank_id_junior_cemara, 
    rank_id_youth_cemara, rank_id_youth_timor 
  } = req.body;

  try {
    const check = await db.query('SELECT 1 FROM gp_month WHERE trainee_id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }

    const result = await db.query(
      `UPDATE gp_month SET 
        periode = COALESCE($1, periode), 
        total_gold_periode = COALESCE($2, total_gold_periode), 
        rank_id_junior = COALESCE($3, rank_id_junior), 
        rank_id_youth = COALESCE($4, rank_id_youth), 
        rank_id_junior_timor = COALESCE($5, rank_id_junior_timor), 
        trainee_id = COALESCE($6, trainee_id), 
        rank_id_junior_tritura = COALESCE($7, rank_id_junior_tritura), 
        rank_id_youth_tritura = COALESCE($8, rank_id_youth_tritura), 
        rank_id_junior_cemara = COALESCE($9, rank_id_junior_cemara), 
        rank_id_youth_cemara = COALESCE($10, rank_id_youth_cemara), 
        rank_id_youth_timor = COALESCE($11, rank_id_youth_timor)
      WHERE trainee_id = $12 RETURNING *`,
      [
        periode !== undefined ? periode : null, 
        total_gold_periode !== undefined ? total_gold_periode : null, 
        rank_id_junior !== undefined ? rank_id_junior : null, 
        rank_id_youth !== undefined ? rank_id_youth : null, 
        rank_id_junior_timor !== undefined ? rank_id_junior_timor : null, 
        trainee_id !== undefined ? trainee_id : null, 
        rank_id_junior_tritura !== undefined ? rank_id_junior_tritura : null, 
        rank_id_youth_tritura !== undefined ? rank_id_youth_tritura : null, 
        rank_id_junior_cemara !== undefined ? rank_id_junior_cemara : null, 
        rank_id_youth_cemara !== undefined ? rank_id_youth_cemara : null, 
        rank_id_youth_timor !== undefined ? rank_id_youth_timor : null, 
        id
      ]
    );
    res.json({ success: true, message: 'Berhasil diperbarui.', data: result.rows[0] });
  } catch (err) {
    console.error('[Admin GP Month] PUT error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE - Delete monthly gold point record
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM gp_month WHERE trainee_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Berhasil dihapus.', data: result.rows[0] });
  } catch (err) {
    console.error('[Admin GP Month] DELETE error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
