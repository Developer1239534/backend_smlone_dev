const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');
const Ably = require('ably');

// Helper to ensure report_progres table exists
async function ensureReportProgresTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS report_progres (
        "ID" TEXT PRIMARY KEY,
        "Student Name" TEXT,
        "Level" TEXT,
        "Latest Speaking Project" TEXT,
        "Speaking Project to Next Level" TEXT,
        "Last Speaker date" TEXT,
        "Latest Life Project" TEXT,
        "Life Project to Next Level" TEXT,
        "Last Life Project Date" TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error('[Report Progres] Ensure Table error:', err.message);
  }
}

// Initialize Ably if API key is provided
let ably;
try {
  const ablyKey = process.env.ABLY_API_KEY ? process.env.ABLY_API_KEY.trim() : null;
  if (ablyKey) {
    ably = new Ably.Rest(ablyKey);
    console.log('✅ Ably real-time initialized for report_progres.');
  }
} catch (err) {
  console.warn('⚠️ Ably warning for report_progres:', err.message);
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
      const channel = ably.channels.get('report_progres');
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

// Helper to extract fields from request body (supporting exact 9 column names & aliases)
function extractReportProgresFields(row) {
  const id                             = String(row['ID']                             ?? row['id']                             ?? row['trainee_id'] ?? row['student_id'] ?? '').trim();
  const student_name                   = String(row['Student Name']                   ?? row['student_name']                   ?? row['Nama'] ?? row['nama'] ?? row['Nama Trainee'] ?? row['name'] ?? '').trim();
  const level                          = String(row['Level']                          ?? row['level']                          ?? '').trim();
  const latest_speaking_project        = String(row['Latest Speaking Project']        ?? row['latest_speaking_project']        ?? row['speaking_project'] ?? '').trim();
  const speaking_project_to_next_level = String(row['Speaking Project to Next Level'] ?? row['speaking_project_to_next_level'] ?? '').trim();
  const last_speaker_date              = String(row['Last Speaker date']              ?? row['last_speaker_date']              ?? row['last_speaking_date'] ?? '').trim();
  const latest_life_project            = String(row['Latest Life Project']            ?? row['latest_life_project']            ?? row['life_project'] ?? '').trim();
  const life_project_to_next_level     = String(row['Life Project to Next Level']     ?? row['life_project_to_next_level']     ?? '').trim();
  const last_life_project_date         = String(row['Last Life Project Date']         ?? row['last_life_project_date']         ?? '').trim();

  return {
    id,
    student_name,
    level,
    latest_speaking_project,
    speaking_project_to_next_level,
    last_speaker_date,
    latest_life_project,
    life_project_to_next_level,
    last_life_project_date
  };
}

// ==========================================
// REAL-TIME SSE STREAM ENDPOINT
// GET /api/report-progres/stream or GET /api/report-progres/live
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
      SELECT 
        "ID", "Student Name", "Level", "Latest Speaking Project",
        "Speaking Project to Next Level", "Last Speaker date",
        "Latest Life Project", "Life Project to Next Level", "Last Life Project Date"
      FROM report_progres 
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

// 1. GET /api/report-progres - Fetch all records (with pagination & search)
router.get('/', async (req, res) => {
  try {
    await ensureReportProgresTable();
    const { id, trainee_id, student_id, search, level, page = 1, limit = 100, all } = req.query;

    let query = `
      SELECT 
        "ID", "Student Name", "Level", "Latest Speaking Project",
        "Speaking Project to Next Level", "Last Speaker date",
        "Latest Life Project", "Life Project to Next Level", "Last Life Project Date"
      FROM report_progres
      WHERE 1=1
    `;
    const conditions = [];
    const params = [];

    const targetId = id || trainee_id || student_id;
    if (targetId) {
      params.push(String(targetId).trim());
      conditions.push(`"ID" = $${params.length}`);
    }

    if (search) {
      params.push(`%${search.trim()}%`);
      conditions.push(`("ID" ILIKE $${params.length} OR "Student Name" ILIKE $${params.length} OR "Latest Speaking Project" ILIKE $${params.length} OR "Latest Life Project" ILIKE $${params.length})`);
    }

    if (level) {
      params.push(level.trim());
      conditions.push(`"Level" ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` AND ` + conditions.join(' AND ');
    }

    query += ` ORDER BY "ID" ASC`;

    const countQuery = `SELECT COUNT(*) FROM report_progres WHERE 1=1` + (conditions.length > 0 ? ` AND ` + conditions.join(' AND ') : '');
    const countResult = await db.query(countQuery, params).catch(() => ({ rows: [{ count: 0 }] }));
    const totalItems = parseInt(countResult.rows[0]?.count || 0, 10);

    if (all === 'true' || all === '1' || limit === '0') {
      const result = await db.query(query, params);
      return res.json({
        success: true,
        message: 'Berhasil mengambil semua data Report Progres.',
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
      message: 'Berhasil mengambil data Report Progres.',
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
    console.error('[Report Progres] GET error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dari database.',
      error: error.message
    });
  }
});

// 2. GET /api/report-progres/:id - Get single record by ID
router.get('/:id', async (req, res) => {
  try {
    await ensureReportProgresTable();
    const cleanId = String(req.params.id).trim();

    const result = await db.query(`
      SELECT 
        "ID", "Student Name", "Level", "Latest Speaking Project",
        "Speaking Project to Next Level", "Last Speaker date",
        "Latest Life Project", "Life Project to Next Level", "Last Life Project Date"
      FROM report_progres
      WHERE "ID" = $1
    `, [cleanId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Report Progres dengan ID "${cleanId}" tidak ditemukan.`
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[Report Progres] GET ID error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data Report Progres.',
      error: error.message
    });
  }
});

// 3. POST /api/report-progres - Create or Update Single Record
router.post('/', async (req, res) => {
  try {
    const fields = extractReportProgresFields(req.body);

    if (!fields.id) {
      return res.status(400).json({
        success: false,
        message: 'ID wajib diisi.'
      });
    }

    const result = await db.query(`
      INSERT INTO report_progres (
        "ID", "Student Name", "Level", "Latest Speaking Project",
        "Speaking Project to Next Level", "Last Speaker date",
        "Latest Life Project", "Life Project to Next Level", "Last Life Project Date"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT ("ID") DO UPDATE SET
        "Student Name"                   = EXCLUDED."Student Name",
        "Level"                          = EXCLUDED."Level",
        "Latest Speaking Project"        = EXCLUDED."Latest Speaking Project",
        "Speaking Project to Next Level" = EXCLUDED."Speaking Project to Next Level",
        "Last Speaker date"              = EXCLUDED."Last Speaker date",
        "Latest Life Project"            = EXCLUDED."Latest Life Project",
        "Life Project to Next Level"     = EXCLUDED."Life Project to Next Level",
        "Last Life Project Date"         = EXCLUDED."Last Life Project Date",
        updated_at                       = NOW()
      RETURNING *
    `, [
      fields.id, fields.student_name, fields.level, fields.latest_speaking_project,
      fields.speaking_project_to_next_level, fields.last_speaker_date,
      fields.latest_life_project, fields.life_project_to_next_level, fields.last_life_project_date
    ]);

    const newRecord = result.rows[0];
    broadcast('INSERT', newRecord);

    res.status(201).json({
      success: true,
      message: `Berhasil menyimpan data Report Progres ID ${fields.id}`,
      data: newRecord
    });
  } catch (error) {
    console.error('[Report Progres] POST error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan data Report Progres.',
      error: error.message
    });
  }
});

