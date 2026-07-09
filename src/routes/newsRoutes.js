const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');
const verifyToken = require('../middleware/authMiddleware');

// ========================================================
// PUBLIC GET (Portal & Admin)
// ========================================================
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM news_announcements ORDER BY id DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[News API] GET News error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ========================================================
// PROTECTED ROUTES (Admin Only)
// ========================================================

// POST - Create news
router.post('/', verifyToken, async (req, res) => {
  const { category, title, date_string, time_string, description, contacts, image_url } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: 'Title wajib diisi.' });
  }
  
  try {
    const result = await db.query(
      `INSERT INTO news_announcements (category, title, date_string, time_string, description, contacts, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [category, title, date_string, time_string, description, contacts, image_url]
    );
    res.status(201).json({ success: true, message: 'Berita berhasil ditambahkan.', data: result.rows[0] });
  } catch (err) {
    console.error('[News API] POST News error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PUT - Edit news
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { category, title, date_string, time_string, description, contacts, image_url } = req.body;
  
  if (!title) {
    return res.status(400).json({ success: false, message: 'Title wajib diisi.' });
  }

  try {
    const check = await db.query('SELECT 1 FROM news_announcements WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Berita tidak ditemukan.' });
    }

    const result = await db.query(
      `UPDATE news_announcements 
       SET category = $1, title = $2, date_string = $3, time_string = $4, description = $5, contacts = $6, image_url = $7
       WHERE id = $8 RETURNING *`,
      [category, title, date_string, time_string, description, contacts, image_url, id]
    );
    res.json({ success: true, message: 'Berita berhasil diperbarui.', data: result.rows[0] });
  } catch (err) {
    console.error('[News API] PUT News error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// DELETE - Delete news
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM news_announcements WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Berita tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Berita berhasil dihapus.', data: result.rows[0] });
  } catch (err) {
    console.error('[News API] DELETE News error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
