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

// POST / - Create a new house rank record (Supports Single Object OR Array Batch Insert)
router.post('/', async (req, res) => {
  try {
    const bodyData = req.body?.data || req.body?.items || req.body;

    if (!bodyData) {
      return res.status(400).json({
        success: false,
        message: 'Request body tidak boleh kosong.'
      });
    }

    // Handle Array / Batch Insert
    if (Array.isArray(bodyData)) {
      if (bodyData.length === 0) {
        return res.status(400).json({ success: false, message: 'Array data tidak boleh kosong.' });
      }

      // Optional: Clear existing data when syncing full batch list
      const replaceMode = req.query.replace === 'true' || req.body?.replace === true;
      if (replaceMode) {
        await db.query('TRUNCATE TABLE house_rank;');
      }

      const inserted = [];
      for (const item of bodyData) {
        const namaHouse = item['Nama House'] || item.nama_house || item.namaHouse || item.house_name;
        const totalGold = item['Total Gold'] ?? item.total_gold ?? item.totalGold ?? 0;
        const className = item['Class'] || item.class || item.className || null;
        const cabang = item['Cabang'] || item.cabang || null;
        const program = item['Program'] || item.program || null;
        const rank = item['Rank'] ?? item.rank ?? null;

        if (namaHouse) {
          const insertQuery = `
            INSERT INTO house_rank (
              "Nama House", "Total Gold", "Class", "Cabang", "Program", "Rank"
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING "Nama House", "Total Gold", "Class", "Cabang", "Program", "Rank"
          `;
          const resQuery = await db.query(insertQuery, [
            namaHouse,
            totalGold,
            className,
            cabang,
            program,
            rank
          ]);
          inserted.push(resQuery.rows[0]);
        }
      }

      return res.status(201).json({
        success: true,
        message: `Berhasil menambahkan ${inserted.length} data house_rank.`,
        count: inserted.length,
        data: inserted
      });
    }

    // Handle Single Object Insert
    const namaHouse = bodyData['Nama House'] || bodyData.nama_house || bodyData.namaHouse || bodyData.house_name;
    const totalGold = bodyData['Total Gold'] ?? bodyData.total_gold ?? bodyData.totalGold ?? 0;
    const className = bodyData['Class'] || bodyData.class || bodyData.className || null;
    const cabang = bodyData['Cabang'] || bodyData.cabang || null;
    const program = bodyData['Program'] || bodyData.program || null;
    const rank = bodyData['Rank'] ?? bodyData.rank ?? null;

    if (!namaHouse) {
      return res.status(400).json({
        success: false,
        message: 'Field "Nama House" wajib diisi.'
      });
    }

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
  try {
    const body = req.body || {};
    const targetNamaHouse = req.query.nama_house || body.target_nama_house || body['Nama House'] || body.nama_house;
    
    const namaHouse = body['Nama House'] || body.nama_house || targetNamaHouse;
    const totalGold = body['Total Gold'] ?? body.total_gold;
    const className = body['Class'] || body.class;
    const cabang = body['Cabang'] || body.cabang;
    const program = body['Program'] || body.program;
    const rank = body['Rank'] ?? body.rank;

    if (!targetNamaHouse) {
      return res.status(400).json({ success: false, message: 'Harap tentukan "Nama House" yang ingin diupdate.' });
    }

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
  try {
    const body = req.body || {};
    const namaHouse = req.query.nama_house || body['Nama House'] || body.nama_house;

    if (!namaHouse) {
      return res.status(400).json({ success: false, message: 'Harap sertakan parameter nama_house yang ingin dihapus.' });
    }

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
