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
    console.log('✅ Ably real-time initialized for profile_trainee.');
  }
} catch (err) {
  console.warn('⚠️ Ably warning for profile_trainee:', err.message);
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
      const channel = ably.channels.get('profile_trainee');
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

// Helper to sanitize string inputs and strip schedule annotations in parentheses e.g. "(Wed 4-6)"
const cleanStr = (v) => {
  if (v === null || v === undefined || v === 'null') return null;
  const str = String(v).replace(/\s*\([^)]*\)/g, '').trim();
  return str === '' ? null : str;
};

// Helper to extract fields from request body (supporting 15 exact column names & aliases)
function extractProfileFields(item) {
  const rawId = item['ID'] || item.id || item.trainee_id || item.student_id;
  const rawNama = item['Nama'] || item.nama || item.name || item.student_name;
  const rawGender = item['Gender'] || item.gender;
  const rawMembership = item['Membership'] || item.membership || item.membership_status;
  const rawStartDate = item['Start Date'] || item.start_date || item.first_enroll;
  const rawExpiryDate = item['Expiry Date'] || item.expiry_date || item.membership_expired_date;
  const rawClass = item['Class'] || item.class || item.class_name;
  const rawHouse = item['House'] || item.house;
  const rawTrainerHomeroom = item['Trainer Homeroom'] || item.trainer_homeroom || item.trainer;
  const rawDob = item['Date of Birthday'] || item.date_of_birthday || item.birthday || item.dob;
  const rawKelas = item['Kelas'] || item.kelas || item.homeroom_kelas || item.class_homeroom;
  const rawEmailParents = item['Email Account Parents'] || item.email_account_parents || item.personal_email || item.email;
  const rawWaParent = item['Nomor WA Parent'] || item.nomor_wa_parent || item.parent_wa_number || item.wa_parent;
  const rawWaTrainee = item['Nomor WA Trainee'] || item.nomor_wa_trainee || item.trainee_wa_number || item.wa_trainee;
  const rawNamaSekolah = item['Nama Sekolah'] || item.nama_sekolah || item.school || item.school_name;

  return {
    id: cleanStr(rawId),
    nama: cleanStr(rawNama),
    gender: cleanStr(rawGender),
    membership: cleanStr(rawMembership),
    startDate: cleanStr(rawStartDate),
    expiryDate: cleanStr(rawExpiryDate),
    className: cleanStr(rawClass),
    house: cleanStr(rawHouse),
    trainerHomeroom: cleanStr(rawTrainerHomeroom),
    dob: cleanStr(rawDob),
    kelas: cleanStr(rawKelas),
    emailParents: cleanStr(rawEmailParents),
    waParent: cleanStr(rawWaParent),
    waTrainee: cleanStr(rawWaTrainee),
    namaSekolah: cleanStr(rawNamaSekolah)
  };
}

// ==========================================
// REAL-TIME SSE STREAM ENDPOINT
// GET /api/profile-trainee/stream or GET /api/profile-trainee/live
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
        "ID", "Nama", "Gender", "Membership", "Start Date", "Expiry Date",
        "Class", "House", "Trainer Homeroom", "Date of Birthday", "Kelas",
        "Email Account Parents", "Nomor WA Parent", "Nomor WA Trainee", "Nama Sekolah"
      FROM profile_trainee 
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

// 1. GET /api/profile-trainee - Retrieve profile trainee records
router.get('/', async (req, res) => {
  try {
    const { search, house, membership, class: classParam, school, page = 1, limit = 50, all } = req.query;
    
    let query = `
      SELECT 
        "ID", "Nama", "Gender", "Membership", "Start Date", "Expiry Date",
        "Class", "House", "Trainer Homeroom", "Date of Birthday", "Kelas",
        "Email Account Parents", "Nomor WA Parent", "Nomor WA Trainee", "Nama Sekolah"
      FROM profile_trainee
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND ("Nama" ILIKE $${params.length} OR "ID" ILIKE $${params.length} OR "Class" ILIKE $${params.length} OR "Nama Sekolah" ILIKE $${params.length})`;
    }
    if (house) {
      params.push(house);
      query += ` AND "House" = $${params.length}`;
    }
    if (membership) {
      params.push(membership);
      query += ` AND "Membership" = $${params.length}`;
    }
    if (classParam) {
      params.push(classParam);
      query += ` AND "Class" = $${params.length}`;
    }
    if (school) {
      params.push(`%${school}%`);
      query += ` AND "Nama Sekolah" ILIKE $${params.length}`;
    }

    query += ` ORDER BY "ID" ASC`;

    if (all === 'true' || all === '1' || limit === '0') {
      const result = await db.query(query, params);
      return res.json({
        success: true,
        count: result.rows.length,
        data: result.rows
      });
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const offset = (pageNum - 1) * limitNum;

    // Count Total Query
    let countQuery = `SELECT COUNT(*) FROM profile_trainee WHERE 1=1`;
    const countParams = [...params];
    if (search) countQuery += ` AND ("Nama" ILIKE $1 OR "ID" ILIKE $1 OR "Class" ILIKE $1 OR "Nama Sekolah" ILIKE $1)`;
    if (house) countQuery += ` AND "House" = $${search ? 2 : 1}`;

    const countRes = await db.query(countQuery, countParams);
    const totalItems = parseInt(countRes.rows[0].count, 10);

    params.push(limitNum);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await db.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      total: totalItems,
      pagination: {
        total: totalItems,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalItems / limitNum) || 1
      },
      data: result.rows
    });
  } catch (err) {
    console.error('[ProfileTrainee] GET Error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data profile_trainee', error: err.message });
  }
});

