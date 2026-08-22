const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');
const Ably = require('ably');

// Helper to ensure monthly_gold_point table exists
async function ensureMonthlyGoldPointTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS monthly_gold_point (
        "ID" TEXT PRIMARY KEY,
        "Month" TEXT,
        "TOP 25" TEXT,
        "Scope" TEXT,
        "Program" TEXT,
        "Section" TEXT,
        "Section_No" TEXT,
        "Nama Trainee" TEXT,
        "Active/Expired" TEXT,
        "Level" TEXT,
        "House" TEXT,
        "Class" TEXT,
        "Branch" TEXT,
        "Total Gold/Periode" TEXT,
        "Total Gold Raw" TEXT,
        "Junior/Youth" TEXT,
        "RANK/ID" TEXT,
        "Rank" TEXT,
        "RANK/ID Raw" TEXT,
        "RANK/ID Column" TEXT,
        "All RANK/ID" TEXT,
        "All RANK/ID Raw" TEXT,
        "Expected_Section_Count" TEXT,
        "Section_Found_Number" TEXT,
        "Source_Item" TEXT,
        "Source_Input_Item" TEXT,
        "Source_Row_Number" TEXT,
        "Source_ID_Column" TEXT,
        "Source_Name_Column" TEXT,
        "Source_Rank_Columns" TEXT,
        "Column_Base" TEXT,
        "RANK/ID_1" TEXT,
        "RANK/ID_1_Raw" TEXT,
        "Output_No" TEXT,
        "_validation" TEXT,
        "RANK/ID_2" TEXT,
        "RANK/ID_2_Raw" TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error('[Monthly Gold Point] Ensure Table error:', err.message);
  }
}

// Initialize Ably if API key is provided
let ably;
try {
  const ablyKey = process.env.ABLY_API_KEY ? process.env.ABLY_API_KEY.trim() : null;
  if (ablyKey) {
    ably = new Ably.Rest(ablyKey);
    console.log('✅ Ably real-time initialized for monthly_gold_point.');
  }
} catch (err) {
  console.warn('⚠️ Ably warning for monthly_gold_point:', err.message);
}

// Active Server-Sent Events (SSE) subscribers
const sseClients = new Set();

/**
 * Broadcast event to all active SSE subscribers and Ably channel
 */
async function broadcast(eventType, data) {
  const payload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    data: data
  };

  const message = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(message);
    } catch (e) {
      sseClients.delete(client);
    }
  });

  if (ably) {
    try {
      const channel = ably.channels.get('monthly_gold_point');
      await channel.publish(eventType, payload);
    } catch (err) {
      console.error('[Ably Publish Error]:', err.message);
    }
  }
}

// SSE Keep-alive heartbeat ping (every 20s)
setInterval(() => {
  sseClients.forEach((client) => {
    try {
      client.write(': ping\n\n');
    } catch (e) {
      sseClients.delete(client);
    }
  });
}, 20000);

// Helper to sanitize string inputs
const cleanStr = (v) => {
  if (v === null || v === undefined || v === 'null') return null;
  const str = String(v).trim();
  return str === '' ? null : str;
};

// Helper to extract fields from request body
function extractMonthlyGoldFields(row) {
  const id                 = String(row['ID']                 ?? row['id']                 ?? row['trainee_id'] ?? '').trim();
  const namaTrainee        = cleanStr(row['Nama Trainee']     ?? row['Nama']               ?? row['nama_trainee'] ?? row['name'] ?? row['trainee_name']);
  const activeExpired      = cleanStr(row['Active/Expired']   ?? row['active_expired']     ?? row['status']);
  const level              = cleanStr(row['Level']            ?? row['level']);
  const house              = cleanStr(row['House']            ?? row['house']);
  const classVal           = cleanStr(row['Class']            ?? row['class']              ?? row['class_name']);
  const branch             = cleanStr(row['Branch']           ?? row['branch']);
  const totalGoldPeriode   = cleanStr(row['Total Gold/Periode'] ?? row['total_gold_periode'] ?? row['gp_month'] ?? row['total_gold']);
  const juniorYouth        = cleanStr(row['Junior/Youth']     ?? row['junior_youth']       ?? row['kategori']);
  const rank               = cleanStr(row['Rank']             ?? row['RANK/ID']            ?? row['rank_id'] ?? row['rank']);
  const scope              = cleanStr(row['Scope']            ?? row['scope']);
  const program            = cleanStr(row['Program']          ?? row['program']);
  const section            = cleanStr(row['Section']          ?? row['section']);
  const sectionNo          = cleanStr(row['Section_No']       ?? row['section_no']         ?? row['Section No']);
  const sourceItem         = cleanStr(row['Source_Item']      ?? row['Source_Input_Item']  ?? row['source_item'] ?? row['source']);
  const outputNo           = cleanStr(row['Output_No']       ?? row['output_no']          ?? row['Output No']);

  return {
    id,
    namaTrainee,
    activeExpired,
    level,
    house,
    classVal,
    branch,
    totalGoldPeriode,
    juniorYouth,
    rank,
    scope,
    program,
    section,
    sectionNo,
    sourceItem,
    outputNo,
    rawRow: row
  };
}

