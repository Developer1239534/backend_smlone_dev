const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET / - Retrieve all house rank records
router.get('/', async (req, res) => {
  try {
    const { search, cabang, program, house } = req.query;
    let query = 'SELECT "Nama House", "Total Gold", "Class", "Cabang", "Program", "Rank" FROM house_rank WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND ("Nama House" ILIKE $${params.length} OR "Class" ILIKE $${params.length})`;
    }
    if (house) {
      params.push(house);
      query += ` AND "Nama House" = $${params.length}`;
    }
    if (cabang) {
      params.push(cabang);
      query += ` AND "Cabang" = $${params.length}`;
    }
    if (program) {
      params.push(program);
      query += ` AND "Program" = $${params.length}`;
    }

    query += ' ORDER BY "Rank" ASC NULLS LAST, "Total Gold" DESC';

    const result = await db.query(query, params);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error('[House Rank] GET Error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data house_rank', error: err.message });
  }
});

// POST / - Create a new house rank record
router.post('/', async (req, res) => {
  const namaHouse = req.body['Nama House'] || req.body.nama_house || req.body.namaHouse || req.body.house_name;
  const totalGold = req.body['Total Gold'] ?? req.body.total_gold ?? req.body.totalGold ?? 0;
  const className = req.body['Class'] || req.body.class || req.body.className || null;
  const cabang = req.body['Cabang'] || req.body.cabang || null;
  const program = req.body['Program'] || req.body.program || null;
  const rank = req.body['Rank'] ?? req.body.rank ?? null;

  if (!namaHouse) {
    return res.status(400).json({
      success: false,
      message: 'Field "Nama House" wajib diisi.'
    });
  }

  try {
    const insertQuery = `
      INSERT INTO house_rank (
        "Nama House", "Total Gold", "Class", "Cabang", "Program", "Rank"
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING "Nama House", "Total Gold", "Class", "Cabang", "Program", "Rank"
    `;
    const result = await db.query(insertQuery, [
      namaHouse,
      totalGold,
      className,
      cabang,
      program,
      rank
    ]);

    res.status(201).json({
      success: true,
      message: 'Data house_rank berhasil ditambahkan.',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('[House Rank] POST Error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal menambahkan data house_rank', error: err.message });
  }
});

// PUT / - Update house rank record based on "Nama House"
router.put('/', async (req, res) => {
  const targetNamaHouse = req.query.nama_house || req.body.target_nama_house || req.body['Nama House'] || req.body.nama_house;
  
  const namaHouse = req.body['Nama House'] || req.body.nama_house || targetNamaHouse;
  const totalGold = req.body['Total Gold'] ?? req.body.total_gold;
  const className = req.body['Class'] || req.body.class;
  const cabang = req.body['Cabang'] || req.body.cabang;
  const program = req.body['Program'] || req.body.program;
  const rank = req.body['Rank'] ?? req.body.rank;

  if (!targetNamaHouse) {
    return res.status(400).json({ success: false, message: 'Harap tentukan "Nama House" yang ingin diupdate.' });
  }

  try {
    const check = await db.query('SELECT 1 FROM house_rank WHERE "Nama House" = $1', [targetNamaHouse]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Data house_rank dengan Nama House "${targetNamaHouse}" tidak ditemukan.` });
    }

    const updateQuery = `
      UPDATE house_rank SET
        "Nama House" = COALESCE($1, "Nama House"),
        "Total Gold" = COALESCE($2, "Total Gold"),
        "Class" = COALESCE($3, "Class"),
        "Cabang" = COALESCE($4, "Cabang"),
        "Program" = COALESCE($5, "Program"),
        "Rank" = COALESCE($6, "Rank")
      WHERE "Nama House" = $7
      RETURNING "Nama House", "Total Gold", "Class", "Cabang", "Program", "Rank"
    `;
    const result = await db.query(updateQuery, [
      namaHouse,
      totalGold,
      className,
      cabang,
      program,
      rank,
      targetNamaHouse
    ]);

    res.json({
      success: true,
      message: 'Data house_rank berhasil diperbarui.',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('[House Rank] PUT Error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal memperbarui data house_rank', error: err.message });
  }
});

// DELETE / - Delete house rank record based on "Nama House"
router.delete('/', async (req, res) => {
  const namaHouse = req.query.nama_house || req.body['Nama House'] || req.body.nama_house;

  if (!namaHouse) {
    return res.status(400).json({ success: false, message: 'Harap sertakan parameter nama_house yang ingin dihapus.' });
  }

  try {
    const result = await db.query('DELETE FROM house_rank WHERE "Nama House" = $1 RETURNING *', [namaHouse]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Data house_rank dengan Nama House "${namaHouse}" tidak ditemukan.` });
    }
    res.json({
      success: true,
      message: `Data house_rank "${namaHouse}" berhasil dihapus.`,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('[House Rank] DELETE Error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal menghapus data house_rank', error: err.message });
  }
});

module.exports = router;
