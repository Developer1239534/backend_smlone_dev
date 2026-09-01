const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');
const goldpointSeed = require('../db/goldpointSeed');

// Helper to ensure monthly_gold_point table exists and has seed data
async function ensureAndSeedMonthlyGoldPointTable() {
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

    const countCheck = await db.query('SELECT COUNT(*) FROM monthly_gold_point');
    if (parseInt(countCheck.rows[0].count, 10) === 0 && Array.isArray(goldpointSeed) && goldpointSeed.length > 0) {
      console.log(`[Monthly Gold Point] Auto-seeding ${goldpointSeed.length} records into monthly_gold_point...`);
      for (const row of goldpointSeed) {
        const id                 = String(row['ID']                 || row['id']                 || '');
        const nama_trainee       = String(row['Nama Trainee']       || row['nama_trainee']       || '');
        const active_expired     = String(row['Active/Expired']     || row['active_expired']     || '');
        const level              = String(row['Level']              || row['level']              || '');
        const house              = String(row['House']              || row['house']              || '');
        const class_val          = String(row['Class']              || row['class']              || '');
        const branch             = String(row['Branch']             || row['branch']             || '');
        const total_gold_periode = String(row['Total Gold/Periode'] || row['total_gold_periode'] || '');
        const junior_youth       = String(row['Junior/Youth']       || row['junior_youth']       || '');
        const rank_id            = String(row['RANK/ID']            || row['rank_id']            || '');

        if (!id) continue;

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
               "RANK/ID"            = EXCLUDED."RANK/ID"`,
            [
              id, nama_trainee, active_expired, level, house,
              class_val, branch, total_gold_periode, junior_youth, rank_id
            ]
          );
        } catch (e) {
          // ignore single row error
        }
      }
    }
  } catch (err) {
    console.error('[Monthly Gold Point] Ensure & Seed error:', err.message);
  }
}

// GET /api/monthly-gold-point - Ambil murni data dari tabel monthly_gold_point dengan 10 kolom persis
router.get('/', async (req, res) => {
  try {
    await ensureAndSeedMonthlyGoldPointTable();

    const result = await db.query(`
      SELECT 
        "ID", 
        "Nama Trainee", 
        "Active/Expired", 
        "Level", 
        "House", 
        "Class", 
        "Branch", 
        "Total Gold/Periode", 
        "Junior/Youth", 
        "RANK/ID" 
      FROM monthly_gold_point
    `);

    res.json({
      success: true,
      message: 'Berhasil mengambil data Monthly Gold Point.',
      total: result.rows.length,
      data: result.rows
    });
// GET /api/monthly-gold-point/stream - Real-time SSE Stream
router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ status: 'connected', timestamp: Date.now() })}\n\n`);

  const sendData = async () => {
    try {
      const result = await db.query('SELECT * FROM monthly_gold_point ORDER BY "Total Gold/Periode"::int DESC NULLS LAST LIMIT 100');
      res.write(`data: ${JSON.stringify({ type: 'update', data: result.rows })}\n\n`);
    } catch (e) {
      // fallback if total gold is string
      try {
        const result = await db.query('SELECT * FROM monthly_gold_point LIMIT 100');
        res.write(`data: ${JSON.stringify({ type: 'update', data: result.rows })}\n\n`);
      } catch (err) {}
    }
  };

  sendData();
  const interval = setInterval(sendData, 30000);
  req.on('close', () => clearInterval(interval));
});

// GET /api/monthly-gold-point/:id - Ambil satu trainee dari monthly_gold_point
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await ensureAndSeedMonthlyGoldPointTable();
    const result = await db.query(
      'SELECT * FROM monthly_gold_point WHERE "ID" = $1 OR "ID" ILIKE $1 LIMIT 1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Monthly Gold Point dengan ID: ${id} tidak ditemukan.`
      });
    }

    const row = result.rows[0];
    res.json({
      success: true,
      message: `Berhasil mengambil data Monthly Gold Point ID ${id}.`,
      data: row,
      id: row["ID"],
      ID: row["ID"],
      nama_trainee: row["Nama Trainee"],
      "Nama Trainee": row["Nama Trainee"],
      total_gold: row["Total Gold/Periode"],
      total_gold_periode: row["Total Gold/Periode"],
      "Total Gold/Periode": row["Total Gold/Periode"],
      level: row["Level"],
      Level: row["Level"],
      house: row["House"],
      House: row["House"],
      class: row["Class"],
      Class: row["Class"],
      branch: row["Branch"],
      Branch: row["Branch"],
      rank: row["RANK/ID"],
      rank_id: row["RANK/ID"],
      "RANK/ID": row["RANK/ID"]
    });
  } catch (error) {
    console.error('[Monthly Gold Point] GET :id error:', error.message);
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
    await ensureAndSeedMonthlyGoldPointTable();

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

// DELETE /truncate - Kosongkan seluruh tabel monthly_gold_point
router.delete('/truncate', async (req, res) => {
  try {
    await db.query('TRUNCATE TABLE monthly_gold_point');
    res.json({ success: true, message: 'Seluruh isi tabel monthly_gold_point berhasil dikosongkan.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengosongkan tabel.', error: error.message });
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