// 4. POST /api/report-progres/push - Bulk Upsert Array
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

      const fields = extractReportProgresFields(row);

      if (!fields.id) {
        skippedCount++;
        continue;
      }

      try {
        const result = await db.query(`
          INSERT INTO report_progres (
            "ID", "Student Name", "Level", "Latest Speaking Project",
            "Speaking Project to Next Level", "Last Speaker date",
            "Latest Life Project", "Life Project to Next Level", "Last Life Project Date"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT ("ID") DO UPDATE SET
            "Student Name"                   = EXCLUDED."Student Name",
            "Level"                          = EXCLUDED."Level",
            "Latest Speaking Project"        = EXCLUDED."Latest Speaking Project",
            "Speaking Project to Next Level" = EXCLUDED."Speaking Project to Next Level",
            "Last Speaker date"              = EXCLUDED."Last Speaker date",
            "Latest Life Project"            = EXCLUDED."Latest Life Project",
            "Life Project to Next Level"     = EXCLUDED."Life Project to Next Level",
            "Last Life Project Date"         = EXCLUDED."Last Life Project Date",
            updated_at                       = NOW()
          RETURNING *
        `, [
          fields.id, fields.student_name, fields.level, fields.latest_speaking_project,
          fields.speaking_project_to_next_level, fields.last_speaker_date,
          fields.latest_life_project, fields.life_project_to_next_level, fields.last_life_project_date
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
      message: `Berhasil menyimpan/mengupdate ${insertedCount} data ke Report Progres, ${skippedCount} di-skip, ${errorCount} error.`,
      details: { insertedCount, skippedCount, errorCount, errors: errors.slice(0, 10) }
    });
  } catch (error) {
    console.error('[Report Progres Push] Fatal error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi error saat menyimpan data.',
      error: error.message
    });
  }
});

