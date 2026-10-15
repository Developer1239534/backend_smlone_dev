const express = require('express');
const router = express.Router();
const db = require('../../db/neonClient');

/**
 * ============================================================
 * ROUTE: Voucher Real Stage
 * (/api/portal/voucher-real-stage & /api/real-stage)
 *
 * 4 Kolom resmi:
 * 1. NoVoucher (Primary Key)
 * 2. NamaTrainee
 * 3. ID
 * 4. LinkVoucherRealStage
 * ============================================================
 */

// ============================================================
// Helper: Pastikan tabel voucher_real_stage tersedia
// ============================================================
async function ensureVoucherRealStageTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS voucher_real_stage (
        "NoVoucher"            VARCHAR(255) PRIMARY KEY,
        "NamaTrainee"          VARCHAR(255),
        "ID"                   VARCHAR(255),
        "LinkVoucherRealStage" TEXT
      );
    `);
  } catch (err) {
    console.error('[Voucher Real Stage] Ensure table error:', err.message);
  }
}

// Alias untuk backwards compatibility
const ensureRealStageTable = ensureVoucherRealStageTable;

// ============================================================
// Format row
// ============================================================
function formatRealStageRow(row) {
  const noVoucher =
    row["NoVoucher"] ??
    row["No. Voucher"] ??
    row.no_voucher ??
    row.noVoucher ??
    '';

  const namaTrainee =
    row["NamaTrainee"] ??
    row["Nama Trainee"] ??
    row.nama_trainee ??
    row.name ??
    '';

  const id =
    row["ID"] ??
    row["IDTrainee"] ??
    row["ID Trainee"] ??
    row.id_trainee ??
    row.id ??
    '';

  const linkVoucher =
    row["LinkVoucherRealStage"] ??
    row["Link Voucher Real Stage"] ??
    row.link_voucher_real_stage ??
    row.link ??
    '';

  return {
    // 4 kolom resmi
    "NoVoucher": noVoucher,
    "NamaTrainee": namaTrainee,
    "ID": id,
    "LinkVoucherRealStage": linkVoucher,

    // Alias kompatibilitas frontend
    "IDTrainee": id,
    "No. Voucher": noVoucher,
    "Nama Trainee": namaTrainee,
    "ID Trainee": id,
    "Link Voucher Real Stage": linkVoucher,

    no_voucher: noVoucher,
    noVoucher: noVoucher,
    nama_trainee: namaTrainee,
    name: namaTrainee,
    id_trainee: id,
    id: id,
    link_voucher_real_stage: linkVoucher,
    link: linkVoucher
  };
}

// ============================================================
// 1. GET /
// ============================================================
router.get('/', async (req, res) => {
  try {
    await ensureRealStageTable();

    const {
      search,
      id,
      id_trainee,
      no_voucher,
      page,
      limit
    } = req.query;

    let query = `
      SELECT
        "NoVoucher",
        "NamaTrainee",
        "ID",
        "LinkVoucherRealStage"
      FROM voucher_real_stage
    `;

    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search.trim()}%`);

      conditions.push(`(
        "NoVoucher" ILIKE $${params.length}
        OR "NamaTrainee" ILIKE $${params.length}
        OR "ID" ILIKE $${params.length}
      )`);
    }

    const targetId = id || id_trainee;

    if (targetId) {
      params.push(String(targetId).trim());
      conditions.push(`"ID" = $${params.length}`);
    }

    if (no_voucher) {
      params.push(String(no_voucher).trim());
      conditions.push(`"NoVoucher" = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY "NoVoucher" ASC';

    if (limit && !isNaN(limit)) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10);
      const offset = (pageNum - 1) * limitNum;

      params.push(limitNum, offset);

      query += `
        LIMIT $${params.length - 1}
        OFFSET $${params.length}
      `;
    }

    const result = await db.query(query, params);
    const formatted = result.rows.map(formatRealStageRow);

    res.json({
      success: true,
      message: 'Berhasil mengambil data Voucher Real Stage.',
      count: formatted.length,
      total: formatted.length,
      data: formatted
    });

  } catch (error) {
    console.error('[Voucher Real Stage] GET error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dari database.',
      error: error.message
    });
  }
});

// ============================================================
// 2. GET /:identifier
// ============================================================
router.get('/:identifier', async (req, res) => {
  const { identifier } = req.params;

  try {
    await ensureVoucherRealStageTable();

    const query = `
      SELECT
        "NoVoucher",
        "NamaTrainee",
        "ID",
        "LinkVoucherRealStage"
      FROM voucher_real_stage
      WHERE
        "ID" = $1
        OR "ID" ILIKE $1
        OR "NoVoucher" = $1
        OR "NoVoucher" ILIKE $1
      LIMIT 1
    `;

    const result = await db.query(query, [identifier]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Voucher Real Stage tidak ditemukan untuk: ${identifier}`
      });
    }

    res.json({
      success: true,
      data: formatRealStageRow(result.rows[0])
    });

  } catch (error) {
    console.error(
      '[Voucher Real Stage] GET by identifier error:',
      error.message
    );

    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data.',
      error: error.message
    });
  }
});

