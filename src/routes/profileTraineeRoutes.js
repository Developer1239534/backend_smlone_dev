const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// Helper to format date strings or null
function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : dateStr;
}

// GET / - Ambil semua data profile_trainee
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM profile_trainee');
    res.json({
      success: true,
      message: 'Berhasil mengambil data Profile Trainee.',
      total: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('[Profile Trainee] GET error:', error.message);
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

    console.log(`[Profile Trainee Push] Received ${data.length} items`);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      if (!row || typeof row !== 'object') {
        console.warn(`[Profile Trainee Push] Skipping invalid row at index ${i}`);
        skippedCount++;
        continue;
      }

      // Map header dari Google Sheets ke nama kolom database
      const id                    = row['ID']                    || row['id']                    || '';
      const nama                  = row['Nama']                  || row['nama']                  || row['Name'] || row['name'] || '';
      const gender                = row['Gender']                || row['gender']                || '';
      const membership            = row['Membership']            || row['membership']            || '';
      const start_date            = parseDate(row['Start Date']   || row['start_date']);
      const expiry_date           = parseDate(row['Expiry Date']  || row['expiry_date']           || row['Exipiry Date']);
      const class_val             = row['Class']                 || row['class']                 || '';
      const house                 = row['House']                 || row['house']                 || '';
      const trainer_homeroom      = row['Trainer Homeroom']      || row['trainer_homeroom']      || '';
      const date_of_birthday      = parseDate(row['Date of Birthday'] || row['date_of_birthday'] || row['Date of Bithday']);
      const kelas                 = row['Kelas']                 || row['kelas']                 || '';
      const email_account_parents = row['Email Account Parents'] || row['email_account_parents'] || '';
      const nomor_wa_parent       = row['Nomor WA Parent']       || row['nomor_wa_parent']       || row['Nomor Wa Parent'] || '';
      const nomor_wa_trainee      = row['Nomor WA Trainee']      || row['nomor_wa_trainee']      || row['Nomor Wa Trainee'] || '';
      const nama_sekolah          = row['Nama Sekolah']          || row['nama_sekolah']          || '';

      if (!id) {
        console.warn(`[Profile Trainee Push] Skipping row ${i}: missing ID`);
        skippedCount++;
        continue;
      }

      try {
        await db.query(
          `INSERT INTO profile_trainee (
             id, nama, gender, membership, start_date, expiry_date, class, house,
             trainer_homeroom, date_of_birthday, kelas, email_account_parents,
             nomor_wa_parent, nomor_wa_trainee, nama_sekolah
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            id, nama, gender, membership, start_date, expiry_date, class_val, house,
            trainer_homeroom, date_of_birthday, kelas, email_account_parents,
            nomor_wa_parent, nomor_wa_trainee, nama_sekolah
          ]
        );
        insertedCount++;
      } catch (rowError) {
        try {
          await db.query(
            `UPDATE profile_trainee SET
               nama                  = $2,
               gender                = $3,
               membership            = $4,
               start_date            = $5,
               expiry_date           = $6,
               class                 = $7,
               house                 = $8,
               trainer_homeroom      = $9,
               date_of_birthday      = $10,
               kelas                 = $11,
               email_account_parents = $12,
               nomor_wa_parent       = $13,
               nomor_wa_trainee      = $14,
               nama_sekolah          = $15
             WHERE id = $1`,
            [
              id, nama, gender, membership, start_date, expiry_date, class_val, house,
              trainer_homeroom, date_of_birthday, kelas, email_account_parents,
              nomor_wa_parent, nomor_wa_trainee, nama_sekolah
            ]
          );
          insertedCount++;
        } catch (updateError) {
          errorCount++;
          errors.push({
            index: i,
            id,
            error: updateError.message
          });
          console.error(`[Profile Trainee Push] Error row ${i} (id: ${id}):`, updateError.message);
        }
      }
    }

    console.log(`[Profile Trainee Push] Done: inserted=${insertedCount}, skipped=${skippedCount}, errors=${errorCount}`);

    res.json({
      success: true,
      message: `Berhasil menyimpan/mengupdate ${insertedCount} data ke Profile Trainee, ${skippedCount} di-skip, ${errorCount} error.`,
      details: { insertedCount, skippedCount, errorCount, errors: errors.slice(0, 10) }
    });

  } catch (error) {
    console.error('[Profile Trainee Push] Fatal error:', error.message);
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
      'DELETE FROM profile_trainee WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Tidak ada data Profile Trainee dengan ID: ${id}`
      });
    }
    res.json({
      success: true,
      message: `Data Profile Trainee ID ${id} berhasil dihapus.`,
      deleted: result.rows[0]
    });
  } catch (error) {
    console.error('[Profile Trainee] DELETE error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data.',
      error: error.message
    });
  }
});

module.exports = router;