// 2. GET /api/profile-trainee/:id - Get single trainee profile by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT * FROM profile_trainee WHERE "ID" = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Data trainee dengan ID "${id}" tidak ditemukan.` });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[ProfileTrainee] GET ID Error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data trainee', error: err.message });
  }
});

// 3. POST /api/profile-trainee - Insert Single or Batch Profile Trainee Data (Real-time broadcast)
router.post('/', async (req, res) => {
  try {
    const bodyData = req.body?.data || req.body?.items || req.body;

    if (!bodyData) {
      return res.status(400).json({ success: false, message: 'Request body tidak boleh kosong.' });
    }

    // Handle Array Batch Insert
    if (Array.isArray(bodyData)) {
      if (bodyData.length === 0) {
        return res.status(400).json({ success: false, message: 'Array data tidak boleh kosong.' });
      }

      const replaceMode = req.query.replace === 'true' || req.body?.replace === true;
      if (replaceMode) {
        await db.query('TRUNCATE TABLE profile_trainee;');
      }

      const inserted = [];
      for (const item of bodyData) {
        const fields = extractProfileFields(item);
        if (fields.id && fields.nama) {
          const insertQuery = `
            INSERT INTO profile_trainee (
              "ID", "Nama", "Gender", "Membership", "Start Date", "Expiry Date",
              "Class", "House", "Trainer Homeroom", "Date of Birthday", "Kelas",
              "Email Account Parents", "Nomor WA Parent", "Nomor WA Trainee", "Nama Sekolah"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            ON CONFLICT ("ID") DO UPDATE SET
              "Nama" = EXCLUDED."Nama",
              "Gender" = COALESCE(EXCLUDED."Gender", profile_trainee."Gender"),
              "Membership" = COALESCE(EXCLUDED."Membership", profile_trainee."Membership"),
              "Start Date" = COALESCE(EXCLUDED."Start Date", profile_trainee."Start Date"),
              "Expiry Date" = COALESCE(EXCLUDED."Expiry Date", profile_trainee."Expiry Date"),
              "Class" = COALESCE(EXCLUDED."Class", profile_trainee."Class"),
              "House" = COALESCE(EXCLUDED."House", profile_trainee."House"),
              "Trainer Homeroom" = COALESCE(EXCLUDED."Trainer Homeroom", profile_trainee."Trainer Homeroom"),
              "Date of Birthday" = COALESCE(EXCLUDED."Date of Birthday", profile_trainee."Date of Birthday"),
              "Kelas" = COALESCE(EXCLUDED."Kelas", profile_trainee."Kelas"),
              "Email Account Parents" = COALESCE(EXCLUDED."Email Account Parents", profile_trainee."Email Account Parents"),
              "Nomor WA Parent" = COALESCE(EXCLUDED."Nomor WA Parent", profile_trainee."Nomor WA Parent"),
              "Nomor WA Trainee" = COALESCE(EXCLUDED."Nomor WA Trainee", profile_trainee."Nomor WA Trainee"),
              "Nama Sekolah" = COALESCE(EXCLUDED."Nama Sekolah", profile_trainee."Nama Sekolah")
            RETURNING *;
          `;
          const resQ = await db.query(insertQuery, [
            fields.id, fields.nama, fields.gender, fields.membership, fields.startDate,
            fields.expiryDate, fields.className, fields.house, fields.trainerHomeroom,
            fields.dob, fields.kelas, fields.emailParents, fields.waParent, fields.waTrainee, fields.namaSekolah
          ]);
          inserted.push(resQ.rows[0]);
        }
      }

      broadcast('BULK_INSERT', { count: inserted.length, sample: inserted.slice(0, 5) });

      return res.status(201).json({
        success: true,
        message: `Berhasil menambahkan/memperbarui ${inserted.length} data profile_trainee.`,
        count: inserted.length,
        data: inserted
      });
    }

    // Handle Single Object Insert
    const fields = extractProfileFields(bodyData);

    if (!fields.id || !fields.nama) {
      return res.status(400).json({ success: false, message: 'Field "ID" dan "Nama" wajib diisi.' });
    }

    const insertQuery = `
      INSERT INTO profile_trainee (
        "ID", "Nama", "Gender", "Membership", "Start Date", "Expiry Date",
        "Class", "House", "Trainer Homeroom", "Date of Birthday", "Kelas",
        "Email Account Parents", "Nomor WA Parent", "Nomor WA Trainee", "Nama Sekolah"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT ("ID") DO UPDATE SET
        "Nama" = EXCLUDED."Nama",
        "Gender" = COALESCE(EXCLUDED."Gender", profile_trainee."Gender"),
        "Membership" = COALESCE(EXCLUDED."Membership", profile_trainee."Membership"),
        "Start Date" = COALESCE(EXCLUDED."Start Date", profile_trainee."Start Date"),
        "Expiry Date" = COALESCE(EXCLUDED."Expiry Date", profile_trainee."Expiry Date"),
        "Class" = COALESCE(EXCLUDED."Class", profile_trainee."Class"),
        "House" = COALESCE(EXCLUDED."House", profile_trainee."House"),
        "Trainer Homeroom" = COALESCE(EXCLUDED."Trainer Homeroom", profile_trainee."Trainer Homeroom"),
        "Date of Birthday" = COALESCE(EXCLUDED."Date of Birthday", profile_trainee."Date of Birthday"),
        "Kelas" = COALESCE(EXCLUDED."Kelas", profile_trainee."Kelas"),
        "Email Account Parents" = COALESCE(EXCLUDED."Email Account Parents", profile_trainee."Email Account Parents"),
        "Nomor WA Parent" = COALESCE(EXCLUDED."Nomor WA Parent", profile_trainee."Nomor WA Parent"),
        "Nomor WA Trainee" = COALESCE(EXCLUDED."Nomor WA Trainee", profile_trainee."Nomor WA Trainee"),
        "Nama Sekolah" = COALESCE(EXCLUDED."Nama Sekolah", profile_trainee."Nama Sekolah")
      RETURNING *;
    `;
    const result = await db.query(insertQuery, [
      fields.id, fields.nama, fields.gender, fields.membership, fields.startDate,
      fields.expiryDate, fields.className, fields.house, fields.trainerHomeroom,
      fields.dob, fields.kelas, fields.emailParents, fields.waParent, fields.waTrainee, fields.namaSekolah
    ]);

    const newRecord = result.rows[0];
    broadcast('INSERT', newRecord);

    res.status(201).json({
      success: true,
      message: 'Data profile_trainee berhasil disimpan.',
      data: newRecord
    });
  } catch (err) {
    console.error('[ProfileTrainee] POST Error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal menambahkan data profile_trainee', error: err.message });
  }
});

