const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

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

// GET /:id - Ambil data profile trainee berdasarkan ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM profile_trainee WHERE "ID" = $1 OR "ID" ILIKE $1 LIMIT 1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Profile Trainee dengan ID: ${id} tidak ditemukan.`
      });
    }

    const row = result.rows[0];
    res.json({
      success: true,
      message: `Berhasil mengambil data Profile Trainee ID ${id}.`,
      data: row,
      id: row["ID"],
      ID: row["ID"],
      name: row["Nama"],
      Nama: row["Nama"],
      gender: row["Gender"],
      Gender: row["Gender"],
      membership: row["Membership"],
      Membership: row["Membership"],
      class: row["Class"],
      Class: row["Class"],
      house: row["House"],
      House: row["House"],
      trainer_homeroom: row["Trainer Homeroom"],
      "Trainer Homeroom": row["Trainer Homeroom"],
      date_of_birthday: row["Date of Birthday"],
      "Date of Birthday": row["Date of Birthday"],
      kelas: row["Kelas"],
      Kelas: row["Kelas"],
      email_account_parents: row["Email Account Parents"],
      "Email Account Parents": row["Email Account Parents"],
      nomor_wa_parent: row["Nomor WA Parent"],
      "Nomor WA Parent": row["Nomor WA Parent"],
      nomor_wa_trainee: row["Nomor WA Trainee"],
      "Nomor WA Trainee": row["Nomor WA Trainee"],
      nama_sekolah: row["Nama Sekolah"],
      "Nama Sekolah": row["Nama Sekolah"]
    });
  } catch (error) {
    console.error('[Profile Trainee] GET :id error:', error.message);
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

      // Map exact keys without underscores as requested
      const id                    = String(row['ID']                    ?? row['id']                    ?? '');
      const nama                  = String(row['Nama']                  ?? row['nama']                  ?? row['Name'] ?? row['name'] ?? '');
      const gender                = String(row['Gender']                ?? row['gender']                ?? '');
      const membership            = String(row['Membership']            ?? row['membership']            ?? '');
      const start_date            = String(row['Start Date']            ?? row['start_date']            ?? '');
      const expiry_date           = String(row['Expiry Date']           ?? row['expiry_date']           ?? row['Exipiry Date'] ?? '');
      const class_val             = String(row['Class']                 ?? row['class']                 ?? '');
      const house                 = String(row['House']                 ?? row['house']                 ?? '');
      const trainer_homeroom      = String(row['Trainer Homeroom']      ?? row['trainer_homeroom']      ?? '');
      const date_of_birthday      = String(row['Date of Birthday']      ?? row['date_of_birthday']      ?? row['Date of Bithday'] ?? '');
      const kelas                 = String(row['Kelas']                 ?? row['kelas']                 ?? '');
      const email_account_parents = String(row['Email Account Parents'] ?? row['email_account_parents'] ?? '');
      const nomor_wa_parent       = String(row['Nomor WA Parent']       ?? row['nomor_wa_parent']       ?? row['Nomor Wa Parent'] ?? '');
      const nomor_wa_trainee      = String(row['Nomor WA Trainee']      ?? row['nomor_wa_trainee']      ?? row['Nomor Wa Trainee'] ?? '');
      const nama_sekolah          = String(row['Nama Sekolah']          ?? row['nama_sekolah']          ?? '');

      if (!id) {
        console.warn(`[Profile Trainee Push] Skipping row ${i}: missing ID`);
        skippedCount++;
        continue;
      }

      try {
        await db.query(
          `INSERT INTO profile_trainee (
             "ID", "Nama", "Gender", "Membership", "Start Date", "Expiry Date",
             "Class", "House", "Trainer Homeroom", "Date of Birthday", "Kelas",
             "Email Account Parents", "Nomor WA Parent", "Nomor WA Trainee", "Nama Sekolah"
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            id, nama, gender, membership, start_date, expiry_date,
            class_val, house, trainer_homeroom, date_of_birthday, kelas,
            email_account_parents, nomor_wa_parent, nomor_wa_trainee, nama_sekolah
          ]
        );
        insertedCount++;
      } catch (rowError) {
        try {
          await db.query(
            `UPDATE profile_trainee SET
               "Nama"                  = $2,
               "Gender"                = $3,
               "Membership"            = $4,
               "Start Date"            = $5,
               "Expiry Date"           = $6,
               "Class"                 = $7,
               "House"                 = $8,
               "Trainer Homeroom"      = $9,
               "Date of Birthday"      = $10,
               "Kelas"                 = $11,
               "Email Account Parents" = $12,
               "Nomor WA Parent"       = $13,
               "Nomor WA Trainee"      = $14,
               "Nama Sekolah"          = $15
             WHERE "ID" = $1`,
            [
              id, nama, gender, membership, start_date, expiry_date,
              class_val, house, trainer_homeroom, date_of_birthday, kelas,
              email_account_parents, nomor_wa_parent, nomor_wa_trainee, nama_sekolah
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

// DELETE /:id - Hapus data berdasarkan ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'DELETE FROM profile_trainee WHERE "ID" = $1 RETURNING *',
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
