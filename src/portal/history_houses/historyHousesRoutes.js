const express = require('express');
const router = express.Router();
const db = require('../../db/neonClient');

/**
 * ============================================================
 * ROUTE: History Houses (/api/portal/history-houses, /api/history-house, /api/history-houses, /api/house-selection-history)
 * Kolom (5 Kolom Resmi):
 * ID, Name Corrected, Class Corrected, House Corrected, House
 * ============================================================
 */

// Helper to ensure history_houses table exists with exact columns
async function ensureHistoryHousesTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS history_houses (
        "ID"              VARCHAR(50) PRIMARY KEY,
        "Name Corrected"  VARCHAR(255),
        "Class Corrected" VARCHAR(255),
        "House Corrected" VARCHAR(255),
        "House"           VARCHAR(255),
        created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Pastikan setiap kolom spesifik ada
    const columns = [
      { name: 'ID', type: 'VARCHAR(50)' },
      { name: 'Name Corrected', type: 'VARCHAR(255)' },
      { name: 'Class Corrected', type: 'VARCHAR(255)' },
      { name: 'House Corrected', type: 'VARCHAR(255)' },
      { name: 'House', type: 'VARCHAR(255)' }
    ];

    for (const col of columns) {
      await db.query(`
        ALTER TABLE history_houses 
        ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type};
      `);
    }

    // Juga pastikan tabel quiz_history tetap ada untuk sinkronisasi kuis
    await db.query(`
      CREATE TABLE IF NOT EXISTS quiz_history (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) UNIQUE,
        assigned_house VARCHAR(100),
        score_a INT DEFAULT 0,
        score_b INT DEFAULT 0,
        score_c INT DEFAULT 0,
        score_d INT DEFAULT 0,
        score_e INT DEFAULT 0,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    console.error('[History Houses] Ensure table error:', err.message);
  }
}

// Format row agar kompatibel dengan Google Sheet asli dan frontend portal
function formatHistoryRow(row) {
  const id = row["ID"] || row.id || row.student_id || '';
  const nameCorrected = row["Name Corrected"] || row.name_corrected || row.name || '';
  const classCorrected = row["Class Corrected"] || row.class_corrected || row.class || '';
  const houseCorrected = row["House Corrected"] || row.house_corrected || row.assigned_house || '';
  const house = row["House"] || row.house || row.assigned_house || '';

  return {
    "ID": id,
    "Name Corrected": nameCorrected,
    "Class Corrected": classCorrected,
    "House Corrected": houseCorrected,
    "House": house,
    // Alias untuk kompatibilitas frontend
    id: id,
    student_id: id,
    name: nameCorrected,
    name_corrected: nameCorrected,
    class: classCorrected,
    class_corrected: classCorrected,
    house_corrected: houseCorrected,
    house: house,
    house_name: houseCorrected || house,
    assigned_house: houseCorrected || house,
    created_at: row.created_at || row.submitted_at || new Date().toISOString()
  };
}

// 1. GET / - Ambil semua riwayat house
router.get('/', async (req, res) => {
  const { search, house, page, limit } = req.query;
  try {
    await ensureHistoryHousesTable();

    let query = `
      SELECT "ID", "Name Corrected", "Class Corrected", "House Corrected", "House", created_at, updated_at
      FROM history_houses
    `;
    const params = [];
    const conditions = [];

    if (search) {
      params.push(`%${search.trim()}%`);
      conditions.push(`(
        "ID" ILIKE $${params.length} OR 
        "Name Corrected" ILIKE $${params.length} OR 
        "House Corrected" ILIKE $${params.length} OR
        "House" ILIKE $${params.length}
      )`);
    }

    if (house) {
      params.push(house.trim());
      conditions.push(`("House Corrected" = $${params.length} OR "House" = $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY created_at DESC';

    if (limit && !isNaN(limit)) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10);
      const offset = (pageNum - 1) * limitNum;
      params.push(limitNum, offset);
      query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;
    }

    const result = await db.query(query, params);
    const formatted = result.rows.map(formatHistoryRow);

    res.json({
      success: true,
      count: formatted.length,
      total: formatted.length,
      data: formatted
    });
  } catch (err) {
    console.error('[History Houses] GET Error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
});

// SSE Stream untuk update live real-time di portal
router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  res.write(`data: ${JSON.stringify({ status: 'connected' })}\n\n`);

  const send = async () => {
    try {
      const result = await db.query('SELECT * FROM history_houses ORDER BY created_at DESC LIMIT 50');
      const formatted = result.rows.map(formatHistoryRow);
      res.write(`data: ${JSON.stringify(formatted)}\n\n`);
    } catch (e) {}
  };

  send();
  const interval = setInterval(send, 30000);
  req.on('close', () => clearInterval(interval));
});

