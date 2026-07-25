const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');
const verifyToken = require('../middleware/authMiddleware');

// ========================================================
// PUBLIC GET (Portal & Admin)
// ========================================================
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM whatsapp_contacts ORDER BY id ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[WhatsApp API] GET Contacts error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ========================================================
// PROTECTED ROUTES (Admin Only)
// ========================================================

// POST - Create contact
router.post('/', verifyToken, async (req, res) => {
  const { cabang, nama_admin, nomor_wa, image_url } = req.body;
  if (!cabang || !nama_admin || !nomor_wa) {
    return res.status(400).json({ success: false, message: 'Cabang, Nama Admin, dan Nomor WA wajib diisi.' });
  }
  
  try {
    const result = await db.query(
      `INSERT INTO whatsapp_contacts (cabang, nama_admin, nomor_wa, image_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [cabang, nama_admin, nomor_wa, image_url || null]
    );
    res.status(201).json({ success: true, message: 'Kontak WhatsApp berhasil ditambahkan.', data: result.rows[0] });
  } catch (err) {
    console.error('[WhatsApp API] POST Contact error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PUT - Edit contact
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { cabang, nama_admin, nomor_wa, image_url } = req.body;
  
  if (!cabang || !nama_admin || !nomor_wa) {
    return res.status(400).json({ success: false, message: 'Cabang, Nama Admin, dan Nomor WA wajib diisi.' });
  }

  try {
    const check = await db.query('SELECT 1 FROM whatsapp_contacts WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Kontak WhatsApp tidak ditemukan.' });
    }

    const result = await db.query(
      `UPDATE whatsapp_contacts 
       SET cabang = $1, nama_admin = $2, nomor_wa = $3, image_url = $4
       WHERE id = $5 RETURNING *`,
      [cabang, nama_admin, nomor_wa, image_url || null, id]
    );
    res.json({ success: true, message: 'Kontak WhatsApp berhasil diperbarui.', data: result.rows[0] });
  } catch (err) {
    console.error('[WhatsApp API] PUT Contact error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// DELETE - Delete contact
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM whatsapp_contacts WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Kontak WhatsApp tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Kontak WhatsApp berhasil dihapus.', data: result.rows[0] });
  } catch (err) {
    console.error('[WhatsApp API] DELETE Contact error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
