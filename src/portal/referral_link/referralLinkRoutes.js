const express = require('express');
const router = express.Router();
const db = require('../../db/neonClient');

/**
 * ============================================================
 * ROUTE: Referal Link Portal (/api/referral-link & /api/portal/referral-link)
 * Kolom Resmi:
 * 1. ID (Primary Key)
 * 2. Name
 * 3. Class
 * 4. Referal By
 * 5. created_at
 * Tabel Database: referral_link
 * ============================================================
 */

// Helper untuk memastikan tabel referral_link tersedia di Neon / PostgreSQL
async function ensureReferralLinkTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS referral_link (
        "ID"           VARCHAR(255) PRIMARY KEY,
        "Name"         VARCHAR(255),
        "Class"        VARCHAR(255),
        "Referal By"   VARCHAR(255),
        "created_at"   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_at"   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_referral_link_by ON referral_link ("Referal By");
      CREATE INDEX IF NOT EXISTS idx_referral_link_name ON referral_link ("Name");
      CREATE INDEX IF NOT EXISTS idx_referral_link_class ON referral_link ("Class");
    `);
  } catch (err) {
    console.error('[Referal Link] Ensure table error:', err.message);
  }
}

// Format baris row agar selalu menyajikan kolom resmi beserta alias camelCase / snake_case
function formatReferralLinkRow(row) {
  if (!row) return null;

  const id = String(row["ID"] ?? row.id ?? row.id_trainee ?? '').trim();
  const name = String(row["Name"] ?? row.name ?? row.nama ?? '').trim();
  const cls = String(row["Class"] ?? row.class ?? row.kelas ?? '').trim();
  const referalBy = String(
    row["Referal By"] ??
    row.referal_by ??
    row.referral_by ??
    row.referalBy ??
    row.referralBy ??
    row.referred_by ??
    ''
  ).trim();

  return {
    // Kolom resmi sesuai permintaan pengguna
    "ID": id,
    "Name": name,
    "Class": cls,
    "Referal By": referalBy,
    "created_at": row.created_at ?? null,

    // Alias pendukung
    id: id,
    name: name,
    class: cls,
    referal_by: referalBy,
    referral_by: referalBy,
    referalBy: referalBy,
    referralBy: referalBy,
    updated_at: row.updated_at ?? null
  };
}

// ============================================================
// 1. GET / -> Ambil Semua Data Referal Link (Search, Filter, Pagination)
// ============================================================
router.get('/', async (req, res) => {
  try {
    await ensureReferralLinkTable();

    const {
      search,
      id,
      referal_by,
      referral_by,
      name,
      page,
      limit
    } = req.query;

    const targetClass = req.query.class || req.query.Class;

    let query = `
      SELECT
        "ID",
        "Name",
        "Class",
        "Referal By",
        "created_at",
        "updated_at"
      FROM referral_link
    `;

    const conditions = [];
    const params = [];

    // Filter global search
    if (search && String(search).trim()) {
      params.push(`%${String(search).trim()}%`);
      conditions.push(`(
        "ID" ILIKE $${params.length}
        OR "Referal By" ILIKE $${params.length}
        OR "Name" ILIKE $${params.length}
        OR "Class" ILIKE $${params.length}
      )`);
    }

    // Filter by specific ID
    if (id) {
      params.push(String(id).trim());
      conditions.push(`"ID" = $${params.length}`);
    }

    // Filter by Referal By
    const targetReferalBy = referal_by || referral_by;
    if (targetReferalBy) {
      params.push(`%${String(targetReferalBy).trim()}%`);
      conditions.push(`"Referal By" ILIKE $${params.length}`);
    }

    // Filter by Name
    if (name) {
      params.push(`%${String(name).trim()}%`);
      conditions.push(`"Name" ILIKE $${params.length}`);
    }

    // Filter by Class
    if (targetClass) {
      params.push(`%${String(targetClass).trim()}%`);
      conditions.push(`"Class" ILIKE $${params.length}`);
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
    const formatted = result.rows.map(formatReferralLinkRow);

    return res.json({
      success: true,
      message: 'Berhasil mengambil data Referal Link.',
      count: formatted.length,
      total: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('[Referal Link] GET error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data Referal Link dari database.',
      error: error.message
    });
  }
});

// ============================================================
// 2. GET /by/:referalBy -> Ambil semua murid/user yang di-refer oleh kode/nama tertentu
// ============================================================
router.get('/by/:referalBy', async (req, res) => {
  const { referalBy } = req.params;

  try {
    await ensureReferralLinkTable();

    const cleanReferalBy = decodeURIComponent(referalBy).trim();

    const query = `
      SELECT
        "ID",
        "Name",
        "Class",
        "Referal By",
        "created_at",
        "updated_at"
      FROM referral_link
      WHERE "Referal By" = $1 OR "Referal By" ILIKE $1
      ORDER BY "ID" ASC
    `;

    const result = await db.query(query, [cleanReferalBy]);
    const formatted = result.rows.map(formatReferralLinkRow);

    return res.json({
      success: true,
      message: `Ditemukan ${formatted.length} data untuk Referal By: "${referalBy}"`,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('[Referal Link] GET by referalBy error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal mencari data Referal Link.',
      error: error.message
    });
  }
});

// ============================================================
// 3. GET /:identifier -> Ambil single data berdasarkan ID atau Name
// ============================================================
router.get('/:identifier', async (req, res) => {
  const { identifier } = req.params;

  try {
    await ensureReferralLinkTable();

    const cleanIdentifier = decodeURIComponent(identifier).trim();

    const query = `
      SELECT
        "ID",
        "Name",
        "Class",
        "Referal By",
        "created_at",
        "updated_at"
      FROM referral_link
      WHERE
        "ID" = $1
        OR "ID" ILIKE $1
        OR "Name" = $1
        OR "Name" ILIKE $1
      ORDER BY "ID" ASC
      LIMIT 1
    `;

    const result = await db.query(query, [cleanIdentifier]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Referal Link tidak ditemukan untuk identifier: "${identifier}"`
      });
    }

    return res.json({
      success: true,
      message: 'Data Referal Link ditemukan.',
      data: formatReferralLinkRow(result.rows[0])
    });
  } catch (error) {
    console.error('[Referal Link] GET by identifier error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal mencari data Referal Link.',
      error: error.message
    });
  }
});

