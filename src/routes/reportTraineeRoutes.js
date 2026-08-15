const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');
const Ably = require('ably');

// Initialize Ably if API key is provided in environment
let ably;
try {
  const ablyKey = process.env.ABLY_API_KEY ? process.env.ABLY_API_KEY.trim() : null;
  if (ablyKey) {
    ably = new Ably.Rest(ablyKey);
    console.log('✅ Ably real-time initialized for report_trainee.');
  }
} catch (err) {
  console.warn('⚠️ Ably real-time warning for report_trainee:', err.message);
}

// Store active Server-Sent Events (SSE) clients
const sseClients = new Set();

/**
 * Broadcast event to all SSE clients and Ably channel
 */
async function broadcast(eventType, data) {
  const payload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    data: data
  };

  // 1. Broadcast via Server-Sent Events (SSE)
  const message = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(message);
    } catch (e) {
      sseClients.delete(client);
    }
  });

  // 2. Broadcast via Ably Realtime
  if (ably) {
    try {
      const channel = ably.channels.get('report_trainee');
      await channel.publish(eventType, payload);
    } catch (err) {
      console.error('[Ably Publish Error]:', err.message);
    }
  }
}

// Send periodic SSE keep-alive heartbeat ping every 20 seconds
setInterval(() => {
  sseClients.forEach((client) => {
    try {
      client.write(': ping\n\n');
    } catch (e) {
      sseClients.delete(client);
    }
  });
}, 20000);

// ==========================================
// REAL-TIME SSE ENDPOINTS
// GET /api/report-trainee/stream or GET /api/report-trainee/live
// ==========================================
const handleStream = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering
  res.flushHeaders && res.flushHeaders();

  // Add client to active SSE subscribers
  sseClients.add(res);

  // Send initial data state on connection
  try {
    const result = await db.query('SELECT "ID", reports, created_at, updated_at FROM report_trainee ORDER BY "ID" ASC');
    const initPayload = {
      event: 'init',
      timestamp: new Date().toISOString(),
      data: result.rows
    };
    res.write(`event: init\ndata: ${JSON.stringify(initPayload)}\n\n`);
  } catch (err) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
  }

  // Remove client when connection closes
  req.on('close', () => {
    sseClients.delete(res);
  });
};

router.get('/stream', handleStream);
router.get('/live', handleStream);

// ==========================================
// RESTful CRUD ENDPOINTS
// ==========================================

// GET /api/report-trainee - Fetch all records
router.get('/', async (req, res) => {
  try {
    const { id, search, page = 1, limit = 100 } = req.query;

    let query = `SELECT "ID", reports, created_at, updated_at FROM report_trainee`;
    const conditions = [];
    const params = [];

    if (id) {
      params.push(parseInt(id, 10) || id);
      conditions.push(`"ID" = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(CAST("ID" AS TEXT) ILIKE $${params.length} OR reports ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY "ID" ASC`;

    const countQuery = `SELECT COUNT(*) FROM report_trainee` + (conditions.length > 0 ? ` WHERE ` + conditions.join(' AND ') : '');
    const countResult = await db.query(countQuery, params);
    const totalItems = parseInt(countResult.rows[0].count, 10);

    if (req.query.all === 'true' || limit === '0') {
      const result = await db.query(query, params);
      return res.json({
        success: true,
        data: result.rows,
        total: totalItems
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
      data: result.rows,
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
    console.error('[ReportTrainee] Fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data report_trainee',
      error: error.message
    });
  }
});

// GET /api/report-trainee/:id - Fetch single record by ID
router.get('/:id', async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (isNaN(targetId)) {
      return res.status(400).json({ success: false, message: 'ID tidak valid' });
    }

    const result = await db.query(
      `SELECT "ID", reports, created_at, updated_at FROM report_trainee WHERE "ID" = $1`,
      [targetId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data report_trainee dengan ID ${targetId} tidak ditemukan`
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[ReportTrainee] Get single error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data report_trainee',
      error: error.message
    });
  }
});

// POST /api/report-trainee - Create new record (Real-time broadcast)
router.post('/', async (req, res) => {
  try {
    const { reports, ID, id } = req.body;
    const customId = ID || id;

    let result;
    if (customId) {
      result = await db.query(
        `INSERT INTO report_trainee ("ID", reports, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         ON CONFLICT ("ID") DO UPDATE SET
           reports = EXCLUDED.reports,
           updated_at = NOW()
         RETURNING "ID", reports, created_at, updated_at`,
        [parseInt(customId, 10), reports || '']
      );
    } else {
      result = await db.query(
        `INSERT INTO report_trainee (reports, created_at, updated_at)
         VALUES ($1, NOW(), NOW())
         RETURNING "ID", reports, created_at, updated_at`,
        [reports || '']
      );
    }

    const newRecord = result.rows[0];

    // Real-time notification broadcast
    broadcast('INSERT', newRecord);

    res.status(201).json({
      success: true,
      message: 'Berhasil menambahkan data report_trainee',
      data: newRecord
    });
  } catch (error) {
    console.error('[ReportTrainee] Create error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan data report_trainee',
      error: error.message
    });
  }
});

// PUT /api/report-trainee/:id & PATCH /api/report-trainee/:id - Update record (Real-time broadcast)
const handleUpdate = async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (isNaN(targetId)) {
      return res.status(400).json({ success: false, message: 'ID tidak valid' });
    }

    const { reports } = req.body;

    const result = await db.query(
      `UPDATE report_trainee
       SET reports = COALESCE($1, reports),
           updated_at = NOW()
       WHERE "ID" = $2
       RETURNING "ID", reports, created_at, updated_at`,
      [reports, targetId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data report_trainee dengan ID ${targetId} tidak ditemukan`
      });
    }

    const updatedRecord = result.rows[0];

    // Real-time notification broadcast
    broadcast('UPDATE', updatedRecord);

    res.json({
      success: true,
      message: `Berhasil mengupdate data report_trainee ID ${targetId}`,
      data: updatedRecord
    });
  } catch (error) {
    console.error('[ReportTrainee] Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate data report_trainee',
      error: error.message
    });
  }
};

router.put('/:id', handleUpdate);
router.patch('/:id', handleUpdate);

// DELETE /api/report-trainee/:id - Delete record (Real-time broadcast)
router.delete('/:id', async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (isNaN(targetId)) {
      return res.status(400).json({ success: false, message: 'ID tidak valid' });
    }

    const result = await db.query(
      `DELETE FROM report_trainee WHERE "ID" = $1 RETURNING "ID"`,
      [targetId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data report_trainee dengan ID ${targetId} tidak ditemukan`
      });
    }

    // Real-time notification broadcast
    broadcast('DELETE', { ID: targetId });

    res.json({
      success: true,
      message: `Berhasil menghapus data report_trainee ID ${targetId}`,
      data: { ID: targetId }
    });
  } catch (error) {
    console.error('[ReportTrainee] Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data report_trainee',
      error: error.message
    });
  }
});

module.exports = router;
