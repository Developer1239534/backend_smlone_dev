const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');
const Ably = require('ably');

// Initialize Ably if API key is provided
let ably;
try {
  const ablyKey = process.env.ABLY_API_KEY ? process.env.ABLY_API_KEY.trim() : null;
  if (ablyKey) {
    ably = new Ably.Rest(ablyKey);
    console.log('✅ Ably real-time initialized for credential_portal.');
  }
} catch (err) {
  console.warn('⚠️ Ably warning for credential_portal:', err.message);
}

// Active Server-Sent Events (SSE) subscribers
const sseClients = new Set();

/**
 * Broadcast event to all active SSE clients and Ably channel
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
      const channel = ably.channels.get('credential_portal');
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

// ==========================================
// REAL-TIME SSE STREAM ENDPOINT
// GET /api/credential-portal/stream or GET /api/credential-portal/live
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
      SELECT "ID", "Name", "MEMBERSHIP STATUS", "Password" 
      FROM credential_portal 
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

// GET /api/credential-portal - Fetch all credentials (with search & pagination)
router.get('/', async (req, res) => {
  try {
    const { id, search, page = 1, limit = 100 } = req.query;

    let query = `SELECT "ID", "Name", "MEMBERSHIP STATUS", "Password" FROM credential_portal`;
    const conditions = [];
    const params = [];

    if (id) {
      params.push(String(id).trim());
      conditions.push(`"ID" = $${params.length}`);
    }

    if (search) {
      params.push(`%${search.trim()}%`);
      conditions.push(`("ID" ILIKE $${params.length} OR "Name" ILIKE $${params.length} OR "MEMBERSHIP STATUS" ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY "ID" ASC`;

    const countQuery = `SELECT COUNT(*) FROM credential_portal` + (conditions.length > 0 ? ` WHERE ` + conditions.join(' AND ') : '');
    const countResult = await db.query(countQuery, params);
    const totalItems = parseInt(countResult.rows[0].count, 10);

    if (req.query.all === 'true' || limit === '0') {
      const result = await db.query(query, params);
      return res.json({
        success: true,
        message: 'Berhasil mengambil semua data Credential Portal',
        total: totalItems,
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
      message: 'Berhasil mengambil data Credential Portal',
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
    console.error('[Credential Portal] Fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dari database',
      error: error.message
    });
  }
});

// GET /api/credential-portal/:id - Fetch single credential by ID
router.get('/:id', async (req, res) => {
  try {
    const cleanId = String(req.params.id).trim();

    const result = await db.query(
      `SELECT "ID", "Name", "MEMBERSHIP STATUS", "Password" 
       FROM credential_portal 
       WHERE "ID" = $1`,
      [cleanId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Credential Portal dengan ID "${cleanId}" tidak ditemukan`
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[Credential Portal] Get single error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data Credential Portal',
      error: error.message
    });
  }
});

// POST /api/credential-portal - Create or update single credential (Real-time broadcast)
router.post('/', async (req, res) => {
  try {
    const row = req.body;
    const id = String(row['ID'] ?? row['id'] ?? '').trim();
    const name = String(row['Name'] ?? row['name'] ?? row['Nama'] ?? row['nama'] ?? '').trim();
    const membershipStatus = String(row['MEMBERSHIP STATUS'] ?? row['Membership Status'] ?? row['membership_status'] ?? row['membership'] ?? '').trim();
    const rawPass = String(row['Password'] ?? row['password'] ?? '').trim();
    const password = rawPass || (id ? `SML${id}` : '');

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID wajib diisi'
      });
    }

    const result = await db.query(`
      INSERT INTO credential_portal ("ID", "Name", "MEMBERSHIP STATUS", "Password")
      VALUES ($1, $2, $3, $4)
      ON CONFLICT ("ID") DO UPDATE SET
        "Name" = EXCLUDED."Name",
        "MEMBERSHIP STATUS" = EXCLUDED."MEMBERSHIP STATUS",
        "Password" = EXCLUDED."Password"
      RETURNING "ID", "Name", "MEMBERSHIP STATUS", "Password"
    `, [id, name, membershipStatus, password]);

    const savedRecord = result.rows[0];

    // Real-time broadcast
    broadcast('INSERT', savedRecord);

    res.status(201).json({
      success: true,
      message: `Berhasil menyimpan data Credential Portal ID ${id}`,
      data: savedRecord
    });
  } catch (error) {
    console.error('[Credential Portal] Create/Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan data Credential Portal',
      error: error.message
    });
  }
});

// POST /api/credential-portal/push - Bulk upsert from n8n / Google Sheets (Real-time broadcast)
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

      const id = String(row['ID'] ?? row['id'] ?? '').trim();
      const name = String(row['Name'] ?? row['name'] ?? row['Nama'] ?? row['nama'] ?? '').trim();
      const membershipStatus = String(row['MEMBERSHIP STATUS'] ?? row['Membership Status'] ?? row['membership_status'] ?? row['membership'] ?? '').trim();
      const rawPass = String(row['Password'] ?? row['password'] ?? '').trim();
      const password = rawPass || (id ? `SML${id}` : '');

      if (!id) {
        skippedCount++;
        continue;
      }

      try {
        const result = await db.query(`
          INSERT INTO credential_portal ("ID", "Name", "MEMBERSHIP STATUS", "Password")
          VALUES ($1, $2, $3, $4)
          ON CONFLICT ("ID") DO UPDATE SET
            "Name" = EXCLUDED."Name",
            "MEMBERSHIP STATUS" = EXCLUDED."MEMBERSHIP STATUS",
            "Password" = EXCLUDED."Password"
          RETURNING "ID", "Name", "MEMBERSHIP STATUS", "Password"
        `, [id, name, membershipStatus, password]);

        insertedCount++;
        processedRows.push(result.rows[0]);
      } catch (rowError) {
        errorCount++;
        errors.push({ index: i, id, error: rowError.message });
      }
    }

    if (processedRows.length > 0) {
      broadcast('BULK_UPSERT', { count: processedRows.length, sample: processedRows.slice(0, 5) });
    }

    res.json({
      success: true,
      message: `Berhasil menyimpan/mengupdate ${insertedCount} data ke Credential Portal, ${skippedCount} di-skip, ${errorCount} error.`,
      details: { insertedCount, skippedCount, errorCount, errors: errors.slice(0, 10) }
    });
  } catch (error) {
    console.error('[Credential Portal Push] Fatal error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi error saat menyimpan data.',
      error: error.message
    });
  }
});

// PUT /api/credential-portal/:id & PATCH /api/credential-portal/:id - Update credential by ID (Real-time broadcast)
const handleUpdate = async (req, res) => {
  try {
    const cleanId = String(req.params.id).trim();
    const { name, Name, membershipStatus, 'MEMBERSHIP STATUS': memStat, password, Password } = req.body;

    const newName = name ?? Name;
    const newMem = membershipStatus ?? memStat;
    const newPass = password ?? Password;

    const result = await db.query(`
      UPDATE credential_portal
      SET "Name" = COALESCE($1, "Name"),
          "MEMBERSHIP STATUS" = COALESCE($2, "MEMBERSHIP STATUS"),
          "Password" = COALESCE($3, "Password")
      WHERE "ID" = $4
      RETURNING "ID", "Name", "MEMBERSHIP STATUS", "Password"
    `, [newName, newMem, newPass, cleanId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Credential Portal dengan ID "${cleanId}" tidak ditemukan`
      });
    }

    const updatedRecord = result.rows[0];

    // Real-time broadcast
    broadcast('UPDATE', updatedRecord);

    res.json({
      success: true,
      message: `Berhasil mengupdate data Credential Portal ID ${cleanId}`,
      data: updatedRecord
    });
  } catch (error) {
    console.error('[Credential Portal] Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate data Credential Portal',
      error: error.message
    });
  }
};

router.put('/:id', handleUpdate);
router.patch('/:id', handleUpdate);

// DELETE /api/credential-portal/:id - Delete credential by ID (Real-time broadcast)
router.delete('/:id', async (req, res) => {
  try {
    const cleanId = String(req.params.id).trim();

    const result = await db.query(
      'DELETE FROM credential_portal WHERE "ID" = $1 RETURNING "ID"',
      [cleanId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Tidak ada data Credential Portal dengan ID: ${cleanId}`
      });
    }

    // Real-time broadcast
    broadcast('DELETE', { ID: cleanId });

    res.json({
      success: true,
      message: `Data Credential Portal ID ${cleanId} berhasil dihapus.`,
      deleted: { ID: cleanId }
    });
  } catch (error) {
    console.error('[Credential Portal] DELETE error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data.',
      error: error.message
    });
  }
});

module.exports = router;
