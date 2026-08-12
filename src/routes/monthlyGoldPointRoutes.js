const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET / - Ambil semua data monthly_gold_point
router.get('/', async (req, res) => {
  try {
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

// POST /push - Terima dan simpan data dari n8n / Google Sheets (bulk upsert)
router.post('/push', async (req, res) => {
  try {
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
        console.warn(`[Monthly Gold Point Push] Skipping invalid row at index ${i}`);
        skippedCount++;
        continue;
      }

      // Map exact keys from payload
      const id                 = String(row['ID']                 ?? row['id']                 ?? '');
      const nama_trainee       = String(row['Nama Trainee']       ?? row['nama_trainee']       ?? '');
      const active_expired     = String(row['Active/Expired']     ?? row['active_expired']     ?? '');
      const level              = String(row['Level']              ?? row['level']              ?? '');
      const house              = String(row['House']              ?? row['house']              ?? '');
      const class_val          = String(row['Class']              ?? row['class']              ?? '');
      const branch             = String(row['Branch']             ?? row['branch']             ?? '');
      const total_gold_periode = String(row['Total Gold/Periode'] ?? row['total_gold_periode'] ?? '');
      const junior_youth       = String(row['Junior/Youth']       ?? row['junior_youth']       ?? '');
      const rank_id            = String(row['RANK/ID']            ?? row['rank_id']            ?? '');

      if (!id) {
        console.warn(`[Monthly Gold Point Push] Skipping row ${i}: missing ID`);
        skippedCount++;
        continue;
      }

      try {
        await db.query(
          `INSERT INTO monthly_gold_point (
             "ID", "Nama Trainee", "Active/Expired", "Level", "House",
             "Class", "Branch", "Total Gold/Periode", "Junior/Youth", "RANK/ID"
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            id, nama_trainee, active_expired, level, house,
            class_val, branch, total_gold_periode, junior_youth, rank_id
          ]
        );
        insertedCount++;
      } catch (rowError) {
        try {
          await db.query(
            `UPDATE monthly_gold_point SET
               "Nama Trainee"       = $2,
               "Active/Expired"     = $3,
               "Level"              = $4,
               "House"              = $5,
               "Class"              = $6,
               "Branch"             = $7,
               "Total Gold/Periode" = $8,
               "Junior/Youth"       = $9,
               "RANK/ID"            = $10
             WHERE "ID" = $1`,
            [
              id, nama_trainee, active_expired, level, house,
              class_val, branch, total_gold_periode, junior_youth, rank_id
            ]
          );
          insertedCount++;
        } catch (updateError) {
          errorCount++;
          errors.push({
            index: i,
            id,
            error: updateError.message
          });
          console.error(`[Monthly Gold Point Push] Error row ${i} (id: ${id}):`, updateError.message);
        }
      }
    }

    console.log(`[Monthly Gold Point Push] Done: inserted=${insertedCount}, skipped=${skippedCount}, errors=${errorCount}`);

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

// DELETE /:id - Hapus data berdasarkan ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'DELETE FROM monthly_gold_point WHERE "ID" = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Tidak ada data Monthly Gold Point dengan ID: ${id}`
      });
    }
    res.json({
      success: true,
      message: `Data Monthly Gold Point ID ${id} berhasil dihapus.`,
      deleted: result.rows[0]
    });
  } catch (error) {
    console.error('[Monthly Gold Point] DELETE error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data.',
      error: error.message
    });
  }
});

module.exports = router;
