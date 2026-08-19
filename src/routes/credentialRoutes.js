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

// Helper to sanitize string inputs
const cleanStr = (v) => {
  if (v === null || v === undefined || v === 'null') return null;
  const str = String(v).trim();
  return str === '' ? null : str;
};

// Helper to extract fields from request body (supporting 4 exact column names & aliases)
function extractCredentialFields(row) {
  const id = String(row['ID'] ?? row['id'] ?? row['trainee_id'] ?? row['student_id'] ?? '').trim();
  const name = String(row['Name'] ?? row['name'] ?? row['Nama'] ?? row['nama'] ?? '').trim();
  const membershipStatus = String(row['MEMBERSHIP STATUS'] ?? row['Membership Status'] ?? row['membership_status'] ?? row['membership'] ?? '').trim();
  const rawPass = String(row['Password'] ?? row['password'] ?? row['new_password'] ?? '').trim();
  const password = rawPass || (id ? `SML${id}` : '');

  return {
    id,
    name,
    membershipStatus,
    password
  };
}

// SELECT query column list (exact 4 columns)
const SELECT_COLUMNS = `"ID", "Name", "MEMBERSHIP STATUS", "Password"`;

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
      SELECT ${SELECT_COLUMNS}
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

    let query = `SELECT ${SELECT_COLUMNS} FROM credential_portal`;
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
      `SELECT ${SELECT_COLUMNS}
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

// =========================================================
// REAL-TIME RESET PASSWORD ENDPOINT FOR CREDENTIAL PORTAL
// POST /api/credential-portal/reset-password
// =========================================================
router.post('/reset-password', async (req, res) => {
  try {
    const { student_id, id, parent_wa, wa_parent, new_password, password } = req.body;
    const cleanId = String(student_id || id || '').trim();
    const cleanNewPass = String(new_password || password || '').trim();

    if (!cleanId || !cleanNewPass) {
      return res.status(400).json({
        success: false,
        message: 'Student ID dan Password Baru wajib diisi.'
      });
    }

    // 1. Check if trainee exists in credential_portal or profile_trainee
    const credRes = await db.query(
      'SELECT * FROM credential_portal WHERE "ID" = $1',
      [cleanId]
    );

    if (credRes.rows.length === 0) {
      const profRes = await db.query(
        'SELECT * FROM profile_trainee WHERE "ID" = $1',
        [cleanId]
      );
      if (profRes.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Student ID "${cleanId}" tidak ditemukan.`
        });
      }
    }

    // 2. Real-time update Password in credential_portal
    const updateRes = await db.query(`
      INSERT INTO credential_portal ("ID", "Password")
      VALUES ($1, $2)
      ON CONFLICT ("ID") DO UPDATE SET
        "Password" = EXCLUDED."Password"
      RETURNING ${SELECT_COLUMNS};
    `, [cleanId, cleanNewPass]);

    const updatedRecord = updateRes.rows[0];

    // 3. Broadcast Real-time Event (SSE & Ably)
    broadcast('RESET_PASSWORD', updatedRecord);

    return res.json({
      success: true,
      message: `Password untuk Student ID "${cleanId}" berhasil di-reset secara Real-Time!`,
      data: updatedRecord
    });
  } catch (error) {
    console.error('[Credential Reset Password] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal melakukan reset password.',
      error: error.message
    });
  }
});

// POST /api/credential-portal - Create or update single credential (Real-time broadcast)
router.post('/', async (req, res) => {
  try {
    const fields = extractCredentialFields(req.body);

    if (!fields.id) {
      return res.status(400).json({
        success: false,
        message: 'ID wajib diisi'
      });
    }

    const result = await db.query(`
      INSERT INTO credential_portal ("ID", "Name", "MEMBERSHIP STATUS", "Password")
      VALUES ($1, $2, $3, $4)
      ON CONFLICT ("ID") DO UPDATE SET
        "Name" = COALESCE(EXCLUDED."Name", credential_portal."Name"),
        "MEMBERSHIP STATUS" = COALESCE(EXCLUDED."MEMBERSHIP STATUS", credential_portal."MEMBERSHIP STATUS"),
        "Password" = COALESCE(EXCLUDED."Password", credential_portal."Password")
      RETURNING ${SELECT_COLUMNS};
    `, [fields.id, fields.name, fields.membershipStatus, fields.password]);

    const savedRecord = result.rows[0];

    // Real-time broadcast
    broadcast('INSERT', savedRecord);

    res.status(201).json({
      success: true,
      message: `Berhasil menyimpan data Credential Portal ID ${fields.id}`,
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

      const fields = extractCredentialFields(row);

      if (!fields.id) {
        skippedCount++;
        continue;
      }

      try {
        const result = await db.query(`
          INSERT INTO credential_portal ("ID", "Name", "MEMBERSHIP STATUS", "Password")
          VALUES ($1, $2, $3, $4)
          ON CONFLICT ("ID") DO UPDATE SET
            "Name" = COALESCE(EXCLUDED."Name", credential_portal."Name"),
            "MEMBERSHIP STATUS" = COALESCE(EXCLUDED."MEMBERSHIP STATUS", credential_portal."MEMBERSHIP STATUS"),
            "Password" = COALESCE(EXCLUDED."Password", credential_portal."Password")
          RETURNING ${SELECT_COLUMNS};
        `, [fields.id, fields.name, fields.membershipStatus, fields.password]);

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
    const fields = extractCredentialFields(req.body);

    const result = await db.query(`
      UPDATE credential_portal
      SET "Name" = COALESCE(NULLIF($1, ''), "Name"),
          "MEMBERSHIP STATUS" = COALESCE(NULLIF($2, ''), "MEMBERSHIP STATUS"),
          "Password" = COALESCE(NULLIF($3, ''), "Password")
      WHERE "ID" = $4
      RETURNING ${SELECT_COLUMNS};
    `, [fields.name, fields.membershipStatus, fields.password, cleanId]);

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
    console.error('[Credential Portal Update] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate data Credential Portal',
      error: error.message
    });
  }
};

router.put('/:id', handleUpdate);
router.patch('/:id', handleUpdate);

// DELETE /api/credential-portal/truncate - Clear table
router.delete('/truncate', async (req, res) => {
  try {
    await db.query('TRUNCATE TABLE credential_portal;');
    broadcast('TRUNCATE', { message: 'All credential_portal records cleared' });
    res.json({ success: true, message: 'Seluruh isi tabel credential_portal berhasil dikosongkan.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengosongkan tabel.', error: error.message });
  }
});

// DELETE /api/credential-portal/:id - Delete single record by ID
router.delete('/:id', async (req, res) => {
  const cleanId = String(req.params.id).trim();
  try {
    const result = await db.query('DELETE FROM credential_portal WHERE "ID" = $1 RETURNING *', [cleanId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Tidak ada data Credential Portal dengan ID: ${cleanId}` });
    }

    broadcast('DELETE', { ID: cleanId });

    res.json({ success: true, message: `Data Credential Portal ID ${cleanId} berhasil dihapus.`, deleted: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus data.', error: error.message });
  }
});

module.exports = router;
