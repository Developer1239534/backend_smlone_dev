const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET endpoint: Ambil semua data form lama
router.get('/', async (req, res) => {
  try {
    const savedData = await db.query('SELECT * FROM data_form_lama ORDER BY created_at DESC');

    res.json({
      success: true,
      message: 'Berhasil mengambil data form lama.',
      data: savedData.rows
    });
  } catch (error) {
    console.error('Error fetching data_form_lama:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data dari database.',
      error: error.message 
    });
  }
});

// GET endpoint: Ambil satu data berdasarkan ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM data_form_lama WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching single data_form_lama row:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data dari database.',
      error: error.message 
    });
  }
});

// POST endpoint: Simpan/Push data dari N8N
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
    
    console.log(`[Push Data Form Lama] Menerima ${data.length} data`);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      if (!row || typeof row !== 'object') {
        skippedCount++;
        continue;
      }

      // Hapus row_number agar tidak tersimpan ke database
      delete row['row_number'];
      delete row['row number'];
      delete row['Row Number'];

      // Pemetaan kolom dari Google Sheets
      const timestamp = row['Timestamp'] || row['timestamp'] || '';
      const email_address = row['Email Address'] || row['email'] || row['email_address'] || '';
      const full_name = row['Full Name'] || row['fullName'] || row['full_name'] || '';
      const dob = row['Date of Birth'] || row['date_of_birth'] || row['dob'] || '';
      const gender = row['Gender'] || row['gender'] || '';
      const address = row['Address'] || row['address'] || '';
      const whatsapp = row['Contact / Whatsapp No.'] || row['whatsapp'] || row['phone'] || '';
      const program = row['Program'] || row['program'] || '';
      const todays_date = row["Today's Date"] || row['todays_date'] || '';
      
      const agreement = row['I Agree, to allow PT. SMLONE INDONESIA, to use any documentation taken in SMLONE programs or other related programs to be used for promotional & educational Purposes.'] || 
                        row['Agreement'] || row['agreement'] || '';
      
      const selected_program = row['Program Yang Dipilih'] || row['program_dipilih'] || '';
      
      // Mengatasi duplikasi nama kolom di Google Sheets (yang biasanya di-append angka oleh N8N)
      const school = row['Nama Sekolah (Peserta Training)'] || row['Nama Sekolah (Peserta Training)1'] || row['school'] || '';
      const parents_email = row["Parent's Email"] || row["Parent's Email1"] || row['parents_email'] || '';
      const emergency_contact_person = row['Emergency Contact Person'] || row['Emergency Contact Person1'] || row['emergency_contact_person'] || '';
      const emergency_contact_number = row['Emergency Contact Number'] || row['Emergency Contact Number1'] || row['emergency_contact_number'] || '';
      const class_grade = row['Kelas (Peserta Training)'] || row['Kelas (Peserta Training)1'] || row['class'] || '';
      
      const source_smlone = row['Dari Manakah Anda Mengetahui SMLONE?'] || row['Dari Manakah Anda Mengetahui SMLONE?1'] || row['source_smlone'] || '';
      
      // Referensi teman (smlone vs event)
      const referral_smlone = row['Jika Anda mengenal SMLONE dari Referensi Teman, bolehkah dituliskan nama teman / nama anak teman yang mereferensikan'] || '';
      const referral_event = row['Jika Anda mengenal SMLONE dari Referensi Teman, bolehkah dituliskan nama teman / nama anak teman yang mereferensikan1'] || 
                             row['Jika Anda mengenal SMLONE dari Referensi Teman, bolehkah dituliskan nama teman / nama anak teman yang mereferensikan_1'] || '';

      const instagram_mama = row['Akun Instagram Mama'] || row['Akun Instagram Mama1'] || row['ig_mama'] || '';
      const instagram_papa = row['Akun Instagram Papa'] || row['Akun Instagram Papa1'] || row['ig_papa'] || '';
      const instagram_anak = row['Akun Instagram Anak'] || row['Akun Instagram Anak1'] || row['ig_anak'] || '';

      const purpose = row['Apakah Tujuan Anda Mengikuti Pelatihan Ini?'] || row['purpose'] || '';
      const expectation = row['Apa yang ingin Anda dapatkan dari pelatihan ini?'] || row['expectation'] || '';
      const source_event = row['Dari Manakah Anda Mengetahui Event Ini?'] || row['source_event'] || '';
      
      const prev_smlone_program = row['Apakah anak Anda sebelumnya pernah mengikuti program di SMLONE?'] || row['prev_smlone_program'] || '';
      const prev_smlone_program_details = row['Jika pernah mengikuti program di SMLONE, mohon pilih program yang pernah anak Anda ikuti'] || row['prev_smlone_program_details'] || '';

      // Skip jika data wajib kosong (minimal Email Address dan Full Name wajib ada)
      if (!email_address && !full_name) {
        skippedCount++;
        continue;
      }

      const raw_data = JSON.stringify(row);

      try {
        const insertQuery = `
          INSERT INTO data_form_lama (
            timestamp, email_address, full_name, dob, gender, address, whatsapp, program, todays_date,
            agreement, selected_program, school, parents_email, emergency_contact_person, emergency_contact_number,
            class, source_smlone, referral_smlone, instagram_mama, instagram_papa, instagram_anak,
            purpose, expectation, source_event, referral_event, prev_smlone_program, prev_smlone_program_details,
            raw_data
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9,
            $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,
            $22, $23, $24, $25, $26, $27, $28
          )
        `;
        
        await db.query(insertQuery, [
          timestamp, email_address, full_name, dob, gender, address, whatsapp, program, todays_date,
          agreement, selected_program, school, parents_email, emergency_contact_person, emergency_contact_number,
          class_grade, source_smlone, referral_smlone, instagram_mama, instagram_papa, instagram_anak,
          purpose, expectation, source_event, referral_event, prev_smlone_program, prev_smlone_program_details,
          raw_data
        ]);
        insertedCount++;
      } catch (rowError) {
        errorCount++;
        errors.push({ index: i, name: full_name, error: rowError.message });
        console.error(`[Push Data Form Lama] Error pada baris ${i} (${full_name}):`, rowError.message);
      }
    }

    console.log(`[Push Data Form Lama] Selesai: sukses=${insertedCount}, dilewati=${skippedCount}, error=${errorCount}`);

    res.json({
      success: true,
      message: `Berhasil menyimpan ${insertedCount} data form lama, ${skippedCount} di-skip, ${errorCount} error.`,
      details: { insertedCount, skippedCount, errorCount, errors }
    });

  } catch (error) {
    console.error('[Push Data Form Lama] Fatal error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal memproses data kiriman.',
      error: error.message 
    });
  }
});

// DELETE endpoint: Hapus semua data (Truncate)
router.delete('/clear', async (req, res) => {
  try {
    await db.query('TRUNCATE TABLE data_form_lama RESTART IDENTITY;');
    res.json({
      success: true,
      message: 'Semua data di dalam tabel data_form_lama berhasil dihapus bersih.'
    });
  } catch (error) {
    console.error('Error clearing data_form_lama:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data dari database.',
      error: error.message
    });
  }
});

module.exports = router;
