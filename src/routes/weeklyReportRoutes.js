const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');
const Ably = require('ably');

// Helper to ensure weekly_report table exists
async function ensureWeeklyReportTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS weekly_report (
        "ID" TEXT PRIMARY KEY,
        "Student Name" TEXT,
        "House" TEXT,
        "Class Trainers" TEXT,
        "Date" TEXT,
        "Coach Feedback" TEXT,
        "Challenge" TEXT,
        "Speaking Project" TEXT,
        "Role 2" TEXT,
        "Role 3" TEXT,
        "Role 4" TEXT,
        "Life Project" TEXT,
        "Win" TEXT,
        "Fav" TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error('[Weekly Report] Ensure Table error:', err.message);
  }
}

// Initialize Ably if API key is provided
let ably;
try {
  const ablyKey = process.env.ABLY_API_KEY ? process.env.ABLY_API_KEY.trim() : null;
  if (ablyKey) {
    ably = new Ably.Rest(ablyKey);
    console.log('✅ Ably real-time initialized for weekly_report.');
  }
} catch (err) {
  console.warn('⚠️ Ably warning for weekly_report:', err.message);
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
      const channel = ably.channels.get('weekly_report');
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

// Helper to extract fields from request body (supporting exact 14 column names & aliases)
function extractWeeklyReportFields(row) {
  const id              = String(row['ID']              ?? row['id']              ?? row['trainee_id'] ?? row['student_id'] ?? '').trim();
  const studentName     = cleanStr(row['Student Name']   ?? row['student_name']   ?? row['Nama'] ?? row['nama'] ?? row['name'] ?? row['Name']);
  const house           = cleanStr(row['House']          ?? row['house']);
  const classTrainers   = cleanStr(row['Class Trainers'] ?? row['class_trainers'] ?? row['Class'] ?? row['class'] ?? row['Trainers']);
  const date            = cleanStr(row['Date']           ?? row['date']           ?? row['Tanggal'] ?? row['tanggal']);
  const coachFeedback   = cleanStr(row['Coach Feedback'] ?? row['coach_feedback'] ?? row['Feedback'] ?? row['feedback']);
  const challenge       = cleanStr(row['Challenge']      ?? row['challenge']);
  const speakingProject = cleanStr(row['Speaking Project']?? row['speaking_project']);
  const role2           = cleanStr(row['Role 2']          ?? row['role_2']          ?? row['role2']);
  const role3           = cleanStr(row['Role 3']          ?? row['role_3']          ?? row['role3']);
  const role4           = cleanStr(row['Role 4']          ?? row['role_4']          ?? row['role4']);
  const lifeProject     = cleanStr(row['Life Project']    ?? row['life_project']);
  const win             = cleanStr(row['Win']             ?? row['win']);
  const fav             = cleanStr(row['Fav']             ?? row['fav']);

  return {
    id,
    studentName,
    house,
    classTrainers,
    date,
    coachFeedback,
    challenge,
    speakingProject,
    role2,
    role3,
    role4,
    lifeProject,
    win,
    fav
  };
}

const SELECT_COLUMNS = `"ID", "Student Name", "House", "Class Trainers", "Date", "Coach Feedback", "Challenge", "Speaking Project", "Role 2", "Role 3", "Role 4", "Life Project", "Win", "Fav"`;

// ==========================================
// REAL-TIME SSE STREAM ENDPOINT
// GET /api/weekly-report/stream or GET /api/weekly-report/live
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
      FROM weekly_report 
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

// 1. GET /api/weekly-report - Fetch all records (with pagination & search)
router.get('/', async (req, res) => {
  try {
    await ensureWeeklyReportTable();
    const { search, page = 1, limit = 100, all } = req.query;

    let query = `SELECT ${SELECT_COLUMNS} FROM weekly_report WHERE 1=1`;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search.trim()}%`);
      conditions.push(`("ID" ILIKE $${params.length} OR "Student Name" ILIKE $${params.length} OR "House" ILIKE $${params.length} OR "Class Trainers" ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ` AND ` + conditions.join(' AND ');
    }

    query += ` ORDER BY "ID" ASC`;

    const countQuery = `SELECT COUNT(*) FROM weekly_report WHERE 1=1` + (conditions.length > 0 ? ` AND ` + conditions.join(' AND ') : '');
    const countResult = await db.query(countQuery, params).catch(() => ({ rows: [{ count: 0 }] }));
    const totalItems = parseInt(countResult.rows[0]?.count || 0, 10);

    if (all === 'true' || all === '1' || limit === '0') {
      const result = await db.query(query, params);
      return res.json({
        success: true,
        message: 'Berhasil mengambil semua data Weekly Report.',
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
      message: 'Berhasil mengambil data Weekly Report.',
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
    console.error('[Weekly Report] GET error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dari database.',
      error: error.message
    });
  }
});

// 2. GET /api/weekly-report/:id - Get single record by ID
router.get('/:id', async (req, res) => {
  try {
    await ensureWeeklyReportTable();
    const cleanId = String(req.params.id).trim();

    const result = await db.query(`
      SELECT ${SELECT_COLUMNS}
      FROM weekly_report
      WHERE "ID" = $1
    `, [cleanId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Weekly Report dengan ID "${cleanId}" tidak ditemukan.`
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[Weekly Report] GET ID error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data Weekly Report.',
      error: error.message
    });
  }
});

// 3. POST /api/weekly-report - Create or Update Single Record
router.post('/', async (req, res) => {
  try {
    const fields = extractWeeklyReportFields(req.body);

    if (!fields.id) {
      return res.status(400).json({
        success: false,
        message: 'Field "ID" wajib diisi.'
      });
    }

    const result = await db.query(`
      INSERT INTO weekly_report (
        "ID", "Student Name", "House", "Class Trainers", "Date",
        "Coach Feedback", "Challenge", "Speaking Project", "Role 2",
        "Role 3", "Role 4", "Life Project", "Win", "Fav"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT ("ID") DO UPDATE SET
        "Student Name"     = EXCLUDED."Student Name",
        "House"            = EXCLUDED."House",
        "Class Trainers"   = EXCLUDED."Class Trainers",
        "Date"             = EXCLUDED."Date",
        "Coach Feedback"   = EXCLUDED."Coach Feedback",
        "Challenge"        = EXCLUDED."Challenge",
        "Speaking Project" = EXCLUDED."Speaking Project",
        "Role 2"           = EXCLUDED."Role 2",
        "Role 3"           = EXCLUDED."Role 3",
        "Role 4"           = EXCLUDED."Role 4",
        "Life Project"     = EXCLUDED."Life Project",
        "Win"              = EXCLUDED."Win",
        "Fav"              = EXCLUDED."Fav",
        updated_at         = NOW()
      RETURNING ${SELECT_COLUMNS};
    `, [
      fields.id, fields.studentName, fields.house, fields.classTrainers, fields.date,
      fields.coachFeedback, fields.challenge, fields.speakingProject, fields.role2,
      fields.role3, fields.role4, fields.lifeProject, fields.win, fields.fav
    ]);

    const newRecord = result.rows[0];
    broadcast('INSERT', newRecord);

    res.status(201).json({
      success: true,
      message: `Berhasil menyimpan data Weekly Report ID ${fields.id}`,
      data: newRecord
    });
  } catch (error) {
    console.error('[Weekly Report] POST error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan data Weekly Report.',
      error: error.message
    });
  }
});

// 4. POST /api/weekly-report/push - Bulk Upsert Array
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

      const fields = extractWeeklyReportFields(row);

      if (!fields.id) {
        skippedCount++;
        continue;
      }

      try {
        const result = await db.query(`
          INSERT INTO weekly_report (
            "ID", "Student Name", "House", "Class Trainers", "Date",
            "Coach Feedback", "Challenge", "Speaking Project", "Role 2",
            "Role 3", "Role 4", "Life Project", "Win", "Fav"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT ("ID") DO UPDATE SET
            "Student Name"     = EXCLUDED."Student Name",
            "House"            = EXCLUDED."House",
            "Class Trainers"   = EXCLUDED."Class Trainers",
            "Date"             = EXCLUDED."Date",
            "Coach Feedback"   = EXCLUDED."Coach Feedback",
            "Challenge"        = EXCLUDED."Challenge",
            "Speaking Project" = EXCLUDED."Speaking Project",
            "Role 2"           = EXCLUDED."Role 2",
            "Role 3"           = EXCLUDED."Role 3",
            "Role 4"           = EXCLUDED."Role 4",
            "Life Project"     = EXCLUDED."Life Project",
            "Win"              = EXCLUDED."Win",
            "Fav"              = EXCLUDED."Fav",
            updated_at         = NOW()
          RETURNING ${SELECT_COLUMNS};
        `, [
          fields.id, fields.studentName, fields.house, fields.classTrainers, fields.date,
          fields.coachFeedback, fields.challenge, fields.speakingProject, fields.role2,
          fields.role3, fields.role4, fields.lifeProject, fields.win, fields.fav
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
      message: `Berhasil menyimpan/mengupdate ${insertedCount} data ke Weekly Report, ${skippedCount} di-skip, ${errorCount} error.`,
      details: { insertedCount, skippedCount, errorCount, errors: errors.slice(0, 10) }
    });
  } catch (error) {
    console.error('[Weekly Report Push] Fatal error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi error saat menyimpan data.',
      error: error.message
    });
  }
});

// 5. PUT /api/weekly-report/:id & PATCH /api/weekly-report/:id - Update Single Record
const handleUpdate = async (req, res) => {
  try {
    const cleanId = String(req.params.id).trim();
    const fields = extractWeeklyReportFields(req.body);

    const result = await db.query(`
      UPDATE weekly_report SET
        "Student Name"     = COALESCE(NULLIF($1, ''), "Student Name"),
        "House"            = COALESCE(NULLIF($2, ''), "House"),
        "Class Trainers"   = COALESCE(NULLIF($3, ''), "Class Trainers"),
        "Date"             = COALESCE(NULLIF($4, ''), "Date"),
        "Coach Feedback"   = COALESCE(NULLIF($5, ''), "Coach Feedback"),
        "Challenge"        = COALESCE(NULLIF($6, ''), "Challenge"),
        "Speaking Project" = COALESCE(NULLIF($7, ''), "Speaking Project"),
        "Role 2"           = COALESCE(NULLIF($8, ''), "Role 2"),
        "Role 3"           = COALESCE(NULLIF($9, ''), "Role 3"),
        "Role 4"           = COALESCE(NULLIF($10, ''), "Role 4"),
        "Life Project"     = COALESCE(NULLIF($11, ''), "Life Project"),
        "Win"              = COALESCE(NULLIF($12, ''), "Win"),
        "Fav"              = COALESCE(NULLIF($13, ''), "Fav"),
        updated_at         = NOW()
      WHERE "ID" = $14
      RETURNING ${SELECT_COLUMNS};
    `, [
      fields.studentName, fields.house, fields.classTrainers, fields.date,
      fields.coachFeedback, fields.challenge, fields.speakingProject, fields.role2,
      fields.role3, fields.role4, fields.lifeProject, fields.win, fields.fav,
      cleanId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Weekly Report dengan ID "${cleanId}" tidak ditemukan.`
      });
    }

    const updatedRecord = result.rows[0];
    broadcast('UPDATE', updatedRecord);

    res.json({
      success: true,
      message: `Berhasil mengupdate data Weekly Report ID ${cleanId}`,
      data: updatedRecord
    });
  } catch (error) {
    console.error('[Weekly Report] UPDATE error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate data.',
      error: error.message
    });
  }
};

router.put('/:id', handleUpdate);
router.patch('/:id', handleUpdate);

// 6. DELETE /api/weekly-report/truncate - Clear all table rows
router.delete('/truncate', async (req, res) => {
  try {
    await db.query('TRUNCATE TABLE weekly_report');
    broadcast('TRUNCATE', { message: 'All weekly_report records cleared' });
    res.json({ success: true, message: 'Seluruh isi tabel weekly_report berhasil dikosongkan.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengosongkan tabel.', error: error.message });
  }
});

// 7. DELETE /api/weekly-report/:id - Delete single record by ID
router.delete('/:id', async (req, res) => {
  const cleanId = String(req.params.id).trim();
  try {
    const result = await db.query('DELETE FROM weekly_report WHERE "ID" = $1 RETURNING *', [cleanId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Tidak ada data Weekly Report dengan ID: ${cleanId}` });
    }

    broadcast('DELETE', { ID: cleanId });

    res.json({ success: true, message: `Data Weekly Report ID ${cleanId} berhasil dihapus.`, deleted: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus data.', error: error.message });
  }
});

module.exports = router;