// 2. GET /:student_id - Detail riwayat per siswa berdasarkan ID
router.get('/:student_id', async (req, res) => {
  const { student_id } = req.params;
  try {
    await ensureHistoryHousesTable();
    const result = await db.query(
      `SELECT * FROM history_houses 
       WHERE "ID" = $1 OR "ID" ILIKE $1 
       LIMIT 1`,
      [student_id]
    );

    if (result.rows.length === 0) {
      // Cek fallback ke quiz_history jika belum ada di history_houses
      const qhFallback = await db.query(
        `SELECT * FROM quiz_history WHERE student_id = $1 OR student_id ILIKE $1 LIMIT 1`,
        [student_id]
      ).catch(() => ({ rows: [] }));

      if (qhFallback.rows.length > 0) {
        const qh = qhFallback.rows[0];
        return res.json({
          success: true,
          data: formatHistoryRow({
            "ID": qh.student_id,
            "Name Corrected": '',
            "Class Corrected": '',
            "House Corrected": qh.assigned_house,
            "House": qh.assigned_house,
            created_at: qh.submitted_at
          })
        });
      }

      return res.status(404).json({ success: false, message: `Data history tidak ditemukan untuk ID: ${student_id}` });
    }

    res.json({ success: true, data: formatHistoryRow(result.rows[0]) });
  } catch (err) {
    console.error('[History Houses] GET Single Error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 3. POST /push - Bulk import dari Google Sheets / n8n (kolom: ID, Name Corrected, Class Corrected, House Corrected, House)
router.post('/push', async (req, res) => {
  try {
    await ensureHistoryHousesTable();
    let data = req.body;
    if (!Array.isArray(data)) {
      data = [data];
    }

    if (data.length === 0) {
      return res.status(400).json({ success: false, message: 'Data kosong.' });
    }

    let inserted = 0;
    let errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || typeof row !== 'object') continue;

      const id = String(row["ID"] || row.id || row.student_id || '').trim();
      const name = String(row["Name Corrected"] || row.name_corrected || row.Name || row.name || '').trim();
      const className = String(row["Class Corrected"] || row.class_corrected || row.Class || row.class || '').trim();
      const houseCorrected = String(row["House Corrected"] || row.house_corrected || '').trim();
      const house = String(row["House"] || row.house || row["House Corrected"] || '').trim();

      if (!id) continue;

      try {
        await db.query(`
          INSERT INTO history_houses ("ID", "Name Corrected", "Class Corrected", "House Corrected", "House", updated_at)
          VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
          ON CONFLICT ("ID") DO UPDATE SET
            "Name Corrected" = EXCLUDED."Name Corrected",
            "Class Corrected" = EXCLUDED."Class Corrected",
            "House Corrected" = EXCLUDED."House Corrected",
            "House" = EXCLUDED."House",
            updated_at = CURRENT_TIMESTAMP;
        `, [id, name, className, houseCorrected, house]);
        inserted++;
      } catch (err) {
        errors.push({ index: i, id, error: err.message });
      }
    }

    res.json({
      success: true,
      message: `Berhasil sinkronisasi ${inserted} data History Houses.`,
      count: inserted,
      errors: errors.slice(0, 5)
    });
  } catch (err) {
    console.error('[History Houses] Push error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. POST / - Tambah / simpan satu riwayat
router.post('/', async (req, res) => {
  const body = req.body;
  const id = String(body["ID"] || body.id || body.student_id || '').trim();
  const name = String(body["Name Corrected"] || body.name_corrected || body.name || '').trim();
  const className = String(body["Class Corrected"] || body.class_corrected || body.class || '').trim();
  const houseCorrected = String(body["House Corrected"] || body.house_corrected || body.house || '').trim();
  const house = String(body["House"] || body.house || houseCorrected || '').trim();

  if (!id) {
    return res.status(400).json({ success: false, message: 'ID wajib diisi.' });
  }

  try {
    await ensureHistoryHousesTable();
    const result = await db.query(`
      INSERT INTO history_houses ("ID", "Name Corrected", "Class Corrected", "House Corrected", "House", updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT ("ID") DO UPDATE SET
        "Name Corrected" = EXCLUDED."Name Corrected",
        "Class Corrected" = EXCLUDED."Class Corrected",
        "House Corrected" = EXCLUDED."House Corrected",
        "House" = EXCLUDED."House",
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `, [id, name, className, houseCorrected, house]);

    res.status(201).json({ success: true, message: 'Data riwayat house berhasil disimpan.', data: formatHistoryRow(result.rows[0]) });
  } catch (err) {
    console.error('[History Houses] POST Error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
});

// 5. DELETE /:id - Hapus riwayat
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await ensureHistoryHousesTable();
    const result = await db.query('DELETE FROM history_houses WHERE "ID" = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Data riwayat berhasil dihapus.', data: result.rows[0] });
  } catch (err) {
    console.error('[History Houses] DELETE Error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
});

module.exports = router;
