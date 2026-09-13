const express = require('express');
const router = express.Router();
const db = require('../../db/neonClient');

/**
 * ============================================================
 * ROUTE: ID Gold Point / Monthly Gold Point
 * HANYA 13 Kolom Resmi Sesuai Permintaan:
 * 1. ID (Primary Key)
 * 2. Nama Trainee
 * 3. Active/Expired
 * 4. Level
 * 5. House
 * 6. Class
 * 7. Branch
 * 8. Total Gold/Periode
 * 9. Core/Orator
 * 10. RANK/ID/Core
 * 11. RANK/ID/Orator
 * 12. RANK/ID/Core/Cemara
 * 13. RANK/ID/Orator/CEMARA
 * ============================================================
 */

// Helper to ensure monthly_gold_point table exists with strictly and only the 13 columns
async function ensureMonthlyGoldPointTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS monthly_gold_point (
        "ID"                    VARCHAR(255) PRIMARY KEY,
        "Nama Trainee"          VARCHAR(255),
        "Active/Expired"        VARCHAR(100),
        "Level"                 VARCHAR(100),
        "House"                 VARCHAR(100),
        "Class"                 VARCHAR(100),
        "Branch"                VARCHAR(100),
        "Total Gold/Periode"    VARCHAR(100),
        "Core/Orator"           VARCHAR(100),
        "RANK/ID/Core"          VARCHAR(255),
        "RANK/ID/Orator"        VARCHAR(255),
        "RANK/ID/Core/Cemara"   VARCHAR(255),
        "RANK/ID/Orator/CEMARA" VARCHAR(255)
      );
    `);
  } catch (err) {
    console.error('[Monthly Gold Point] Ensure table error:', err.message);
  }
}

// Format row untuk menghasilkan 13 kolom resmi dan alias kompatibilitas frontend
function formatGoldPointRow(row) {
  return {
    "ID": row["ID"] ?? '',
    "Nama Trainee": row["Nama Trainee"] ?? '',
    "Active/Expired": row["Active/Expired"] ?? '',
    "Level": row["Level"] ?? '',
    "House": row["House"] ?? '',
    "Class": row["Class"] ?? '',
    "Branch": row["Branch"] ?? '',
    "Total Gold/Periode": row["Total Gold/Periode"] ?? '0',
    "Core/Orator": row["Core/Orator"] ?? '',
    "RANK/ID/Core": row["RANK/ID/Core"] ?? '',
    "RANK/ID/Orator": row["RANK/ID/Orator"] ?? '',
    "RANK/ID/Core/Cemara": row["RANK/ID/Core/Cemara"] ?? '',
    "RANK/ID/Orator/CEMARA": row["RANK/ID/Orator/CEMARA"] ?? '',
    // Alias kompatibilitas frontend
    id: row["ID"] ?? '',
    nama_trainee: row["Nama Trainee"] ?? '',
    active_expired: row["Active/Expired"] ?? '',
    level: row["Level"] ?? '',
    house: row["House"] ?? '',
    class: row["Class"] ?? '',
    branch: row["Branch"] ?? '',
    total_gold: row["Total Gold/Periode"] ?? '0',
    total_gold_periode: row["Total Gold/Periode"] ?? '0',
    core_orator: row["Core/Orator"] ?? '',
    rank_core: row["RANK/ID/Core"] ?? '',
    rank_orator: row["RANK/ID/Orator"] ?? '',
    rank_core_cemara: row["RANK/ID/Core/Cemara"] ?? '',
    rank_orator_cemara: row["RANK/ID/Orator/CEMARA"] ?? ''
  };
}

// 1. GET / - Ambil semua data Monthly Gold Point (search & filter) murni dari database Neon
router.get('/', async (req, res) => {
  try {
    await ensureMonthlyGoldPointTable();

    const { search, house, level, branch, class_name, core_orator, limit, page } = req.query;
    let query = `
      SELECT 
        "ID", 
        "Nama Trainee", 
        "Active/Expired", 
        "Level", 
        "House", 
        "Class", 
        "Branch", 
        "Total Gold/Periode", 
        "Core/Orator", 
        "RANK/ID/Core", 
        "RANK/ID/Orator", 
        "RANK/ID/Core/Cemara", 
        "RANK/ID/Orator/CEMARA"
      FROM monthly_gold_point
    `;
    let conditions = [];
    let params = [];

    if (search) {
      params.push(`%${search.trim()}%`);
      const pIdx = `$${params.length}`;
      conditions.push(`("ID" ILIKE ${pIdx} OR "Nama Trainee" ILIKE ${pIdx} OR "House" ILIKE ${pIdx} OR "Class" ILIKE ${pIdx} OR "Branch" ILIKE ${pIdx})`);
    }

    if (house) {
      params.push(house.trim());
      conditions.push(`"House" ILIKE $${params.length}`);
    }

    if (level) {
      params.push(level.trim());
      conditions.push(`"Level" ILIKE $${params.length}`);
    }

    if (branch) {
      params.push(branch.trim());
      conditions.push(`"Branch" ILIKE $${params.length}`);
    }

    if (class_name) {
      params.push(class_name.trim());
      conditions.push(`"Class" ILIKE $${params.length}`);
    }

    if (core_orator) {
      params.push(core_orator.trim());
      conditions.push(`"Core/Orator" ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY "Total Gold/Periode"::int DESC NULLS LAST';

    if (limit) {
      const parsedLimit = parseInt(limit, 10) || 50;
      const parsedPage = parseInt(page, 10) || 1;
      const offset = (parsedPage - 1) * parsedLimit;
      params.push(parsedLimit, offset);
      query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;
    }

    const result = await db.query(query, params);
    const formatted = result.rows.map(formatGoldPointRow);

    res.json({
      success: true,
      message: 'Berhasil mengambil data Monthly Gold Point.',
      count: formatted.length,
      total: formatted.length,
      data: formatted
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

// GET /stream - Real-time SSE Stream
router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ status: 'connected', timestamp: Date.now() })}\n\n`);

  const sendData = async () => {
    try {
      const result = await db.query('SELECT * FROM monthly_gold_point ORDER BY "Total Gold/Periode"::int DESC NULLS LAST LIMIT 100');
      const formatted = result.rows.map(formatGoldPointRow);
      res.write(`data: ${JSON.stringify({ type: 'update', data: formatted })}\n\n`);
    } catch (e) {
      try {
        const result = await db.query('SELECT * FROM monthly_gold_point LIMIT 100');
        const formatted = result.rows.map(formatGoldPointRow);
        res.write(`data: ${JSON.stringify({ type: 'update', data: formatted })}\n\n`);
      } catch (err) {}
    }
  };

  sendData();
  const interval = setInterval(sendData, 30000);
  req.on('close', () => clearInterval(interval));
});

// 2. GET /:id - Ambil detail trainee berdasarkan ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await ensureMonthlyGoldPointTable();
    const result = await db.query(
      `SELECT 
        "ID", 
        "Nama Trainee", 
        "Active/Expired", 
        "Level", 
        "House", 
        "Class", 
        "Branch", 
        "Total Gold/Periode", 
        "Core/Orator", 
        "RANK/ID/Core", 
        "RANK/ID/Orator", 
        "RANK/ID/Core/Cemara", 
        "RANK/ID/Orator/CEMARA"
      FROM monthly_gold_point 
      WHERE "ID" = $1 OR "ID" ILIKE $1 
      LIMIT 1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Monthly Gold Point dengan ID: ${id} tidak ditemukan di database.`
      });
    }

    const row = result.rows[0];
    res.json({
      success: true,
      message: `Berhasil mengambil data Monthly Gold Point ID ${id}.`,
      data: formatGoldPointRow(row),
      ...formatGoldPointRow(row)
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

// 3. POST / - Tambah / Upsert data tunggal (13 kolom murni)
router.post('/', async (req, res) => {
  try {
    await ensureMonthlyGoldPointTable();
    const row = req.body;

    const id = String(row['ID'] ?? row['id'] ?? row['trainee_id'] ?? '').trim();
    if (!id) {
      return res.status(400).json({ success: false, message: 'Kolom "ID" wajib diisi.' });
    }

    const namaTrainee = String(row['Nama Trainee'] ?? row['nama_trainee'] ?? row['Name'] ?? row['name'] ?? '').trim();
    const activeExpired = String(row['Active/Expired'] ?? row['active_expired'] ?? row['status'] ?? '').trim();
    const level = String(row['Level'] ?? row['level'] ?? '').trim();
    const house = String(row['House'] ?? row['house'] ?? row['HOUSE'] ?? '').trim();
    const className = String(row['Class'] ?? row['class'] ?? '').trim();
    const branch = String(row['Branch'] ?? row['branch'] ?? row['cabang'] ?? '').trim();
    const totalGold = String(row['Total Gold/Periode'] ?? row['total_gold_periode'] ?? row['total_gold'] ?? row['gp_month'] ?? '0').trim();
    const coreOrator = String(row['Core/Orator'] ?? row['core_orator'] ?? row['kategori'] ?? row['program'] ?? '').trim();
    const rankCore = String(row['RANK/ID/Core'] ?? row['rank_id_core'] ?? row['rank_core'] ?? '').trim();
    const rankOrator = String(row['RANK/ID/Orator'] ?? row['rank_id_orator'] ?? row['rank_orator'] ?? '').trim();
    const rankCoreCemara = String(row['RANK/ID/Core/Cemara'] ?? row['rank_id_core_cemara'] ?? '').trim();
    const rankOratorCemara = String(row['RANK/ID/Orator/CEMARA'] ?? row['rank_id_orator_cemara'] ?? '').trim();

    const result = await db.query(`
      INSERT INTO monthly_gold_point (
        "ID", "Nama Trainee", "Active/Expired", "Level", "House", "Class", "Branch",
        "Total Gold/Periode", "Core/Orator", "RANK/ID/Core", "RANK/ID/Orator",
        "RANK/ID/Core/Cemara", "RANK/ID/Orator/CEMARA"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT ("ID") DO UPDATE SET
        "Nama Trainee"          = EXCLUDED."Nama Trainee",
        "Active/Expired"        = EXCLUDED."Active/Expired",
        "Level"                 = EXCLUDED."Level",
        "House"                 = EXCLUDED."House",
        "Class"                 = EXCLUDED."Class",
        "Branch"                = EXCLUDED."Branch",
        "Total Gold/Periode"    = EXCLUDED."Total Gold/Periode",
        "Core/Orator"           = EXCLUDED."Core/Orator",
        "RANK/ID/Core"          = EXCLUDED."RANK/ID/Core",
        "RANK/ID/Orator"        = EXCLUDED."RANK/ID/Orator",
        "RANK/ID/Core/Cemara"   = EXCLUDED."RANK/ID/Core/Cemara",
        "RANK/ID/Orator/CEMARA" = EXCLUDED."RANK/ID/Orator/CEMARA"
      RETURNING *;
    `, [
      id, namaTrainee, activeExpired, level, house, className, branch,
      totalGold, coreOrator, rankCore, rankOrator, rankCoreCemara, rankOratorCemara
    ]);

    res.status(201).json({
      success: true,
      message: 'Data Monthly Gold Point berhasil disimpan/diperbarui.',
      data: formatGoldPointRow(result.rows[0])
    });
  } catch (error) {
    console.error('[Monthly Gold Point] POST error:', error.message);
    res.status(500).json({ success: false, message: 'Gagal menyimpan data.', error: error.message });
  }
});

// 4. POST /push - Terima dan simpan data dari n8n / Google Sheets (bulk upsert 13 kolom murni)
router.post('/push', async (req, res) => {
  try {
    await ensureMonthlyGoldPointTable();

    let data = req.body;
    if (!Array.isArray(data)) {
      data = [data];
    }

    if (data.length === 0) {
      return res.status(400).json({ success: false, message: 'Data array kosong.' });
    }

    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || typeof row !== 'object') {
        skippedCount++;
        continue;
      }

      const id = String(row['ID'] ?? row['id'] ?? row['trainee_id'] ?? '').trim();
      if (!id) {
        skippedCount++;
        continue;
      }

      const namaTrainee = String(row['Nama Trainee'] ?? row['nama_trainee'] ?? row['Name'] ?? row['name'] ?? '').trim();
      const activeExpired = String(row['Active/Expired'] ?? row['active_expired'] ?? row['status'] ?? '').trim();
      const level = String(row['Level'] ?? row['level'] ?? '').trim();
      const house = String(row['House'] ?? row['house'] ?? row['HOUSE'] ?? '').trim();
      const className = String(row['Class'] ?? row['class'] ?? '').trim();
      const branch = String(row['Branch'] ?? row['branch'] ?? row['cabang'] ?? '').trim();
      const totalGold = String(row['Total Gold/Periode'] ?? row['total_gold_periode'] ?? row['total_gold'] ?? row['gp_month'] ?? '0').trim();
      const coreOrator = String(row['Core/Orator'] ?? row['core_orator'] ?? row['kategori'] ?? row['program'] ?? '').trim();
      const rankCore = String(row['RANK/ID/Core'] ?? row['rank_id_core'] ?? row['rank_core'] ?? '').trim();
      const rankOrator = String(row['RANK/ID/Orator'] ?? row['rank_id_orator'] ?? row['rank_orator'] ?? '').trim();
      const rankCoreCemara = String(row['RANK/ID/Core/Cemara'] ?? row['rank_id_core_cemara'] ?? '').trim();
      const rankOratorCemara = String(row['RANK/ID/Orator/CEMARA'] ?? row['rank_id_orator_cemara'] ?? '').trim();

      try {
        await db.query(`
          INSERT INTO monthly_gold_point (
            "ID", "Nama Trainee", "Active/Expired", "Level", "House", "Class", "Branch",
            "Total Gold/Periode", "Core/Orator", "RANK/ID/Core", "RANK/ID/Orator",
            "RANK/ID/Core/Cemara", "RANK/ID/Orator/CEMARA"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT ("ID") DO UPDATE SET
            "Nama Trainee"          = EXCLUDED."Nama Trainee",
            "Active/Expired"        = EXCLUDED."Active/Expired",
            "Level"                 = EXCLUDED."Level",
            "House"                 = EXCLUDED."House",
            "Class"                 = EXCLUDED."Class",
            "Branch"                = EXCLUDED."Branch",
            "Total Gold/Periode"    = EXCLUDED."Total Gold/Periode",
            "Core/Orator"           = EXCLUDED."Core/Orator",
            "RANK/ID/Core"          = EXCLUDED."RANK/ID/Core",
            "RANK/ID/Orator"        = EXCLUDED."RANK/ID/Orator",
            "RANK/ID/Core/Cemara"   = EXCLUDED."RANK/ID/Core/Cemara",
            "RANK/ID/Orator/CEMARA" = EXCLUDED."RANK/ID/Orator/CEMARA";
        `, [
          id, namaTrainee, activeExpired, level, house, className, branch,
          totalGold, coreOrator, rankCore, rankOrator, rankCoreCemara, rankOratorCemara
        ]);
        insertedCount++;
      } catch (rowError) {
        errorCount++;
        errors.push({ index: i, id, error: rowError.message });
      }
    }

    res.json({
      success: true,
      message: `Berhasil sinkronisasi ${insertedCount} data ke Monthly Gold Point, ${skippedCount} di-skip, ${errorCount} error.`,
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

// 5. PUT /:id - Update data ID Gold Point (hanya 13 kolom)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const b = req.body;

  try {
    await ensureMonthlyGoldPointTable();
    const check = await db.query('SELECT * FROM monthly_gold_point WHERE "ID" = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }

    const ex = check.rows[0];
    const namaTrainee = b['Nama Trainee'] ?? b.nama_trainee ?? ex['Nama Trainee'];
    const activeExpired = b['Active/Expired'] ?? b.active_expired ?? ex['Active/Expired'];
    const level = b['Level'] ?? b.level ?? ex['Level'];
    const house = b['House'] ?? b.house ?? ex['House'];
    const className = b['Class'] ?? b.class ?? ex['Class'];
    const branch = b['Branch'] ?? b.branch ?? ex['Branch'];
    const totalGold = b['Total Gold/Periode'] ?? b.total_gold_periode ?? ex['Total Gold/Periode'];
    const coreOrator = b['Core/Orator'] ?? b.core_orator ?? ex['Core/Orator'];
    const rankCore = b['RANK/ID/Core'] ?? b.rank_id_core ?? ex['RANK/ID/Core'];
    const rankOrator = b['RANK/ID/Orator'] ?? b.rank_id_orator ?? ex['RANK/ID/Orator'];
    const rankCoreCemara = b['RANK/ID/Core/Cemara'] ?? b.rank_id_core_cemara ?? ex['RANK/ID/Core/Cemara'];
    const rankOratorCemara = b['RANK/ID/Orator/CEMARA'] ?? b.rank_id_orator_cemara ?? ex['RANK/ID/Orator/CEMARA'];

    const result = await db.query(`
      UPDATE monthly_gold_point
      SET "Nama Trainee"          = $1,
          "Active/Expired"        = $2,
          "Level"                 = $3,
          "House"                 = $4,
          "Class"                 = $5,
          "Branch"                = $6,
          "Total Gold/Periode"    = $7,
          "Core/Orator"           = $8,
          "RANK/ID/Core"          = $9,
          "RANK/ID/Orator"        = $10,
          "RANK/ID/Core/Cemara"   = $11,
          "RANK/ID/Orator/CEMARA" = $12
      WHERE "ID" = $13
      RETURNING *;
    `, [
      namaTrainee, activeExpired, level, house, className, branch,
      totalGold, coreOrator, rankCore, rankOrator, rankCoreCemara, rankOratorCemara, id
    ]);

    res.json({ success: true, message: 'Data berhasil diperbarui.', data: formatGoldPointRow(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. DELETE /:id - Hapus satu data
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await ensureMonthlyGoldPointTable();
    const result = await db.query('DELETE FROM monthly_gold_point WHERE "ID" = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Data berhasil dihapus.', data: formatGoldPointRow(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. DELETE /truncate - Kosongkan seluruh tabel monthly_gold_point
router.delete('/truncate', async (req, res) => {
  try {
    await db.query('TRUNCATE TABLE monthly_gold_point');
    res.json({ success: true, message: 'Seluruh isi tabel monthly_gold_point berhasil dikosongkan.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengosongkan tabel.', error: error.message });
  }
});

module.exports = router;
