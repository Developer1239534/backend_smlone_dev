const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET / - Ambil semua data credential portal
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM credential_portal');
    res.json({
      success: true,
      message: 'Berhasil mengambil data Credential Portal.',
      total: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('[Credential Portal] GET error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dari database.',
      error: error.message
    });
  }
});

// POST /push - Terima dan simpan data dari n8n / Google Sheets (bulk upsert)
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

    console.log(`[Credential Portal Push] Received ${data.length} items`);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      if (!row || typeof row !== 'object') {
        console.warn(`[Credential Portal Push] Skipping invalid row at index ${i}`);
        skippedCount++;
        continue;
      }

      // Map kolom dari Google Sheets / n8n ke kolom database
      const id                = row['ID']                || row['id']                || '';
      const name              = row['Name']              || row['name']              || row['Nama'] || row['nama'] || '';
      const membership_status = row['MEMBERSHIP STATUS'] || row['Membership Status'] || row['membership_status'] || row['membership'] || '';
      const password          = row['Password']          || row['password']          || '';

      // Wajib ada id
      if (!id) {
        console.warn(`[Credential Portal Push] Skipping row ${i}: missing ID`);
        skippedCount++;
        continue;
      }

      try {
        await db.query(
          `INSERT INTO credential_portal (id, nama, name, membership_status, password)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, name, name, membership_status, password]
        );
        insertedCount++;
      } catch (rowError) {
        try {
          await db.query(
            `UPDATE credential_portal 
             SET nama = $2, name = $3, membership_status = $4, password = $5
             WHERE id = $1`,
            [id, name, name, membership_status, password]
          );
          insertedCount++;
        } catch (updateError) {
          errorCount++;
          errors.push({
            index: i,
            id,
            error: updateError.message
          });
          console.error(`[Credential Portal Push] Error row ${i} (id: ${id}):`, updateError.message);
        }
      }
    }

    console.log(`[Credential Portal Push] Done: inserted=${insertedCount}, skipped=${skippedCount}, errors=${errorCount}`);

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

// DELETE /:id - Hapus data berdasarkan id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'DELETE FROM credential_portal WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Tidak ada data Credential Portal dengan ID: ${id}`
      });
    }
    res.json({
      success: true,
      message: `Data Credential Portal ID ${id} berhasil dihapus.`,
      deleted: result.rows[0]
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
