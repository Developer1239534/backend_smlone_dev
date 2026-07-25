const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET all house rankings
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM house_rank ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[Admin House Rank] GET error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST - Create new house rank record
router.post('/', async (req, res) => {
  const { 
    periode, total_gold_house, rank, class: className, cabang, program, 
    rank_junior, rank_youth, rank_junior_timor, rank_youth_timor, 
    rank_junior_tritura, rank_youth_tritura, rank_junior_cemara, 
    rank_youth_cemara, house_name 
  } = req.body;

  if (!periode || !house_name) {
    return res.status(400).json({ success: false, message: 'Periode dan House Name wajib diisi.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO house_rank (
        periode, total_gold_house, rank, class, cabang, program, 
        rank_junior, rank_youth, rank_junior_timor, rank_youth_timor, 
        rank_junior_tritura, rank_youth_tritura, rank_junior_cemara, 
        rank_youth_cemara, house_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [
        periode, total_gold_house, rank, className, cabang, program, 
        rank_junior, rank_youth, rank_junior_timor, rank_youth_timor, 
        rank_junior_tritura, rank_youth_tritura, rank_junior_cemara, 
        rank_youth_cemara, house_name
      ]
    );
    res.status(201).json({ success: true, message: 'Berhasil ditambahkan.', data: result.rows[0] });
  } catch (err) {
    console.error('[Admin House Rank] POST error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT - Update house rank record
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    periode, total_gold_house, rank, class: className, cabang, program, 
    rank_junior, rank_youth, rank_junior_timor, rank_youth_timor, 
    rank_junior_tritura, rank_youth_tritura, rank_junior_cemara, 
    rank_youth_cemara, house_name 
  } = req.body;

  try {
    const check = await db.query('SELECT 1 FROM house_rank WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }

    const result = await db.query(
      `UPDATE house_rank SET 
        periode = $1, total_gold_house = $2, rank = $3, class = $4, cabang = $5, program = $6, 
        rank_junior = $7, rank_youth = $8, rank_junior_timor = $9, rank_youth_timor = $10, 
        rank_junior_tritura = $11, rank_youth_tritura = $12, rank_junior_cemara = $13, 
        rank_youth_cemara = $14, house_name = $15
      WHERE id = $16 RETURNING *`,
      [
        periode, total_gold_house, rank, className, cabang, program, 
        rank_junior, rank_youth, rank_junior_timor, rank_youth_timor, 
        rank_junior_tritura, rank_youth_tritura, rank_junior_cemara, 
        rank_youth_cemara, house_name, id
      ]
    );
    res.json({ success: true, message: 'Berhasil diperbarui.', data: result.rows[0] });
  } catch (err) {
    console.error('[Admin House Rank] PUT error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE - Delete house rank record
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM house_rank WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Berhasil dihapus.', data: result.rows[0] });
  } catch (err) {
    console.error('[Admin House Rank] DELETE error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
