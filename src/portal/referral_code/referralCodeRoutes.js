const express = require('express');
const router = express.Router();
const db = require('../../db/neonClient');

/**
 * ============================================================
 * ROUTE: Referral Code Portal (/api/referral-code & /api/portal/referral-code)
 * 3 Kolom Resmi Sesuai Permintaan:
 * 1. ID (Primary Key)
 * 2. Referral Code
 * 3. Name
 * ============================================================
 */

// Helper to ensure referral_code table exists in PostgreSQL / Neon
async function ensureReferralCodeTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS referral_code (
        "ID"            VARCHAR(255) PRIMARY KEY,
        "Referral Code" VARCHAR(255),
        "Name"          VARCHAR(255),
        "created_at"    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_at"    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tambahkan index untuk pencarian cepat
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_referral_code_code ON referral_code ("Referral Code");
      CREATE INDEX IF NOT EXISTS idx_referral_code_name ON referral_code ("Name");
    `);
  } catch (err) {
    console.error('[Referral Code] Ensure table error:', err.message);
  }
}

// Format baris row agar selalu menyajikan 3 kolom resmi beserta alias camelCase / snake_case
function formatReferralCodeRow(row) {
  if (!row) return null;

  const id = String(row["ID"] ?? row.id ?? row.id_trainee ?? '').trim();
  const referralCode = String(
    row["Referral Code"] ??
    row.referral_code ??
    row.referralCode ??
    row.code ??
    row.kode_referral ??
    ''
  ).trim();
  const name = String(row["Name"] ?? row.name ?? row.nama ?? '').trim();

  return {
    // 3 Kolom resmi sesuai format tabel
    "ID": id,
    "Referral Code": referralCode,
    "Name": name,

    // Alias untuk kompatibilitas frontend & konsumsi API mudah
    id: id,
    referral_code: referralCode,
    referralCode: referralCode,
    name: name,
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null
  };
}

// ============================================================
// 1. GET / -> Ambil Semua Data Referral Code (Pagination, Search, Filter)
// ============================================================
router.get('/', async (req, res) => {
  try {
    await ensureReferralCodeTable();

    const {
      search,
      id,
      id_trainee,
      referral_code,
      code,
      name,
      page,
      limit
    } = req.query;

    let query = `
      SELECT
        "ID",
        "Referral Code",
        "Name",
        "created_at",
        "updated_at"
      FROM referral_code
    `;

    const conditions = [];
    const params = [];

    // Filter by global search keyword
    if (search && String(search).trim()) {
      params.push(`%${String(search).trim()}%`);
      conditions.push(`(
        "ID" ILIKE $${params.length}
        OR "Referral Code" ILIKE $${params.length}
        OR "Name" ILIKE $${params.length}
      )`);
    }

    // Filter by specific ID
    const targetId = id || id_trainee;
    if (targetId) {
      params.push(String(targetId).trim());
      conditions.push(`"ID" = $${params.length}`);
    }

    // Filter by Referral Code
    const targetCode = referral_code || code;
    if (targetCode) {
      params.push(String(targetCode).trim());
      conditions.push(`("Referral Code" = $${params.length} OR "Referral Code" ILIKE $${params.length})`);
    }

    // Filter by Name
    if (name) {
      params.push(`%${String(name).trim()}%`);
      conditions.push(`"Name" ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY "ID" ASC';

    // Pagination
    if (limit && !isNaN(limit)) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, parseInt(limit, 10));
      const offset = (pageNum - 1) * limitNum;

      params.push(limitNum, offset);
      query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;
    }

    const result = await db.query(query, params);
    const formatted = result.rows.map(formatReferralCodeRow);

    return res.json({
      success: true,
      message: 'Berhasil mengambil data Referral Code.',
      count: formatted.length,
      total: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('[Referral Code] GET error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data Referral Code dari database.',
      error: error.message
    });
  }
});

