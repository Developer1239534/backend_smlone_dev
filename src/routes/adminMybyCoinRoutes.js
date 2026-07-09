const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET all myby coin balances
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM myby_coin ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[Admin MYBY Coin] GET error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT - Update myby coin balances manually
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { myby_balance, gp_balance } = req.body;

  try {
    const check = await db.query('SELECT 1 FROM myby_coin WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Wallet untuk ID ${id} tidak ditemukan.` });
    }

    const updateFields = [];
    const values = [];
    let valueCount = 1;

    if (myby_balance !== undefined) {
      updateFields.push(`myby_balance = $${valueCount++}`);
      values.push(myby_balance);
    }
    
    if (gp_balance !== undefined) {
      updateFields.push(`gp_balance = $${valueCount++}`);
      values.push(gp_balance);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data untuk diupdate.' });
    }

    // Always update timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    values.push(id);
    const query = `UPDATE myby_coin SET ${updateFields.join(', ')} WHERE id = $${valueCount} RETURNING *`;
    
    const result = await db.query(query, values);
    res.json({ success: true, message: 'Saldo berhasil diperbarui.', data: result.rows[0] });
  } catch (err) {
    console.error('[Admin MYBY Coin] PUT error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