// ============================================================
// 3. POST /
// Tambah / Update satu data
// ============================================================
router.post('/', async (req, res) => {
  const body = req.body;

  const noVoucher = String(
    body.NoVoucher ??
    body['No. Voucher'] ??
    body.no_voucher ??
    body.noVoucher ??
    body.voucher ??
    ''
  ).trim();

  const namaTrainee = String(
    body.NamaTrainee ??
    body['Nama Trainee'] ??
    body.nama_trainee ??
    body.name ??
    ''
  ).trim();

  const id = String(
    body.ID ??
    body.IDTrainee ??
    body['ID Trainee'] ??
    body.id_trainee ??
    body.id ??
    ''
  ).trim();

  const linkVoucher = String(
    body.LinkVoucherRealStage ??
    body['Link Voucher Real Stage'] ??
    body.link_voucher_real_stage ??
    body.link ??
    ''
  ).trim();

  // NoVoucher adalah PRIMARY KEY
  if (!noVoucher) {
    return res.status(400).json({
      success: false,
      message: 'NoVoucher wajib diisi karena merupakan PRIMARY KEY.'
    });
  }

  try {
    await ensureRealStageTable();

    const result = await db.query(`
      INSERT INTO voucher_real_stage (
        "NoVoucher",
        "NamaTrainee",
        "ID",
        "LinkVoucherRealStage"
      )
      VALUES ($1, $2, $3, $4)

      ON CONFLICT ("NoVoucher")
      DO UPDATE SET
        "NamaTrainee" = EXCLUDED."NamaTrainee",
        "ID" = EXCLUDED."ID",
        "LinkVoucherRealStage" = EXCLUDED."LinkVoucherRealStage"

      RETURNING *;
    `, [
      noVoucher,
      namaTrainee,
      id,
      linkVoucher
    ]);

    res.status(201).json({
      success: true,
      message: 'Data Voucher Real Stage berhasil disimpan/diperbarui.',
      data: formatRealStageRow(result.rows[0])
    });

  } catch (error) {
    console.error(
      '[Voucher Real Stage] POST error:',
      error.message
    );

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================================
// 4. POST /push
// Bulk dari n8n / Google Sheets
// ============================================================
router.post('/push', async (req, res) => {
  try {
    await ensureRealStageTable();

    let data = req.body;

    if (!Array.isArray(data)) {
      data = [data];
    }

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data kosong.'
      });
    }

    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      if (!row || typeof row !== 'object') {
        skippedCount++;
        continue;
      }

      // ========================================================
      // Ambil NoVoucher
      // ========================================================
      const noVoucher = String(
        row.NoVoucher ??
        row['No. Voucher'] ??
        row['No.Voucher'] ??
        row.no_voucher ??
        row.noVoucher ??
        row.voucher ??
        ''
      ).trim();

      // ========================================================
      // Ambil Nama Trainee
      // ========================================================
      const namaTrainee = String(
        row.NamaTrainee ??
        row['Nama Trainee'] ??
        row.nama_trainee ??
        row.name ??
        row.trainee_name ??
        ''
      ).trim();

      // ========================================================
      // Field resmi = ID
      // Tetap menerima alias lama
      // ========================================================
      const id = String(
        row.ID ??
        row.IDTrainee ??
        row['ID Trainee'] ??
        row.id_trainee ??
        row.id ??
        ''
      ).trim();

      // ========================================================
      // Link Voucher
      // ========================================================
      const linkVoucher = String(
        row.LinkVoucherRealStage ??
        row['Link Voucher Real Stage'] ??
        row.link_voucher_real_stage ??
        row.link ??
        row.url ??
        ''
      ).trim();

      // ========================================================
      // NoVoucher WAJIB ada
      // Karena merupakan PRIMARY KEY
      // ========================================================
      if (!noVoucher) {
        skippedCount++;
        continue;
      }

      try {
        await db.query(`
          INSERT INTO voucher_real_stage (
            "NoVoucher",
            "NamaTrainee",
            "ID",
            "LinkVoucherRealStage"
          )
          VALUES ($1, $2, $3, $4)

          ON CONFLICT ("NoVoucher")
          DO UPDATE SET
            "NamaTrainee" = EXCLUDED."NamaTrainee",
            "ID" = EXCLUDED."ID",
            "LinkVoucherRealStage" = EXCLUDED."LinkVoucherRealStage";
        `, [
          noVoucher,
          namaTrainee,
          id,
          linkVoucher
        ]);

        insertedCount++;

      } catch (rowError) {
        errorCount++;

        errors.push({
          index: i,
          NoVoucher: noVoucher,
          ID: id,
          error: rowError.message
        });
      }
    }

    res.json({
      success: true,
      message:
        `Berhasil memproses bulk push Voucher Real Stage: ` +
        `${insertedCount} tersimpan/terupdate, ` +
        `${skippedCount} di-skip, ` +
        `${errorCount} error.`,

      details: {
        insertedCount,
        skippedCount,
        errorCount,
        errors: errors.slice(0, 10)
      }
    });

  } catch (error) {
    console.error(
      '[Voucher Real Stage Push] Fatal error:',
      error.message
    );

    res.status(500).json({
      success: false,
      message: 'Terjadi error saat menyimpan data.',
      error: error.message
    });
  }
});

