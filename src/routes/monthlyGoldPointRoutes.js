const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// Helper to ensure monthly_gold_point table exists
async function ensureMonthlyGoldPointTable() {
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

    // Check if table is empty, if so populate from goldpoint_trainee if available
    const countCheck = await db.query('SELECT COUNT(*) FROM monthly_gold_point');
    if (parseInt(countCheck.rows[0].count, 10) === 0) {
      try {
        await db.query(`
          INSERT INTO monthly_gold_point ("ID", "Nama Trainee", "Active/Expired", "Level", "House", "Class", "Branch", "Total Gold/Periode", "Junior/Youth", "RANK/ID")
          SELECT DISTINCT ON (trainee_id) 
            trainee_id AS "ID",
            COALESCE(trainee_name, nama_trainee) AS "Nama Trainee",
            COALESCE(membership_status, status) AS "Active/Expired",
            level AS "Level",
            house AS "House",
            COALESCE(class_name, class) AS "Class",
            branch AS "Branch",
            CAST(COALESCE(total_gold, total_gold_periode, gp_month, 0) AS TEXT) AS "Total Gold/Periode",
            COALESCE(program, kategori, junior_youth) AS "Junior/Youth",
            CAST(COALESCE(ranking, rank, 0) AS TEXT) AS "RANK/ID"
          FROM goldpoint_trainee
          ON CONFLICT ("ID") DO NOTHING
        `);
      } catch (copyErr) {
        console.warn('[Monthly Gold Point] Could not populate from goldpoint_trainee:', copyErr.message);
      }
    }
  } catch (err) {
    console.error('[Monthly Gold Point] Table initialization error:', err.message);
  }
}

// GET / - Ambil semua data monthly_gold_point (dengan deduplikasi ID otomatis)
router.get('/', async (req, res) => {
  try {
    await ensureMonthlyGoldPointTable();

    let result;
    try {
      result = await db.query('SELECT * FROM monthly_gold_point');
    } catch (tblErr) {
      // Fallback query from goldpoint_trainee if monthly_gold_point still fails
      result = await db.query('SELECT * FROM goldpoint_trainee');
    }
    
    // Deduplicate by ID and sort descending by GP
    const uniqueMap = new Map();
    for (const row of result.rows) {
      const id = row['ID'] || row.id || row.trainee_id;
      if (!id) continue;

      const name = row['Nama Trainee'] || row.nama_trainee || row.trainee_name;
      const status = row['Active/Expired'] || row.status || row.membership_status;
      const level = row['Level'] || row.level;
      const house = row['House'] || row.house;
      const class_val = row['Class'] || row.class || row.class_name;
      const branch = row['Branch'] || row.branch;
      const gold = parseInt(row['Total Gold/Periode'] || row.total_gold || row.gp_month || row.total_gold_periode || '0', 10);
      const category = row['Junior/Youth'] || row.kategori || row.program || row.junior_youth;
      const rank = row['RANK/ID'] || row.rank || row.ranking;

      const normalizedRow = {
        ID: String(id),
        id: String(id),
        'Nama Trainee': name,
        nama_trainee: name,
        trainee_name: name,
        'Active/Expired': status,
        status: status,
        membership_status: status,
        Level: level,
        level: level,
        House: house,
        house: house,
        Class: class_val,
        class: class_val,
        class_name: class_val,
        Branch: branch,
        branch: branch,
        'Total Gold/Periode': String(gold),
        total_gold: gold,
        gp_month: gold,
        total_gold_periode: gold,
        'Junior/Youth': category,
        kategori: category,
        junior_youth: category,
        program: category,
        'RANK/ID': rank,
        rank: rank,
        ranking: rank
      };

      if (!uniqueMap.has(String(id))) {
        uniqueMap.set(String(id), normalizedRow);
      } else {
        const existingGold = uniqueMap.get(String(id)).total_gold;
        if (gold > existingGold) {
          uniqueMap.set(String(id), normalizedRow);
        }
      }
    }

    const sortedRows = Array.from(uniqueMap.values()).sort((a, b) => b.total_gold - a.total_gold);

    res.json({
      success: true,
      message: 'Berhasil mengambil data Monthly Gold Point.',
      total: sortedRows.length,
      data: sortedRows
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
    await ensureMonthlyGoldPointTable();

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

// DELETE /:id - Hapus data berdasarkan ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await ensureMonthlyGoldPointTable();
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