// 4. PUT /api/profile-trainee/:id & PATCH /api/profile-trainee/:id - Update profile trainee record
const handleUpdate = async (req, res) => {
  try {
    const targetId = req.params.id;
    const body = req.body || {};
    const fields = extractProfileFields(body);

    const updateQuery = `
      UPDATE profile_trainee SET
        "Nama" = COALESCE($1, "Nama"),
        "Gender" = COALESCE($2, "Gender"),
        "Membership" = COALESCE($3, "Membership"),
        "Start Date" = COALESCE($4, "Start Date"),
        "Expiry Date" = COALESCE($5, "Expiry Date"),
        "Class" = COALESCE($6, "Class"),
        "House" = COALESCE($7, "House"),
        "Trainer Homeroom" = COALESCE($8, "Trainer Homeroom"),
        "Date of Birthday" = COALESCE($9, "Date of Birthday"),
        "Kelas" = COALESCE($10, "Kelas"),
        "Email Account Parents" = COALESCE($11, "Email Account Parents"),
        "Nomor WA Parent" = COALESCE($12, "Nomor WA Parent"),
        "Nomor WA Trainee" = COALESCE($13, "Nomor WA Trainee"),
        "Nama Sekolah" = COALESCE($14, "Nama Sekolah")
      WHERE "ID" = $15
      RETURNING *;
    `;
    const result = await db.query(updateQuery, [
      fields.nama, fields.gender, fields.membership, fields.startDate, fields.expiryDate,
      fields.className, fields.house, fields.trainerHomeroom, fields.dob, fields.kelas,
      fields.emailParents, fields.waParent, fields.waTrainee, fields.namaSekolah,
      targetId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Data trainee dengan ID "${targetId}" tidak ditemukan.` });
    }

    const updatedRecord = result.rows[0];
    broadcast('UPDATE', updatedRecord);

    res.json({ success: true, message: 'Data profile_trainee berhasil diperbarui.', data: updatedRecord });
  } catch (err) {
    console.error('[ProfileTrainee] PUT Error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal memperbarui data profile_trainee', error: err.message });
  }
};

router.put('/:id', handleUpdate);
router.patch('/:id', handleUpdate);

// 5. DELETE /api/profile-trainee/:id - Delete profile trainee record
router.delete('/:id', async (req, res) => {
  try {
    const targetId = req.params.id;
    const result = await db.query('DELETE FROM profile_trainee WHERE "ID" = $1 RETURNING *', [targetId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Data trainee dengan ID "${targetId}" tidak ditemukan.` });
    }

    broadcast('DELETE', { ID: targetId });

    res.json({ success: true, message: `Data profile_trainee "${targetId}" berhasil dihapus.`, data: result.rows[0] });
  } catch (err) {
    console.error('[ProfileTrainee] DELETE Error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal menghapus data profile_trainee', error: err.message });
  }
});

module.exports = router;