// ============================================================
// 4. POST / -> Tambah atau Upsert Data Referal Link Baru
// ============================================================
router.post('/', async (req, res) => {
  try {
    await ensureReferralLinkTable();

    const body = req.body || {};
    const id = String(body["ID"] ?? body.id ?? body.id_trainee ?? '').trim();
    const name = String(body["Name"] ?? body.name ?? body.nama ?? '').trim();
    const cls = String(body["Class"] ?? body.class ?? body.kelas ?? '').trim();
    const referalBy = String(
      body["Referal By"] ??
      body.referal_by ??
      body.referral_by ??
      body.referalBy ??
      body.referralBy ??
      body.referred_by ??
      ''
    ).trim();

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Kolom "ID" wajib diisi.'
      });
    }

    const upsertQuery = `
      INSERT INTO referral_link ("ID", "Name", "Class", "Referal By", "created_at", "updated_at")
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT ("ID") DO UPDATE SET
        "Name"       = EXCLUDED."Name",
        "Class"      = EXCLUDED."Class",
        "Referal By" = EXCLUDED."Referal By",
        "updated_at" = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const result = await db.query(upsertQuery, [id, name, cls, referalBy]);
    const saved = formatReferralLinkRow(result.rows[0]);

    return res.status(201).json({
      success: true,
      message: 'Data Referal Link berhasil disimpan.',
      data: saved
    });
  } catch (error) {
    console.error('[Referal Link] POST error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal menyimpan data Referal Link.',
      error: error.message
    });
  }
});

// ============================================================
// 5. POST /bulk / POST /webhook -> Batch Sync & Upsert Data
// ============================================================
router.post('/bulk', async (req, res) => {
  try {
    await ensureReferralLinkTable();

    const list = Array.isArray(req.body) ? req.body : (req.body?.data || req.body?.items || []);

    if (!Array.isArray(list) || list.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body harus berupa array JSON berisi objek data Referal Link.'
      });
    }

    let successCount = 0;
    const errors = [];

    for (const item of list) {
      const id = String(item["ID"] ?? item.id ?? item.id_trainee ?? '').trim();
      const name = String(item["Name"] ?? item.name ?? item.nama ?? '').trim();
      const cls = String(item["Class"] ?? item.class ?? item.kelas ?? '').trim();
      const referalBy = String(
        item["Referal By"] ??
        item.referal_by ??
        item.referral_by ??
        item.referalBy ??
        item.referralBy ??
        item.referred_by ??
        ''
      ).trim();

      if (!id) {
        errors.push({ item, error: 'Kolom ID kosong.' });
        continue;
      }

      try {
        await db.query(`
          INSERT INTO referral_link ("ID", "Name", "Class", "Referal By", "created_at", "updated_at")
          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT ("ID") DO UPDATE SET
            "Name"       = EXCLUDED."Name",
            "Class"      = EXCLUDED."Class",
            "Referal By" = EXCLUDED."Referal By",
            "updated_at" = CURRENT_TIMESTAMP;
        `, [id, name, cls, referalBy]);
        successCount++;
      } catch (err) {
        errors.push({ id, error: err.message });
      }
    }

    return res.json({
      success: true,
      message: `Batch sync Referal Link selesai. Berhasil: ${successCount}, Gagal: ${errors.length}`,
      successCount,
      failedCount: errors.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('[Referal Link] Bulk error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal melakukan bulk sync Referal Link.',
      error: error.message
    });
  }
});

// ============================================================
// 6. PUT /:id -> Update Data Referal Link
// ============================================================
router.put('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await ensureReferralLinkTable();

    const body = req.body || {};
    const name = body["Name"] ?? body.name ?? body.nama;
    const cls = body["Class"] ?? body.class ?? body.kelas;
    const referalBy = body["Referal By"] ?? body.referal_by ?? body.referral_by ?? body.referalBy ?? body.referralBy;

    const updates = [];
    const params = [id];

    if (name !== undefined) {
      params.push(String(name).trim());
      updates.push(`"Name" = $${params.length}`);
    }

    if (cls !== undefined) {
      params.push(String(cls).trim());
      updates.push(`"Class" = $${params.length}`);
    }

    if (referalBy !== undefined) {
      params.push(String(referalBy).trim());
      updates.push(`"Referal By" = $${params.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada data yang dikirim untuk diupdate.'
      });
    }

    updates.push(`"updated_at" = CURRENT_TIMESTAMP`);

    const updateQuery = `
      UPDATE referral_link
      SET ${updates.join(', ')}
      WHERE "ID" = $1
      RETURNING *;
    `;

    const result = await db.query(updateQuery, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Referal Link dengan ID "${id}" tidak ditemukan.`
      });
    }

    return res.json({
      success: true,
      message: 'Data Referal Link berhasil diperbarui.',
      data: formatReferralLinkRow(result.rows[0])
    });
  } catch (error) {
    console.error('[Referal Link] PUT error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data Referal Link.',
      error: error.message
    });
  }
});

// ============================================================
// 7. DELETE /:id -> Hapus Data Referal Link
// ============================================================
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await ensureReferralLinkTable();

    const query = `
      DELETE FROM referral_link
      WHERE "ID" = $1
      RETURNING *;
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Referal Link dengan ID "${id}" tidak ditemukan.`
      });
    }

    return res.json({
      success: true,
      message: `Data Referal Link dengan ID "${id}" berhasil dihapus.`,
      deletedData: formatReferralLinkRow(result.rows[0])
    });
  } catch (error) {
    console.error('[Referal Link] DELETE error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus data Referal Link.',
      error: error.message
    });
  }
});

module.exports = router;
