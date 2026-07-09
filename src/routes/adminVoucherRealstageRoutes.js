const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/admin/voucher-realstage
// Ambil semua data voucher dengan filter pencarian dan pagination opsional
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM voucher_realstage';
    let countQuery = 'SELECT COUNT(*) FROM voucher_realstage';
    let params = [];
    let countParams = [];

    if (search) {
      const searchStr = `%${search}%`;
      query += ' WHERE no_voucher ILIKE $1 OR nama_trainee ILIKE $1';
      countQuery += ' WHERE no_voucher ILIKE $1 OR nama_trainee ILIKE $1';
      params.push(searchStr);
      countParams.push(searchStr);
    }

    query += ` ORDER BY id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const [result, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, countParams)
    ]);

    const total = parseInt(countResult.rows[0].count, 10);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin vouchers:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data voucher' });
  }
});

// POST /api/admin/voucher-realstage
// Tambah voucher baru
router.post('/', async (req, res) => {
  try {
    const { issue_date, no_voucher, nama_trainee, doc_url } = req.body;
    
    if (!no_voucher || !nama_trainee) {
      return res.status(400).json({ success: false, message: 'no_voucher dan nama_trainee wajib diisi' });
    }

    const result = await db.query(
      'INSERT INTO voucher_realstage (issue_date, no_voucher, nama_trainee, doc_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [issue_date, no_voucher, nama_trainee, doc_url]
    );

    res.status(201).json({ success: true, message: 'Voucher berhasil ditambahkan', data: result.rows[0] });
  } catch (error) {
    console.error('Error adding voucher:', error);
    res.status(500).json({ success: false, message: 'Gagal menambah voucher' });
  }
});

// PUT /api/admin/voucher-realstage/:id
// Edit voucher
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { issue_date, no_voucher, nama_trainee, doc_url } = req.body;

    const result = await db.query(
      'UPDATE voucher_realstage SET issue_date = $1, no_voucher = $2, nama_trainee = $3, doc_url = $4 WHERE id = $5 RETURNING *',
      [issue_date, no_voucher, nama_trainee, doc_url, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Voucher tidak ditemukan' });
    }

    res.json({ success: true, message: 'Voucher berhasil diperbarui', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating voucher:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui voucher' });
  }
});

// DELETE /api/admin/voucher-realstage/:id
// Hapus voucher
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM voucher_realstage WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Voucher tidak ditemukan' });
    }

    res.json({ success: true, message: 'Voucher berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting voucher:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus voucher' });
  }
});

module.exports = router;
