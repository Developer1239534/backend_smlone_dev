const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/voucher-realstage
// Mengambil data voucher. Bisa filter berdasarkan pencarian.
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = 'SELECT * FROM voucher_realstage';
    let params = [];
    
    if (search) {
      query += ' WHERE no_voucher ILIKE $1 OR nama_trainee ILIKE $1';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY id ASC';
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data voucher real stage'
    });
  }
});

module.exports = router;
