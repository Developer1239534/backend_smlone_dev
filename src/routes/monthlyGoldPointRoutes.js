const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET /api/monthly-gold-point - Ambil murni data dari tabel monthly_gold_point saja
router.get('/', async (req, res) => {
  try {
    // Pastikan tabel monthly_gold_point ada
    await db.query(`
      CREATE TABLE IF NOT EXISTS monthly_gold_point (
        "ID" TEXT PRIMARY KEY,
        "Nama Trainee" TEXT,
        "Active/Expired" TEXT,
        "Level" TEXT,
        "House" TEXT,
        "Class" TEXT,
        "Branch" TEXT,
        "Total Gold/Periode" TEXT,
        "Junior/Youth" TEXT,
        "RANK/ID" TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await db.query('SELECT * FROM monthly_gold_point');

    res.json({
      success: true,
      message: 'Berhasil mengambil data Monthly Gold Point.',
      total: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('[Monthly Gold Point] GET error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dari database.',
      error: error.message
    });
  }
});

// POST /push - Terima dan simpan data dari n8n / Google Sheets (bulk upsert ke monthly_gold_point)
router.post('/push', async (req, res) => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS monthly_gold_point (
        "ID" TEXT PRIMARY KEY,
        "Nama Trainee" TEXT,
        "Active/Expired" TEXT,
        "Level" TEXT,
        "House" TEXT,
        "Class" TEXT,
        "Branch" TEXT,
        "Total Gold/Periode" TEXT,
        "Junior/Youth" TEXT,
        "RANK/ID" TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    let data = req.body;
    if (!Array.isArray(data)) {
      data = [data];
    }

    if (data.length === 0) {
      return res.status(400).json({ success: false, message: 'Data kosong.' });
    }

    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors = [];

    console.log(`[Monthly Gold Point Push] Received ${data.length} items`);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      if (!row || typeof row !== 'object') {
        skippedCount++;
        continue;
      }

      const id                 = String(row['ID']                 ?? row['id']                 ?? row['trainee_id'] ?? '');
      const nama_trainee       = String(row['Nama Trainee']       ?? row['nama_trainee']       ?? row['trainee_name'] ?? '');
      const active_expired     = String(row['Active/Expired']     ?? row['active_expired']     ?? row['status'] ?? '');
      const level              = String(row['Level']              ?? row['level']              ?? '');
      const house              = String(row['House']              ?? row['house']              ?? '');
      const class_val          = String(row['Class']              ?? row['class']              ?? row['class_name'] ?? '');
      const branch             = String(row['Branch']             ?? row['branch']             ?? '');
      const total_gold_periode = String(row['Total Gold/Periode'] ?? row['total_gold_periode'] ?? row['gp_month'] ?? row['total_gold'] ?? '');
      const junior_youth       = String(row['Junior/Youth']       ?? row['junior_youth']       ?? row['kategori'] ?? row['program'] ?? '');
      const rank_id            = String(row['RANK/ID']            ?? row['rank_id']            ?? row['rank'] ?? '');

      if (!id) {
        skippedCount++;
        continue;
      }

      try {
        await db.query(
          `INSERT INTO monthly_gold_point (
             "ID", "Nama Trainee", "Active/Expired", "Level", "House",
             "Class", "Branch", "Total Gold/Periode", "Junior/Youth", "RANK/ID"
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT ("ID") DO UPDATE SET
             "Nama Trainee"       = EXCLUDED."Nama Trainee",
             "Active/Expired"     = EXCLUDED."Active/Expired",
             "Level"              = EXCLUDED."Level",
             "House"              = EXCLUDED."House",
             "Class"              = EXCLUDED."Class",
             "Branch"             = EXCLUDED."Branch",
             "Total Gold/Periode" = EXCLUDED."Total Gold/Periode",
             "Junior/Youth"       = EXCLUDED."Junior/Youth",
             "RANK/ID"            = EXCLUDED."RANK/ID",
             updated_at           = CURRENT_TIMESTAMP`,
          [
            id, nama_trainee, active_expired, level, house,
            class_val, branch, total_gold_periode, junior_youth, rank_id
          ]
        );
        insertedCount++;
      } catch (rowError) {
        errorCount++;
        errors.push({ index: i, id, error: rowError.message });
      }
    }

    res.json({
      success: true,
      message: `Berhasil menyimpan/mengupdate ${insertedCount} data ke Monthly Gold Point, ${skippedCount} di-skip, ${errorCount} error.`,
      details: { insertedCount, skippedCount, errorCount, errors: errors.slice(0, 10) }
    });

  } catch (error) {
    console.error('[Monthly Gold Point Push] Fatal error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi error saat menyimpan data.',
      error: error.message
    });
  }
});

// DELETE /:id - Hapus data berdasarkan ID dari monthly_gold_point
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM monthly_gold_point WHERE "ID" = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Tidak ada data Monthly Gold Point dengan ID: ${id}` });
    }
    res.json({ success: true, message: `Data Monthly Gold Point ID ${id} berhasil dihapus.`, deleted: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus data.', error: error.message });
  }
});

module.exports = router;