// 5. PUT /api/report-progres/:id & PATCH /api/report-progres/:id - Update Single Record
const handleUpdate = async (req, res) => {
  try {
    const cleanId = String(req.params.id).trim();
    const fields = extractReportProgresFields(req.body);

    const result = await db.query(`
      UPDATE report_progres SET
        "Student Name"                   = COALESCE(NULLIF($1, ''), "Student Name"),
        "Level"                          = COALESCE(NULLIF($2, ''), "Level"),
        "Latest Speaking Project"        = COALESCE(NULLIF($3, ''), "Latest Speaking Project"),
        "Speaking Project to Next Level" = COALESCE(NULLIF($4, ''), "Speaking Project to Next Level"),
        "Last Speaker date"              = COALESCE(NULLIF($5, ''), "Last Speaker date"),
        "Latest Life Project"            = COALESCE(NULLIF($6, ''), "Latest Life Project"),
        "Life Project to Next Level"     = COALESCE(NULLIF($7, ''), "Life Project to Next Level"),
        "Last Life Project Date"         = COALESCE(NULLIF($8, ''), "Last Life Project Date"),
        updated_at                       = NOW()
      WHERE "ID" = $9
      RETURNING *
    `, [
      fields.student_name, fields.level, fields.latest_speaking_project,
      fields.speaking_project_to_next_level, fields.last_speaker_date,
      fields.latest_life_project, fields.life_project_to_next_level, fields.last_life_project_date,
      cleanId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Report Progres dengan ID "${cleanId}" tidak ditemukan.`
      });
    }

    const updatedRecord = result.rows[0];
    broadcast('UPDATE', updatedRecord);

    res.json({
      success: true,
      message: `Berhasil mengupdate data Report Progres ID ${cleanId}`,
      data: updatedRecord
    });
  } catch (error) {
    console.error('[Report Progres] UPDATE error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate data.',
      error: error.message
    });
  }
};

router.put('/:id', handleUpdate);
router.patch('/:id', handleUpdate);

// 6. DELETE /api/report-progres/truncate - Clear all table rows
router.delete('/truncate', async (req, res) => {
  try {
    await db.query('TRUNCATE TABLE report_progres');
    broadcast('TRUNCATE', { message: 'All report_progres records cleared' });
    res.json({ success: true, message: 'Seluruh isi tabel report_progres berhasil dikosongkan.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengosongkan tabel.', error: error.message });
  }
});

// 7. DELETE /api/report-progres/:id - Delete single record by ID
router.delete('/:id', async (req, res) => {
  const cleanId = String(req.params.id).trim();
  try {
    const result = await db.query('DELETE FROM report_progres WHERE "ID" = $1 RETURNING *', [cleanId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Tidak ada data Report Progres dengan ID: ${cleanId}` });
    }

    broadcast('DELETE', { ID: cleanId });

    res.json({ success: true, message: `Data Report Progres ID ${cleanId} berhasil dihapus.`, deleted: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus data.', error: error.message });
  }
});

module.exports = router;
