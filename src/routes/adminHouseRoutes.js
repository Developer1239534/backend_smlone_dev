const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET all houses
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM houses ORDER BY id ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[Admin Houses] GET error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST - Create new house
router.post('/', async (req, res) => {
  const { id, name, description, core_value } = req.body;

  if (!id || !name) {
    return res.status(400).json({ success: false, message: 'ID dan Name wajib diisi.' });
  }

  try {
    const check = await db.query('SELECT 1 FROM houses WHERE id = $1', [id]);
    if (check.rows.length > 0) {
      return res.status(409).json({ success: false, message: `House dengan ID ${id} sudah ada.` });
    }

    const result = await db.query(
      `INSERT INTO houses (id, name, description, core_value) VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, name, description || null, core_value || null]
    );
    res.status(201).json({ success: true, message: 'Berhasil ditambahkan.', data: result.rows[0] });
  } catch (err) {
    console.error('[Admin Houses] POST error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT - Update house
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, core_value } = req.body;

  try {
    const check = await db.query('SELECT 1 FROM houses WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }

    const result = await db.query(
      `UPDATE houses SET name = $1, description = $2, core_value = $3 WHERE id = $4 RETURNING *`,
      [name, description, core_value, id]
    );
    res.json({ success: true, message: 'Berhasil diperbarui.', data: result.rows[0] });
  } catch (err) {
    console.error('[Admin Houses] PUT error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE - Delete house
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM houses WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Berhasil dihapus.', data: result.rows[0] });
  } catch (err) {
    console.error('[Admin Houses] DELETE error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