// ============================================================
// 2. GET /:identifier -> Ambil single data berdasarkan ID, Referral Code, atau Name
// ============================================================
router.get('/:identifier', async (req, res) => {
  const { identifier } = req.params;

  try {
    await ensureReferralCodeTable();

    const cleanIdentifier = decodeURIComponent(identifier).trim();

    const query = `
      SELECT
        "ID",
        "Referral Code",
        "Name",
        "created_at",
        "updated_at"
      FROM referral_code
      WHERE
        "ID" = $1
        OR "ID" ILIKE $1
        OR "Referral Code" = $1
        OR "Referral Code" ILIKE $1
        OR "Name" ILIKE $1
      ORDER BY "ID" ASC
      LIMIT 1
    `;

    const result = await db.query(query, [cleanIdentifier]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Referral Code tidak ditemukan untuk identifier: "${identifier}"`
      });
    }

    return res.json({
      success: true,
      message: 'Data Referral Code ditemukan.',
      data: formatReferralCodeRow(result.rows[0])
    });
  } catch (error) {
    console.error('[Referral Code] GET by identifier error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal mencari data Referral Code.',
      error: error.message
    });
  }
});

// ============================================================
// 3. POST / -> Tambah atau Upsert Data Referral Code Baru
// ============================================================
router.post('/', async (req, res) => {
  try {
    await ensureReferralCodeTable();

    const body = req.body || {};
    const id = String(body["ID"] ?? body.id ?? body.id_trainee ?? '').trim();
    let referralCode = String(
      body["Referral Code"] ??
      body.referral_code ??
      body.referralCode ??
      body.code ??
      ''
    ).trim();
    const name = String(body["Name"] ?? body.name ?? body.nama ?? '').trim();

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Kolom "ID" wajib diisi.'
      });
    }

    // Jika referral code tidak disediakan, generate otomatis format standar: SML-[ID]-REF
    if (!referralCode) {
      referralCode = `SML-${id}-REF`;
    }

    const upsertQuery = `
      INSERT INTO referral_code ("ID", "Referral Code", "Name", "created_at", "updated_at")
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT ("ID") DO UPDATE SET
        "Referral Code" = EXCLUDED."Referral Code",
        "Name"          = EXCLUDED."Name",
        "updated_at"    = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const result = await db.query(upsertQuery, [id, referralCode, name]);
    const saved = formatReferralCodeRow(result.rows[0]);

    return res.status(201).json({
      success: true,
      message: 'Data Referral Code berhasil disimpan.',
      data: saved
    });
  } catch (error) {
    console.error('[Referral Code] POST error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal menyimpan data Referral Code.',
      error: error.message
    });
  }
});

// ============================================================
// 4. POST /bulk / POST /webhook -> Batch Sync & Upsert Data
// ============================================================
router.post('/bulk', async (req, res) => {
  try {
    await ensureReferralCodeTable();

    const list = Array.isArray(req.body) ? req.body : (req.body?.data || req.body?.items || []);

    if (!Array.isArray(list) || list.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body harus berupa array JSON berisi objek data Referral Code.'
      });
    }

    let successCount = 0;
    const errors = [];

    for (const item of list) {
      const id = String(item["ID"] ?? item.id ?? item.id_trainee ?? '').trim();
      let referralCode = String(
        item["Referral Code"] ??
        item.referral_code ??
        item.referralCode ??
        item.code ??
        ''
      ).trim();
      const name = String(item["Name"] ?? item.name ?? item.nama ?? '').trim();

      if (!id) {
        errors.push({ item, error: 'Kolom ID kosong.' });
        continue;
      }

      if (!referralCode) {
        referralCode = `SML-${id}-REF`;
      }

      try {
        await db.query(`
          INSERT INTO referral_code ("ID", "Referral Code", "Name", "created_at", "updated_at")
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT ("ID") DO UPDATE SET
            "Referral Code" = EXCLUDED."Referral Code",
            "Name"          = EXCLUDED."Name",
            "updated_at"    = CURRENT_TIMESTAMP;
        `, [id, referralCode, name]);
        successCount++;
      } catch (rowErr) {
        errors.push({ id, error: rowErr.message });
      }
    }

    return res.json({
      success: true,
      message: `Bulk upsert selesai. Berhasil: ${successCount}, Gagal: ${errors.length}`,
      successCount,
      failedCount: errors.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('[Referral Code] Bulk POST error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal melakukan bulk upsert data Referral Code.',
      error: error.message
    });
  }
});

