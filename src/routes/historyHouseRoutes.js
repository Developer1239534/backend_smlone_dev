const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');
const Ably = require('ably');

// Helper to ensure history_house table exists
async function ensureHistoryHouseTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS history_house (
        "ID" TEXT PRIMARY KEY,
        "Name Corrected" TEXT,
        "Class Corrected" TEXT,
        "House Corrected" TEXT,
        "House" TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error('[History House] Ensure Table error:', err.message);
  }
}

// Initialize Ably if API key is provided
let ably;
try {
  const ablyKey = process.env.ABLY_API_KEY ? process.env.ABLY_API_KEY.trim() : null;
  if (ablyKey) {
    ably = new Ably.Rest(ablyKey);
    console.log('✅ Ably real-time initialized for history_house.');
  }
} catch (err) {
  console.warn('⚠️ Ably warning for history_house:', err.message);
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
      const channel = ably.channels.get('history_house');
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

// Helper to extract fields from request body (supporting exact 5 column names & aliases)
function extractHistoryHouseFields(row) {
  const id              = String(row['ID']              ?? row['id']              ?? row['trainee_id'] ?? row['student_id'] ?? '').trim();
  const name_corrected  = String(row['Name Corrected']  ?? row['name_corrected']  ?? row['Nama'] ?? row['nama'] ?? row['Student Name'] ?? row['name'] ?? '').trim();
  const class_corrected = String(row['Class Corrected'] ?? row['class_corrected'] ?? row['Class'] ?? row['class'] ?? row['class_name'] ?? '').trim();
  const house_corrected = String(row['House Corrected'] ?? row['house_corrected'] ?? '').trim();
  const house           = String(row['House']           ?? row['house']           ?? '').trim();

  return {
    id,
    name_corrected,
    class_corrected,
    house_corrected,
    house
  };
}

// ==========================================
// REAL-TIME SSE STREAM ENDPOINT
// GET /api/history-house/stream or GET /api/history-house/live
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
        "ID", "Name Corrected", "Class Corrected", "House Corrected", "House"
      FROM history_house 
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

// 1. GET /api/history-house - Fetch all records (with pagination & search)
router.get('/', async (req, res) => {
  try {
    await ensureHistoryHouseTable();
    const { id, trainee_id, student_id, search, house, page = 1, limit = 100, all } = req.query;

    let query = `
      SELECT 
        "ID", "Name Corrected", "Class Corrected", "House Corrected", "House"
      FROM history_house
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
      conditions.push(`("ID" ILIKE $${params.length} OR "Name Corrected" ILIKE $${params.length} OR "Class Corrected" ILIKE $${params.length} OR "House Corrected" ILIKE $${params.length} OR "House" ILIKE $${params.length})`);
    }

    if (house) {
      params.push(house.trim());
      conditions.push(`("House Corrected" ILIKE $${params.length} OR "House" ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ` AND ` + conditions.join(' AND ');
    }

    query += ` ORDER BY "ID" ASC`;

    const countQuery = `SELECT COUNT(*) FROM history_house WHERE 1=1` + (conditions.length > 0 ? ` AND ` + conditions.join(' AND ') : '');
    const countResult = await db.query(countQuery, params).catch(() => ({ rows: [{ count: 0 }] }));
    const totalItems = parseInt(countResult.rows[0]?.count || 0, 10);

    if (all === 'true' || all === '1' || limit === '0') {
      const result = await db.query(query, params);
      return res.json({
        success: true,
        message: 'Berhasil mengambil semua data History House.',
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
      message: 'Berhasil mengambil data History House.',
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
    console.error('[History House] GET error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dari database.',
      error: error.message
    });
  }
});

// 2. GET /api/history-house/:id - Get single record by ID
router.get('/:id', async (req, res) => {
  try {
    await ensureHistoryHouseTable();
    const cleanId = String(req.params.id).trim();

    const result = await db.query(`
      SELECT 
        "ID", "Name Corrected", "Class Corrected", "House Corrected", "House"
      FROM history_house
      WHERE "ID" = $1
    `, [cleanId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data History House dengan ID "${cleanId}" tidak ditemukan.`
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[History House] GET ID error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data History House.',
      error: error.message
    });
  }
});

// 3. POST /api/history-house - Create or Update Single Record
router.post('/', async (req, res) => {
  try {
    const fields = extractHistoryHouseFields(req.body);

    if (!fields.id) {
      return res.status(400).json({
        success: false,
        message: 'ID wajib diisi.'
      });
    }

    const result = await db.query(`
      INSERT INTO history_house (
        "ID", "Name Corrected", "Class Corrected", "House Corrected", "House"
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ("ID") DO UPDATE SET
        "Name Corrected"  = EXCLUDED."Name Corrected",
        "Class Corrected" = EXCLUDED."Class Corrected",
        "House Corrected" = EXCLUDED."House Corrected",
        "House"           = EXCLUDED."House",
        updated_at        = NOW()
      RETURNING *
    `, [
      fields.id, fields.name_corrected, fields.class_corrected, fields.house_corrected, fields.house
    ]);

    const newRecord = result.rows[0];
    broadcast('INSERT', newRecord);

    res.status(201).json({
      success: true,
      message: `Berhasil menyimpan data History House ID ${fields.id}`,
      data: newRecord
    });
  } catch (error) {
    console.error('[History House] POST error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan data History House.',
      error: error.message
    });
  }
});

// 4. POST /api/history-house/push - Bulk Upsert Array
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

      const fields = extractHistoryHouseFields(row);

      if (!fields.id) {
        skippedCount++;
        continue;
      }

      try {
        const result = await db.query(`
          INSERT INTO history_house (
            "ID", "Name Corrected", "Class Corrected", "House Corrected", "House"
          ) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT ("ID") DO UPDATE SET
            "Name Corrected"  = EXCLUDED."Name Corrected",
            "Class Corrected" = EXCLUDED."Class Corrected",
            "House Corrected" = EXCLUDED."House Corrected",
            "House"           = EXCLUDED."House",
            updated_at        = NOW()
          RETURNING *
        `, [
          fields.id, fields.name_corrected, fields.class_corrected, fields.house_corrected, fields.house
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
      message: `Berhasil menyimpan/mengupdate ${insertedCount} data ke History House, ${skippedCount} di-skip, ${errorCount} error.`,
      details: { insertedCount, skippedCount, errorCount, errors: errors.slice(0, 10) }
    });
  } catch (error) {
    console.error('[History House Push] Fatal error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi error saat menyimpan data.',
      error: error.message
    });
  }
});

// 5. PUT /api/history-house/:id & PATCH /api/history-house/:id - Update Single Record
const handleUpdate = async (req, res) => {
  try {
    const cleanId = String(req.params.id).trim();
    const fields = extractHistoryHouseFields(req.body);

    const result = await db.query(`
      UPDATE history_house SET
        "Name Corrected"  = COALESCE(NULLIF($1, ''), "Name Corrected"),
        "Class Corrected" = COALESCE(NULLIF($2, ''), "Class Corrected"),
        "House Corrected" = COALESCE(NULLIF($3, ''), "House Corrected"),
        "House"           = COALESCE(NULLIF($4, ''), "House"),
        updated_at        = NOW()
      WHERE "ID" = $5
      RETURNING *
    `, [
      fields.name_corrected, fields.class_corrected, fields.house_corrected, fields.house,
      cleanId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data History House dengan ID "${cleanId}" tidak ditemukan.`
      });
    }

    const updatedRecord = result.rows[0];
    broadcast('UPDATE', updatedRecord);

    res.json({
      success: true,
      message: `Berhasil mengupdate data History House ID ${cleanId}`,
      data: updatedRecord
    });
  } catch (error) {
    console.error('[History House] UPDATE error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate data.',
      error: error.message
    });
  }
};

router.put('/:id', handleUpdate);
router.patch('/:id', handleUpdate);

// 6. DELETE /api/history-house/truncate - Clear all table rows
router.delete('/truncate', async (req, res) => {
  try {
    await db.query('TRUNCATE TABLE history_house');
    broadcast('TRUNCATE', { message: 'All history_house records cleared' });
    res.json({ success: true, message: 'Seluruh isi tabel history_house berhasil dikosongkan.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengosongkan tabel.', error: error.message });
  }
});

// 7. DELETE /api/history-house/:id - Delete single record by ID
router.delete('/:id', async (req, res) => {
  const cleanId = String(req.params.id).trim();
  try {
    const result = await db.query('DELETE FROM history_house WHERE "ID" = $1 RETURNING *', [cleanId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Tidak ada data History House dengan ID: ${cleanId}` });
    }

    broadcast('DELETE', { ID: cleanId });

    res.json({ success: true, message: `Data History House ID ${cleanId} berhasil dihapus.`, deleted: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus data.', error: error.message });
  }
});

module.exports = router;
