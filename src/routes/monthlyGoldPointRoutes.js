const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');
const Ably = require('ably');

// Helper to ensure monthly_gold_point table exists with exact 18 columns
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
        "Rank" TEXT,
        "Scope" TEXT,
        "Program" TEXT,
        "Section" TEXT,
        "Section_No" TEXT,
        "Source_Item" TEXT,
        "Column_Base" TEXT,
        "Output_No" TEXT,
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

  // 1. Broadcast to SSE subscribers
  const message = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(message);
    } catch (e) {
      sseClients.delete(client);
    }
  });

  // 2. Broadcast to Ably channel
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

// Helper to extract fields from request body (supporting exact 18 column names & aliases)
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
  const rankId             = cleanStr(row['RANK/ID']          ?? row['Rank/ID']            ?? row['rank_id']);
  const rank               = cleanStr(row['Rank']             ?? row['rank']);
  const scope              = cleanStr(row['Scope']            ?? row['scope']);
  const program            = cleanStr(row['Program']          ?? row['program']);
  const section            = cleanStr(row['Section']          ?? row['section']);
  const sectionNo          = cleanStr(row['Section_No']       ?? row['section_no']         ?? row['Section No']);
  const sourceItem         = cleanStr(row['Source_Item']      ?? row['source_item']        ?? row['Source Item'] ?? row['source']);
  const columnBase         = cleanStr(row['Column_Base']      ?? row['column_base']        ?? row['Column Base']);
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
    rankId,
    rank,
    scope,
    program,
    section,
    sectionNo,
    sourceItem,
    columnBase,
    outputNo
  };
}

const SELECT_COLUMNS = `"ID", "Nama Trainee", "Active/Expired", "Level", "House", "Class", "Branch", "Total Gold/Periode", "Junior/Youth", "RANK/ID", "Rank", "Scope", "Program", "Section", "Section_No", "Source_Item", "Column_Base", "Output_No"`;

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
    const result = await db.query(`
      SELECT ${SELECT_COLUMNS}
      FROM monthly_gold_point 
      ORDER BY "ID" ASC 
      LIMIT 100
    `);
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
// RESTful CRUD ENDPOINTS
// ==========================================

// 1. GET /api/monthly-gold-point - Fetch all records (with pagination & search)
router.get('/', async (req, res) => {
  try {
    await ensureMonthlyGoldPointTable();
    const { search, page = 1, limit = 100, all } = req.query;

    let query = `SELECT ${SELECT_COLUMNS} FROM monthly_gold_point WHERE 1=1`;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search.trim()}%`);
      conditions.push(`("ID" ILIKE $${params.length} OR "Nama Trainee" ILIKE $${params.length} OR "House" ILIKE $${params.length} OR "Class" ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ` AND ` + conditions.join(' AND ');
    }

    query += ` ORDER BY "ID" ASC`;

    const countQuery = `SELECT COUNT(*) FROM monthly_gold_point WHERE 1=1` + (conditions.length > 0 ? ` AND ` + conditions.join(' AND ') : '');
    const countResult = await db.query(countQuery, params).catch(() => ({ rows: [{ count: 0 }] }));
    const totalItems = parseInt(countResult.rows[0]?.count || 0, 10);

    if (all === 'true' || all === '1' || limit === '0') {
      const result = await db.query(query, params);
      return res.json({
        success: true,
        message: 'Berhasil mengambil semua data Monthly Gold Point.',
        total: totalItems,
        count: result.rows.length,
        data: result.rows
      });
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 100;
    const offset = (pageNum - 1) * limitNum;

    params.push(limitNum);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await db.query(query, params);

    res.json({
      success: true,
      message: 'Berhasil mengambil data Monthly Gold Point.',
      data: result.rows,
      count: result.rows.length,
      total: totalItems,
      pagination: {
        total: totalItems,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalItems / limitNum) || 1
      }
    });
  } catch (error) {
    if (error.code === '42P01') {
      return res.json({ success: true, data: [], total: 0 });
    }
    console.error('[Monthly Gold Point] GET error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dari database.',
      error: error.message
    });
  }
});

