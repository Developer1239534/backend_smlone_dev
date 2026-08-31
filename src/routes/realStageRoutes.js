const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// Helper to ensure real_stage table exists
async function ensureRealStageTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS real_stage (
        "No. Voucher"                 VARCHAR(255),
        "Nama Trainee"                VARCHAR(255),
        "ID Trainee"                  VARCHAR(255),
        "Link Voucher Real Stage"     TEXT
      )
    `);
  } catch (err) {
    console.error('[Real Stage] Ensure table error:', err.message);
  }
}

// GET /api/real-stage - Ambil data dari tabel real_stage
router.get('/', async (req, res) => {
  try {
    await ensureRealStageTable();

    const { search, id_trainee, no_voucher, page, limit } = req.query;
    let query = `
      SELECT 
        "No. Voucher",
        "Nama Trainee",
        "ID Trainee",
        "Link Voucher Real Stage"
      FROM real_stage
    `;

    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(
        "No. Voucher" ILIKE $${params.length} OR 
        "Nama Trainee" ILIKE $${params.length} OR 
        "ID Trainee" ILIKE $${params.length}
      )`);
    }

    if (id_trainee) {
      params.push(String(id_trainee).trim());
      conditions.push(`"ID Trainee" = $${params.length}`);
    }

    if (no_voucher) {
      params.push(String(no_voucher).trim());
      conditions.push(`"No. Voucher" = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    if (limit && !isNaN(limit)) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10);
      const offset = (pageNum - 1) * limitNum;
      params.push(limitNum, offset);
      query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;
    }

    const result = await db.query(query, params);

    res.json({
      success: true,
      message: 'Berhasil mengambil data Real Stage.',
      total: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('[Real Stage] GET error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dari database.',
      error: error.message
    });
  }
});

// GET /api/real-stage/:identifier - Ambil satu data real stage berdasarkan ID Trainee atau No Voucher
router.get('/:identifier', async (req, res) => {
  const { identifier } = req.params;
  try {
    await ensureRealStageTable();

    const query = `
      SELECT 
        "No. Voucher",
        "Nama Trainee",
        "ID Trainee",
        "Link Voucher Real Stage"
      FROM real_stage
      WHERE "ID Trainee" = $1 OR "No. Voucher" = $1
      LIMIT 1
    `;

    const result = await db.query(query, [identifier]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Data Real Stage tidak ditemukan untuk: ${identifier}` });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[Real Stage] GET by identifier error:', error.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data.', error: error.message });
  }
});

// POST /api/real-stage/push - Terima data bulk dari n8n / Google Sheets
router.post('/push', async (req, res) => {
  try {
    await ensureRealStageTable();

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

    console.log(`[Real Stage Push] Received ${data.length} items`);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || typeof row !== 'object') {
        skippedCount++;
        continue;
      }

      const no_voucher = String(row['No. Voucher'] ?? row['No.Voucher'] ?? row['no_voucher'] ?? row['voucher'] ?? '').trim();
      const nama_trainee = String(row['Nama Trainee'] ?? row['nama_trainee'] ?? row['name'] ?? row['trainee_name'] ?? '').trim();
      const id_trainee = String(row['ID Trainee'] ?? row['id_trainee'] ?? row['ID'] ?? row['id'] ?? '').trim();
      const link_voucher = String(
        row['Link Voucher Real Stage'] ?? 
        row['Link Voucher real stage'] ?? 
        row['link_voucher_real_stage'] ?? 
        row['link_voucher'] ?? 
        row['link'] ?? 
        ''
      ).trim();

      if (!no_voucher && !id_trainee && !nama_trainee) {
        skippedCount++;
        continue;
      }

      try {
        await db.query(`
          INSERT INTO real_stage (
            "No. Voucher", "Nama Trainee", "ID Trainee", "Link Voucher Real Stage"
          ) VALUES ($1, $2, $3, $4)
        `, [
          no_voucher, nama_trainee, id_trainee, link_voucher
        ]);
        insertedCount++;
      } catch (rowError) {
        errorCount++;
        errors.push({ index: i, no_voucher, id_trainee, error: rowError.message });
      }
    }

    res.json({
      success: true,
      message: `Berhasil memproses data Real Stage: ${insertedCount} tersimpan, ${skippedCount} di-skip, ${errorCount} error.`,
      details: { insertedCount, skippedCount, errorCount, errors: errors.slice(0, 10) }
    });
  } catch (error) {
    console.error('[Real Stage Push] Fatal error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi error saat menyimpan data Real Stage.',
      error: error.message
    });
  }
});