// ==========================================
// REAL-TIME SSE STREAM ENDPOINT
// GET /api/monthly-gold-point/stream or GET /api/monthly-gold-point/live
// ==========================================
const handleStream = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders && res.flushHeaders();

  sseClients.add(res);

  try {
    const result = await db.query(`SELECT * FROM monthly_gold_point ORDER BY "ID" ASC`);
    const initPayload = {
      event: 'init',
      timestamp: new Date().toISOString(),
      data: result.rows
    };
    res.write(`event: init\ndata: ${JSON.stringify(initPayload)}\n\n`);
  } catch (err) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
  }

  req.on('close', () => {
    sseClients.delete(res);
  });
};

router.get('/stream', handleStream);
router.get('/live', handleStream);

// ==========================================
// UNIFIED GET ENDPOINT - FETCH ALL TRAINEES
// GET /api/monthly-gold-point or GET /api/goldpoint-trainee
// ==========================================
router.get('/', async (req, res) => {
  try {
    await ensureMonthlyGoldPointTable();
    const { search } = req.query;

    // 1. Fetch all rows from monthly_gold_point table
    let query1 = `SELECT * FROM monthly_gold_point WHERE 1=1`;
    const params1 = [];
    if (search) {
      params1.push(`%${search.trim()}%`);
      query1 += ` AND ("ID" ILIKE $1 OR "Nama Trainee" ILIKE $1 OR "House" ILIKE $1 OR "Class" ILIKE $1)`;
    }
    query1 += ` ORDER BY "ID" ASC`;

    const res1 = await db.query(query1, params1).catch(() => ({ rows: [] }));
    let combinedRows = [...res1.rows];

    // 2. Also fetch from id_gold_point table if it exists
    try {
      let query2 = `SELECT * FROM id_gold_point WHERE 1=1`;
      const params2 = [];
      if (search) {
        params2.push(`%${search.trim()}%`);
        query2 += ` AND ("ID" ILIKE $1 OR "Nama Trainee" ILIKE $1 OR "House" ILIKE $1 OR "Class" ILIKE $1)`;
      }
      query2 += ` ORDER BY "ID" ASC`;
      const res2 = await db.query(query2, params2);

      // Merge rows by ID without duplication
      const existingIds = new Set(combinedRows.map(r => String(r.ID).trim()));
      res2.rows.forEach(r => {
        if (r.ID && !existingIds.has(String(r.ID).trim())) {
          combinedRows.push(r);
          existingIds.add(String(r.ID).trim());
        }
      });
    } catch (e) {
      // Ignore if id_gold_point table does not exist
    }

    res.json({
      success: true,
      message: 'Berhasil mengambil seluruh data Gold Points.',
      total: combinedRows.length,
      count: combinedRows.length,
      data: combinedRows
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

// GET /api/monthly-gold-point/:id - Get single record by ID
router.get('/:id', async (req, res) => {
  try {
    await ensureMonthlyGoldPointTable();
    const cleanId = String(req.params.id).trim();

    // 1. Search in monthly_gold_point
    const res1 = await db.query(`SELECT * FROM monthly_gold_point WHERE "ID" = $1`, [cleanId]);
    if (res1.rows.length > 0) {
      return res.json({ success: true, data: res1.rows[0] });
    }

    // 2. Fallback search in id_gold_point
    try {
      const res2 = await db.query(`SELECT * FROM id_gold_point WHERE "ID" = $1`, [cleanId]);
      if (res2.rows.length > 0) {
        return res.json({ success: true, data: res2.rows[0] });
      }
    } catch (e) {}

    return res.status(404).json({
      success: false,
      message: `Data Gold Point dengan ID "${cleanId}" tidak ditemukan.`
    });
  } catch (error) {
    console.error('[Monthly Gold Point] GET ID error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data Gold Point.',
      error: error.message
    });
  }
});

// POST /api/monthly-gold-point - Create or Update Single Record
router.post('/', async (req, res) => {
  try {
    const fields = extractMonthlyGoldFields(req.body);

    if (!fields.id) {
      return res.status(400).json({ success: false, message: 'Field "ID" wajib diisi.' });
    }

    // Build dynamic upsert from request body keys
    const rowKeys = Object.keys(req.body).filter(k => k !== 'created_at' && k !== 'updated_at');
    const cols = rowKeys.map(k => `"${k}"`).join(', ');
    const vals = rowKeys.map((_, i) => `$${i + 1}`).join(', ');
    const updateSet = rowKeys.filter(k => k !== 'ID').map(k => `"${k}" = EXCLUDED."${k}"`).join(', ');

    const params = rowKeys.map(k => req.body[k]);

    const query = `
      INSERT INTO monthly_gold_point (${cols})
      VALUES (${vals})
      ON CONFLICT ("ID") DO UPDATE SET
        ${updateSet},
        updated_at = NOW()
      RETURNING *;
    `;

    const result = await db.query(query, params);
    const newRecord = result.rows[0];
    broadcast('INSERT', newRecord);

    res.status(201).json({
      success: true,
      message: `Berhasil menyimpan data Gold Point ID ${fields.id}`,
      data: newRecord
    });
  } catch (error) {
    console.error('[Monthly Gold Point] POST error:', error.message);
    res.status(500).json({ success: false, message: 'Gagal menyimpan data.', error: error.message });
  }
});

// POST /api/monthly-gold-point/push - Bulk Upsert Array
router.post('/push', async (req, res) => {
  try {
    let data = req.body;
    if (!Array.isArray(data)) data = [data];

    if (data.length === 0) {
      return res.status(400).json({ success: false, message: 'Data kosong.' });
    }

    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors = [];
    const processedRows = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || typeof row !== 'object') {
        skippedCount++;
        continue;
      }

      const cleanId = String(row['ID'] ?? row['id'] ?? row['trainee_id'] ?? '').trim();
      if (!cleanId) {
        skippedCount++;
        continue;
      }

      try {
        const rowKeys = Object.keys(row).filter(k => k !== 'created_at' && k !== 'updated_at');
        const cols = rowKeys.map(k => `"${k}"`).join(', ');
        const vals = rowKeys.map((_, idx) => `$${idx + 1}`).join(', ');
        const updateSet = rowKeys.filter(k => k !== 'ID').map(k => `"${k}" = EXCLUDED."${k}"`).join(', ');

        const params = rowKeys.map(k => row[k]);

        const query = `
          INSERT INTO monthly_gold_point (${cols})
          VALUES (${vals})
          ON CONFLICT ("ID") DO UPDATE SET
            ${updateSet},
            updated_at = NOW()
          RETURNING *;
        `;

        const result = await db.query(query, params);
        insertedCount++;
        processedRows.push(result.rows[0]);
      } catch (rowError) {
        errorCount++;
        errors.push({ index: i, id: cleanId, error: rowError.message });
      }
    }

    if (processedRows.length > 0) {
      broadcast('BULK_UPSERT', { count: processedRows.length, sample: processedRows.slice(0, 5) });
    }

    res.json({
      success: true,
      message: `Berhasil menyimpan/mengupdate ${insertedCount} data ke Gold Point, ${skippedCount} di-skip, ${errorCount} error.`,
      details: { insertedCount, skippedCount, errorCount, errors: errors.slice(0, 10) }
    });
  } catch (error) {
    console.error('[Monthly Gold Point Push] Fatal error:', error.message);
    res.status(500).json({ success: false, message: 'Terjadi error saat menyimpan data.', error: error.message });
  }
});

// DELETE /api/monthly-gold-point/truncate - Clear all table rows
router.delete('/truncate', async (req, res) => {
  try {
    await db.query('TRUNCATE TABLE monthly_gold_point CASCADE');
    try { await db.query('TRUNCATE TABLE id_gold_point CASCADE'); } catch (e) {}
    broadcast('TRUNCATE', { message: 'All Gold Point records cleared' });
    res.json({ success: true, message: 'Seluruh isi tabel Gold Point berhasil dikosongkan.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengosongkan tabel.', error: error.message });
  }
});

// DELETE /api/monthly-gold-point/:id - Delete single record by ID
router.delete('/:id', async (req, res) => {
  const cleanId = String(req.params.id).trim();
  try {
    const result = await db.query('DELETE FROM monthly_gold_point WHERE "ID" = $1 RETURNING *', [cleanId]);
    try { await db.query('DELETE FROM id_gold_point WHERE "ID" = $1', [cleanId]); } catch (e) {}

    broadcast('DELETE', { ID: cleanId });
    res.json({ success: true, message: `Data Gold Point ID ${cleanId} berhasil dihapus.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus data.', error: error.message });
  }
});

module.exports = router;