// ============================================================
// 5. PUT/:id & PATCH/:id -> Perbarui Data Referral Code
// ============================================================
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const body = req.body || {};

  try {
    await ensureReferralCodeTable();

    const referralCode = body["Referral Code"] ?? body.referral_code ?? body.referralCode ?? body.code;
    const name = body["Name"] ?? body.name ?? body.nama;

    const fields = [];
    const params = [String(id).trim()];

    if (referralCode !== undefined) {
      params.push(String(referralCode).trim());
      fields.push(`"Referral Code" = $${params.length}`);
    }

    if (name !== undefined) {
      params.push(String(name).trim());
      fields.push(`"Name" = $${params.length}`);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada data kolom ("Referral Code" atau "Name") yang dikirim untuk diupdate.'
      });
    }

    fields.push(`"updated_at" = CURRENT_TIMESTAMP`);

    const updateQuery = `
      UPDATE referral_code
      SET ${fields.join(', ')}
      WHERE "ID" = $1
      RETURNING *;
    `;

    const result = await db.query(updateQuery, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Referral Code dengan ID "${id}" tidak ditemukan.`
      });
    }

    return res.json({
      success: true,
      message: `Data Referral Code ID "${id}" berhasil diperbarui.`,
      data: formatReferralCodeRow(result.rows[0])
    });
  } catch (error) {
    console.error('[Referral Code] PUT error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data Referral Code.',
      error: error.message
    });
  }
});

router.patch('/:id', async (req, res) => {
  // PATCH dialihkan ke handler PUT
  req.method = 'PUT';
  router.handle(req, res);
});

// ============================================================
// 6. DELETE /:id -> Hapus Data Referral Code
// ============================================================
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await ensureReferralCodeTable();

    const deleteQuery = `
      DELETE FROM referral_code
      WHERE "ID" = $1
      RETURNING *;
    `;

    const result = await db.query(deleteQuery, [String(id).trim()]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Referral Code dengan ID "${id}" tidak ditemukan.`
      });
    }

    return res.json({
      success: true,
      message: `Data Referral Code ID "${id}" berhasil dihapus.`,
      deletedData: formatReferralCodeRow(result.rows[0])
    });
  } catch (error) {
    console.error('[Referral Code] DELETE error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus data Referral Code.',
      error: error.message
    });
  }
});

// ============================================================
// 7. POST /sync-from-trainees -> Sinkronisasi Otomatis dari profile_trainee
// ============================================================
router.post('/sync-from-trainees', async (req, res) => {
  try {
    await ensureReferralCodeTable();

    // Cek apakah tabel profile_trainee ada
    const checkTable = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profile_trainee'
      );
    `);

    if (!checkTable.rows[0]?.exists) {
      return res.status(404).json({
        success: false,
        message: 'Tabel profile_trainee belum ada di database.'
      });
    }

    // Salin trainee yang belum ada di referral_code
    const syncQuery = `
      INSERT INTO referral_code ("ID", "Referral Code", "Name", "created_at", "updated_at")
      SELECT 
        "ID",
        CONCAT('SML-', "ID", '-REF') AS "Referral Code",
        "Name",
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      FROM profile_trainee
      WHERE "ID" IS NOT NULL AND "ID" != ''
      ON CONFLICT ("ID") DO UPDATE SET
        "Name" = EXCLUDED."Name",
        "updated_at" = CURRENT_TIMESTAMP
      RETURNING "ID";
    `;

    const syncResult = await db.query(syncQuery);

    return res.json({
      success: true,
      message: `Sinkronisasi selesai. Berhasil mensinkronkan ${syncResult.rowCount} data dari profile_trainee.`,
      syncedCount: syncResult.rowCount
    });
  } catch (error) {
    console.error('[Referral Code] Sync error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal mensinkronkan data referral code dari profile_trainee.',
      error: error.message
    });
  }
});

module.exports = router;