// POST /api/real-stage - Tambah single data
router.post('/', async (req, res) => {
  try {
    await ensureRealStageTable();

    const body = req.body;
    const no_voucher = String(body['No. Voucher'] ?? body.no_voucher ?? '').trim();
    const nama_trainee = String(body['Nama Trainee'] ?? body.nama_trainee ?? '').trim();
    const id_trainee = String(body['ID Trainee'] ?? body.id_trainee ?? '').trim();
    const link_voucher = String(
      body['Link Voucher Real Stage'] ?? 
      body['Link Voucher real stage'] ?? 
      body.link_voucher_real_stage ?? 
      ''
    ).trim();

    const result = await db.query(`
      INSERT INTO real_stage (
        "No. Voucher", "Nama Trainee", "ID Trainee", "Link Voucher Real Stage"
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      no_voucher, nama_trainee, id_trainee, link_voucher
    ]);

    res.status(201).json({
      success: true,
      message: 'Data Real Stage berhasil ditambahkan.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[Real Stage] POST error:', error.message);
    res.status(500).json({ success: false, message: 'Gagal menambahkan data.', error: error.message });
  }
});

// PUT /api/real-stage/:identifier - Update data berdasarkan ID Trainee atau No Voucher
router.put('/:identifier', async (req, res) => {
  const { identifier } = req.params;
  try {
    await ensureRealStageTable();

    const body = req.body;
    const no_voucher = String(body['No. Voucher'] ?? body.no_voucher ?? '').trim();
    const nama_trainee = String(body['Nama Trainee'] ?? body.nama_trainee ?? '').trim();
    const id_trainee = String(body['ID Trainee'] ?? body.id_trainee ?? '').trim();
    const link_voucher = String(
      body['Link Voucher Real Stage'] ?? 
      body['Link Voucher real stage'] ?? 
      body.link_voucher_real_stage ?? 
      ''
    ).trim();

    const result = await db.query(`
      UPDATE real_stage
      SET 
        "No. Voucher" = $1,
        "Nama Trainee" = $2,
        "ID Trainee" = $3,
        "Link Voucher Real Stage" = $4
      WHERE "ID Trainee" = $5 OR "No. Voucher" = $5
      RETURNING *
    `, [no_voucher, nama_trainee, id_trainee, link_voucher, identifier]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Data Real Stage tidak ditemukan untuk: ${identifier}` });
    }

    res.json({
      success: true,
      message: 'Data Real Stage berhasil diupdate.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[Real Stage] PUT error:', error.message);
    res.status(500).json({ success: false, message: 'Gagal mengupdate data.', error: error.message });
  }
});

// DELETE /api/real-stage/truncate - Kosongkan isi tabel
router.delete('/truncate', async (req, res) => {
  try {
    await ensureRealStageTable();
    await db.query('TRUNCATE TABLE real_stage');
    res.json({ success: true, message: 'Seluruh isi tabel real_stage berhasil dikosongkan.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengosongkan tabel.', error: error.message });
  }
});

// DELETE /api/real-stage/:identifier - Hapus satu data berdasarkan ID Trainee atau No Voucher
router.delete('/:identifier', async (req, res) => {
  const { identifier } = req.params;
  try {
    await ensureRealStageTable();
    const result = await db.query('DELETE FROM real_stage WHERE "ID Trainee" = $1 OR "No. Voucher" = $1 RETURNING *', [identifier]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Data Real Stage tidak ditemukan untuk: ${identifier}` });
    }
    res.json({ success: true, message: `Data Real Stage ${identifier} berhasil dihapus.`, deleted: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus data.', error: error.message });
  }
});

module.exports = router;