// ============================================================
// 5. PUT /:identifier
// ============================================================
router.put('/:identifier', async (req, res) => {
  const { identifier } = req.params;
  const body = req.body;

  const noVoucher =
    body.NoVoucher ??
    body['No. Voucher'] ??
    body.no_voucher ??
    body.noVoucher;

  const namaTrainee =
    body.NamaTrainee ??
    body['Nama Trainee'] ??
    body.nama_trainee;

  const id =
    body.ID ??
    body.IDTrainee ??
    body['ID Trainee'] ??
    body.id_trainee ??
    body.id;

  const linkVoucher =
    body.LinkVoucherRealStage ??
    body['Link Voucher Real Stage'] ??
    body.link_voucher_real_stage ??
    body.link;

  try {
    await ensureRealStageTable();

    const result = await db.query(`
      UPDATE voucher_real_stage
      SET
        "NoVoucher" = COALESCE($1, "NoVoucher"),
        "NamaTrainee" = COALESCE($2, "NamaTrainee"),
        "ID" = COALESCE($3, "ID"),
        "LinkVoucherRealStage" =
          COALESCE($4, "LinkVoucherRealStage")

      WHERE
        "NoVoucher" = $5
        OR "ID" = $5

      RETURNING *;
    `, [
      noVoucher,
      namaTrainee,
      id,
      linkVoucher,
      identifier
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data tidak ditemukan.'
      });
    }

    res.json({
      success: true,
      message: 'Data Voucher Real Stage berhasil diperbarui.',
      data: formatRealStageRow(result.rows[0])
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================================
// 6. DELETE /:identifier
// ============================================================
router.delete('/:identifier', async (req, res) => {
  const { identifier } = req.params;

  try {
    await ensureRealStageTable();

    const result = await db.query(`
      DELETE FROM voucher_real_stage
      WHERE
        "ID" = $1
        OR "NoVoucher" = $1
      RETURNING *;
    `, [identifier]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data tidak ditemukan.'
      });
    }

    res.json({
      success: true,
      message: 'Data Voucher Real Stage berhasil dihapus.',
      data: formatRealStageRow(result.rows[0])
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================================
// 8. POST /sync-from-sheet
// Menarik data langsung dari Google Sheet Masterfiles Real Stage 26 (tab TAF Digital x RS)
// Berdasarkan ID siswa yang memiliki RS VOUCHER LINK
// ============================================================
const fs = require('fs');

async function getGoogleAccessToken() {
  const creds = JSON.parse(fs.readFileSync('/root/sa_creds.json'));
  const postData = new URLSearchParams({
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    refresh_token: creds.oauthTokenData.refresh_token,
    grant_type: 'refresh_token'
  }).toString();

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: postData
  });
  const json = await res.json();
  return json.access_token;
}

router.post('/sync-from-sheet', async (req, res) => {
  try {
    await ensureVoucherRealStageTable();
    const token = await getGoogleAccessToken();

    const ssId = '1pdcdOVQbK6UlCe8UUmdSz1rVicsVzK5LRR1AkZAaA5Y';
    const tabName = 'TAF Digital x RS';

    // Ambil baris A6:I1000 lengkap dengan hyperlink formula
    const sheetRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${ssId}?ranges=${encodeURIComponent(tabName + '!A6:I1000')}&fields=sheets(data(rowData(values(hyperlink,formattedValue))))`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const sheetData = await sheetRes.json();
    const rows = sheetData.sheets?.[0]?.data?.[0]?.rowData || [];

    let insertedCount = 0;
    const syncedList = [];

    for (let i = 0; i < rows.length; i++) {
      const cols = rows[i].values || [];
      const id = cols[0]?.formattedValue ? String(cols[0].formattedValue).trim() : '';
      const name = cols[1]?.formattedValue ? String(cols[1].formattedValue).trim() : '';
      const noVoucher = cols[7]?.formattedValue ? String(cols[7].formattedValue).trim() : '';
      const voucherLink = cols[8]?.hyperlink || (cols[8]?.formattedValue ? String(cols[8].formattedValue).trim() : '');

      // Wajib ada ID, NoVoucher, dan Link Google Drive valid
      if (id && noVoucher && voucherLink && voucherLink.startsWith('http')) {
        await db.query(`
          INSERT INTO voucher_real_stage (
            "NoVoucher",
            "NamaTrainee",
            "ID",
            "LinkVoucherRealStage"
          )
          VALUES ($1, $2, $3, $4)
          ON CONFLICT ("NoVoucher")
          DO UPDATE SET
            "NamaTrainee" = EXCLUDED."NamaTrainee",
            "ID" = EXCLUDED."ID",
            "LinkVoucherRealStage" = EXCLUDED."LinkVoucherRealStage";
        `, [noVoucher, name, id, voucherLink]);

        insertedCount++;
        syncedList.push({ id, name, noVoucher, voucherLink });
      }
    }

    res.json({
      success: true,
      message: `Berhasil menyinkronkan ${insertedCount} data RS Voucher Link dari Google Sheet.`,
      count: insertedCount,
      sample: syncedList.slice(0, 5)
    });

  } catch (error) {
    console.error('[Voucher Real Stage] Sync from sheet error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal melakukan sinkronisasi data dari Google Sheet.',
      error: error.message
    });
  }
});

// ============================================================
// 7. DELETE /truncate
// ============================================================
router.delete('/truncate', async (req, res) => {
  try {
    await db.query('TRUNCATE TABLE voucher_real_stage');

    res.json({
      success: true,
      message: 'Seluruh isi tabel voucher_real_stage berhasil dikosongkan.'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengosongkan tabel.',
      error: error.message
    });
  }
});

module.exports = router;