// 2. GET /api/monthly-gold-point/:id - Get single record by ID
router.get('/:id', async (req, res) => {
  try {
    await ensureMonthlyGoldPointTable();
    const cleanId = String(req.params.id).trim();

    const result = await db.query(`
      SELECT ${SELECT_COLUMNS}
      FROM monthly_gold_point
      WHERE "ID" = $1
    `, [cleanId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Monthly Gold Point dengan ID "${cleanId}" tidak ditemukan.`
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[Monthly Gold Point] GET ID error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data Monthly Gold Point.',
      error: error.message
    });
  }
});

// 3. POST /api/monthly-gold-point - Create or Update Single Record
router.post('/', async (req, res) => {
  try {
    const fields = extractMonthlyGoldFields(req.body);

    if (!fields.id) {
      return res.status(400).json({
        success: false,
        message: 'Field "ID" wajib diisi.'
      });
    }

    const result = await db.query(`
      INSERT INTO monthly_gold_point (
        "ID", "Nama Trainee", "Active/Expired", "Level", "House",
        "Class", "Branch", "Total Gold/Periode", "Junior/Youth",
        "RANK/ID", "Rank", "Scope", "Program", "Section",
        "Section_No", "Source_Item", "Column_Base", "Output_No"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
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
        "Rank"               = EXCLUDED."Rank",
        "Scope"              = EXCLUDED."Scope",
        "Program"            = EXCLUDED."Program",
        "Section"            = EXCLUDED."Section",
        "Section_No"         = EXCLUDED."Section_No",
        "Source_Item"        = EXCLUDED."Source_Item",
        "Column_Base"        = EXCLUDED."Column_Base",
        "Output_No"          = EXCLUDED."Output_No",
        updated_at           = NOW()
      RETURNING ${SELECT_COLUMNS};
    `, [
      fields.id, fields.namaTrainee, fields.activeExpired, fields.level, fields.house,
      fields.classVal, fields.branch, fields.totalGoldPeriode, fields.juniorYouth,
      fields.rankId, fields.rank, fields.scope, fields.program, fields.section,
      fields.sectionNo, fields.sourceItem, fields.columnBase, fields.outputNo
    ]);

    const newRecord = result.rows[0];
    broadcast('INSERT', newRecord);

    res.status(201).json({
      success: true,
      message: `Berhasil menyimpan data Monthly Gold Point ID ${fields.id}`,
      data: newRecord
    });
  } catch (error) {
    console.error('[Monthly Gold Point] POST error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan data Monthly Gold Point.',
      error: error.message
    });
  }
});

// 4. POST /api/monthly-gold-point/push - Bulk Upsert Array
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
    const processedRows = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || typeof row !== 'object') {
        skippedCount++;
        continue;
      }

      const fields = extractMonthlyGoldFields(row);

      if (!fields.id) {
        skippedCount++;
        continue;
      }

      try {
        const result = await db.query(`
          INSERT INTO monthly_gold_point (
            "ID", "Nama Trainee", "Active/Expired", "Level", "House",
            "Class", "Branch", "Total Gold/Periode", "Junior/Youth",
            "RANK/ID", "Rank", "Scope", "Program", "Section",
            "Section_No", "Source_Item", "Column_Base", "Output_No"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
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
            "Rank"               = EXCLUDED."Rank",
            "Scope"              = EXCLUDED."Scope",
            "Program"            = EXCLUDED."Program",
            "Section"            = EXCLUDED."Section",
            "Section_No"         = EXCLUDED."Section_No",
            "Source_Item"        = EXCLUDED."Source_Item",
            "Column_Base"        = EXCLUDED."Column_Base",
            "Output_No"          = EXCLUDED."Output_No",
            updated_at           = NOW()
          RETURNING ${SELECT_COLUMNS};
        `, [
          fields.id, fields.namaTrainee, fields.activeExpired, fields.level, fields.house,
          fields.classVal, fields.branch, fields.totalGoldPeriode, fields.juniorYouth,
          fields.rankId, fields.rank, fields.scope, fields.program, fields.section,
          fields.sectionNo, fields.sourceItem, fields.columnBase, fields.outputNo
        ]);

        insertedCount++;
        processedRows.push(result.rows[0]);
      } catch (rowError) {
        errorCount++;
        errors.push({ index: i, id: fields.id, error: rowError.message });
      }
    }

    if (processedRows.length > 0) {
      broadcast('BULK_UPSERT', { count: processedRows.length, sample: processedRows.slice(0, 5) });
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

// 5. PUT /api/monthly-gold-point/:id & PATCH /api/monthly-gold-point/:id - Update Single Record
const handleUpdate = async (req, res) => {
  try {
    const cleanId = String(req.params.id).trim();
    const fields = extractMonthlyGoldFields(req.body);

    const result = await db.query(`
      UPDATE monthly_gold_point SET
        "Nama Trainee"       = COALESCE(NULLIF($1, ''), "Nama Trainee"),
        "Active/Expired"     = COALESCE(NULLIF($2, ''), "Active/Expired"),
        "Level"              = COALESCE(NULLIF($3, ''), "Level"),
        "House"              = COALESCE(NULLIF($4, ''), "House"),
        "Class"              = COALESCE(NULLIF($5, ''), "Class"),
        "Branch"             = COALESCE(NULLIF($6, ''), "Branch"),
        "Total Gold/Periode" = COALESCE(NULLIF($7, ''), "Total Gold/Periode"),
        "Junior/Youth"       = COALESCE(NULLIF($8, ''), "Junior/Youth"),
        "RANK/ID"            = COALESCE(NULLIF($9, ''), "RANK/ID"),
        "Rank"               = COALESCE(NULLIF($10, ''), "Rank"),
        "Scope"              = COALESCE(NULLIF($11, ''), "Scope"),
        "Program"            = COALESCE(NULLIF($12, ''), "Program"),
        "Section"            = COALESCE(NULLIF($13, ''), "Section"),
        "Section_No"         = COALESCE(NULLIF($14, ''), "Section_No"),
        "Source_Item"        = COALESCE(NULLIF($15, ''), "Source_Item"),
        "Column_Base"        = COALESCE(NULLIF($16, ''), "Column_Base"),
        "Output_No"          = COALESCE(NULLIF($17, ''), "Output_No"),
        updated_at           = NOW()
      WHERE "ID" = $18
      RETURNING ${SELECT_COLUMNS};
    `, [
      fields.namaTrainee, fields.activeExpired, fields.level, fields.house,
      fields.classVal, fields.branch, fields.totalGoldPeriode, fields.juniorYouth,
      fields.rankId, fields.rank, fields.scope, fields.program, fields.section,
      fields.sectionNo, fields.sourceItem, fields.columnBase, fields.outputNo,
      cleanId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Monthly Gold Point dengan ID "${cleanId}" tidak ditemukan.`
      });
    }

    const updatedRecord = result.rows[0];
    broadcast('UPDATE', updatedRecord);

    res.json({
      success: true,
      message: `Berhasil mengupdate data Monthly Gold Point ID ${cleanId}`,
      data: updatedRecord
    });
  } catch (error) {
    console.error('[Monthly Gold Point] UPDATE error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate data.',
      error: error.message
    });
  }
};

router.put('/:id', handleUpdate);
router.patch('/:id', handleUpdate);

// 6. DELETE /api/monthly-gold-point/truncate - Clear all table rows
router.delete('/truncate', async (req, res) => {
  try {
    await db.query('TRUNCATE TABLE monthly_gold_point CASCADE');
    broadcast('TRUNCATE', { message: 'All monthly_gold_point records cleared' });
    res.json({ success: true, message: 'Seluruh isi tabel monthly_gold_point berhasil dikosongkan.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengosongkan tabel.', error: error.message });
  }
});

// 7. DELETE /api/monthly-gold-point/:id - Delete single record by ID
router.delete('/:id', async (req, res) => {
  const cleanId = String(req.params.id).trim();
  try {
    const result = await db.query('DELETE FROM monthly_gold_point WHERE "ID" = $1 RETURNING *', [cleanId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Tidak ada data Monthly Gold Point dengan ID: ${cleanId}` });
    }

    broadcast('DELETE', { ID: cleanId });

    res.json({ success: true, message: `Data Monthly Gold Point ID ${cleanId} berhasil dihapus.`, deleted: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus data.', error: error.message });
  }
});

module.exports = router;
