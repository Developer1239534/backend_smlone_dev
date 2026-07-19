const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET endpoint: Fetch all cemara registrations
router.get('/', async (req, res) => {
  try {
    const savedData = await db.query('SELECT * FROM cemara_registrations ORDER BY created_at DESC');

    res.json({
      success: true,
      message: 'Berhasil mengambil data cemara registrations.',
      data: savedData.rows
    });
  } catch (error) {
    console.error('Error fetching cemara registrations:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data dari database.',
      error: error.message 
    });
  }
});

// POST endpoint: Push data from n8n
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
    
    console.log(`[n8n Push Cemara Registrations] Received ${data.length} items`);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      if (!row || typeof row !== 'object') {
        console.warn(`[n8n Push Cemara Registrations] Skipping invalid row at index ${i}:`, row);
        skippedCount++;
        continue;
      }

      // Buang row_number agar tidak pernah tersimpan di database
      delete row['row_number'];
      delete row['row number'];
      delete row['Row Number'];

      // ============================
      // KOLOM UTAMA (Anak ke-1)
      // ============================
      const timestamp_str = row['Timestamp'] || '';
      const email_address = row['Email Address'] || '';
      const full_name = row['Full Name'] || '';
      const dob = row['Date of Birth'] || '';
      const gender = row['Gender'] || '';
      const address = row['Address'] || '';
      const contact_whatsapp = row['Contact / Whatsapp No.'] || row['Contact / Whatsapp'] || '';
      const program = row['Program'] || '';
      const todays_date = row["Today's Date"] || '';
      const i_agree_doc = row['I Agree, to allow PT. SMLONE INDONESIA, to use any documentation taken in SMLONE programs or other related programs to be used for promotional & educational Purposes.'] || '';
      const program_dipilih = row['Program Yang Dipilih'] || '';
      const nama_sekolah = row['Nama Sekolah (Peserta Training)'] || '';
      const parents_email = row["Parent's Email"] || '';
      const emergency_contact_person = row['Emergency Contact Person'] || '';
      const emergency_contact_number = row['Emergency Contact Number'] || '';
      const kelas_peserta = row['Kelas (Peserta Training)'] || '';
      const tahu_smlone_dari = row['Dari Manakah Anda Mengetahui SMLONE?'] || '';
      const referensi_teman = row['Jika Anda mengenal SMLONE dari Referensi Teman, bolehkah dituliskan nama teman / nama anak teman yang mereferensikan'] || '';
      const ig_mama = row['Akun Instagram Mama'] || '';
      const ig_papa = row['Akun Instagram Papa'] || '';
      const ig_anak = row['Akun Instagram Anak'] || '';

      // ============================
      // KOLOM DUPLIKAT (Anak ke-2)
      // N8N otomatis menambahkan angka 1 di belakang nama kolom yang duplikat
      // ============================
      const nama_sekolah_2 = row['Nama Sekolah (Peserta Training)1'] || row['Nama Sekolah (Peserta Training) 1'] || '';
      const parents_email_2 = row["Parent's Email1"] || row["Parent's Email 1"] || '';
      const emergency_contact_person_2 = row['Emergency Contact Person1'] || row['Emergency Contact Person 1'] || '';
      const emergency_contact_number_2 = row['Emergency Contact Number1'] || row['Emergency Contact Number 1'] || '';
      const kelas_peserta_2 = row['Kelas (Peserta Training)1'] || row['Kelas (Peserta Training) 1'] || '';
      const tahu_smlone_dari_2 = row['Dari Manakah Anda Mengetahui SMLONE?1'] || row['Dari Manakah Anda Mengetahui SMLONE? 1'] || '';
      const referensi_teman_2 = row['Jika Anda mengenal SMLONE dari Referensi Teman, bolehkah dituliskan nama teman / nama anak teman yang mereferensikan1'] || row['Jika Anda mengenal SMLONE dari Referensi Teman, bolehkah dituliskan nama teman / nama anak teman yang mereferensikan 1'] || '';
      const ig_mama_2 = row['Akun Instagram Mama1'] || row['Akun Instagram Mama 1'] || '';
      const ig_papa_2 = row['Akun Instagram Papa1'] || row['Akun Instagram Papa 1'] || '';
      const ig_anak_2 = row['Akun Instagram Anak1'] || row['Akun Instagram Anak 1'] || '';

      // ============================
      // KOLOM PERTANYAAN LANJUTAN
      // ============================
      const tujuan_pelatihan = row['Apakah Tujuan Anda Mengikuti Pelatihan Ini?'] || '';
      const harapan_pelatihan = row['Apa yang ingin Anda dapatkan dari pelatihan ini?'] || '';
      const tahu_event_dari = row['Dari Manakah Anda Mengetahui Event Ini?'] || '';
      // Kolom referensi_teman ke-3 (muncul lagi setelah tahu_event_dari)
      const referensi_teman_3 = row['Jika Anda mengenal SMLONE dari Referensi Teman, bolehkah dituliskan nama teman / nama anak teman yang mereferensikan2'] || row['Jika Anda mengenal SMLONE dari Referensi Teman, bolehkah dituliskan nama teman / nama anak teman yang mereferensikan 2'] || '';
      const pernah_ikut_program = row['Apakah anak Anda sebelumnya pernah mengikuti program di SMLONE?'] || '';
      // FIX TYPO: "ikuti" bukan "ikut"
      const program_pernah_diikuti = row['Jika pernah mengikuti program di SMLONE, mohon pilih program yang pernah anak Anda ikuti'] || row['Jika pernah mengikuti program di SMLONE, mohon pilih program yang pernah anak Anda ikut'] || '';
      
      // Skip if essential data is missing
      if (!email_address || !full_name) {
        console.warn(`[n8n Push Cemara Registrations] Skipping row ${i}: missing email_address="${email_address}" or full_name="${full_name}". Keys: ${Object.keys(row).join(', ')}`);
        skippedCount++;
        continue;
      }

      const raw_data = JSON.stringify(row);

      try {
        const upsertQuery = `
          INSERT INTO cemara_registrations (
            timestamp_str, email_address, full_name, dob, gender, address, contact_whatsapp, program, 
            todays_date, i_agree_doc, program_dipilih, nama_sekolah, parents_email, emergency_contact_person, 
            emergency_contact_number, kelas_peserta, tahu_smlone_dari, referensi_teman, ig_mama, ig_papa, ig_anak,
            nama_sekolah_2, parents_email_2, emergency_contact_person_2, emergency_contact_number_2,
            kelas_peserta_2, tahu_smlone_dari_2, referensi_teman_2, ig_mama_2, ig_papa_2, ig_anak_2,
            tujuan_pelatihan, harapan_pelatihan, tahu_event_dari, referensi_teman_3,
            pernah_ikut_program, program_pernah_diikuti, raw_data
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, 
            $9, $10, $11, $12, $13, $14, 
            $15, $16, $17, $18, $19, $20, $21,
            $22, $23, $24, $25,
            $26, $27, $28, $29, $30, $31,
            $32, $33, $34, $35,
            $36, $37, $38
          )
          ON CONFLICT (email_address, full_name) 
          DO UPDATE SET
            timestamp_str = EXCLUDED.timestamp_str,
            dob = EXCLUDED.dob,
            gender = EXCLUDED.gender,
            address = EXCLUDED.address,
            contact_whatsapp = EXCLUDED.contact_whatsapp,
            program = EXCLUDED.program,
            todays_date = EXCLUDED.todays_date,
            i_agree_doc = EXCLUDED.i_agree_doc,
            program_dipilih = EXCLUDED.program_dipilih,
            nama_sekolah = EXCLUDED.nama_sekolah,
            parents_email = EXCLUDED.parents_email,
            emergency_contact_person = EXCLUDED.emergency_contact_person,
            emergency_contact_number = EXCLUDED.emergency_contact_number,
            kelas_peserta = EXCLUDED.kelas_peserta,
            tahu_smlone_dari = EXCLUDED.tahu_smlone_dari,
            referensi_teman = EXCLUDED.referensi_teman,
            ig_mama = EXCLUDED.ig_mama,
            ig_papa = EXCLUDED.ig_papa,
            ig_anak = EXCLUDED.ig_anak,
            nama_sekolah_2 = EXCLUDED.nama_sekolah_2,
            parents_email_2 = EXCLUDED.parents_email_2,
            emergency_contact_person_2 = EXCLUDED.emergency_contact_person_2,
            emergency_contact_number_2 = EXCLUDED.emergency_contact_number_2,
            kelas_peserta_2 = EXCLUDED.kelas_peserta_2,
            tahu_smlone_dari_2 = EXCLUDED.tahu_smlone_dari_2,
            referensi_teman_2 = EXCLUDED.referensi_teman_2,
            ig_mama_2 = EXCLUDED.ig_mama_2,
            ig_papa_2 = EXCLUDED.ig_papa_2,
            ig_anak_2 = EXCLUDED.ig_anak_2,
            tujuan_pelatihan = EXCLUDED.tujuan_pelatihan,
            harapan_pelatihan = EXCLUDED.harapan_pelatihan,
            tahu_event_dari = EXCLUDED.tahu_event_dari,
            referensi_teman_3 = EXCLUDED.referensi_teman_3,
            pernah_ikut_program = EXCLUDED.pernah_ikut_program,
            program_pernah_diikuti = EXCLUDED.program_pernah_diikuti,
            raw_data = EXCLUDED.raw_data;
        `;
        
        await db.query(upsertQuery, [
          timestamp_str, email_address, full_name, dob, gender, address, contact_whatsapp, program, 
          todays_date, i_agree_doc, program_dipilih, nama_sekolah, parents_email, emergency_contact_person, 
          emergency_contact_number, kelas_peserta, tahu_smlone_dari, referensi_teman, ig_mama, ig_papa, ig_anak,
          nama_sekolah_2, parents_email_2, emergency_contact_person_2, emergency_contact_number_2,
          kelas_peserta_2, tahu_smlone_dari_2, referensi_teman_2, ig_mama_2, ig_papa_2, ig_anak_2,
          tujuan_pelatihan, harapan_pelatihan, tahu_event_dari, referensi_teman_3,
          pernah_ikut_program, program_pernah_diikuti, raw_data
        ]);
        insertedCount++;
      } catch (rowError) {
        errorCount++;
        errors.push({ index: i, email: email_address, name: full_name, error: rowError.message });
        console.error(`[n8n Push Cemara Registrations] Error on row ${i} (${full_name} / ${email_address}):`, rowError.message);
      }
    }

    console.log(`[n8n Push Cemara Registrations] Done: inserted=${insertedCount}, skipped=${skippedCount}, errors=${errorCount}`);

    res.json({
      success: true,
      message: `Berhasil menyimpan ${insertedCount} data, ${skippedCount} di-skip, ${errorCount} error.`,
      details: { insertedCount, skippedCount, errorCount, errors: errors.slice(0, 10) }
    });

  } catch (error) {
    console.error('[n8n Push Cemara Registrations] Fatal error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal memproses data kiriman n8n.',
      error: error.message 
    });
  }
});

// PUT endpoint: Admin Edit Data
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  if (!id || Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'ID dan data update wajib diisi.' });
  }

  try {
    const allowedColumns = [
      'timestamp_str', 'email_address', 'full_name', 'dob', 'gender', 'address', 'contact_whatsapp', 'program', 
      'todays_date', 'i_agree_doc', 'program_dipilih', 'nama_sekolah', 'parents_email', 'emergency_contact_person', 
      'emergency_contact_number', 'kelas_peserta', 'tahu_smlone_dari', 'referensi_teman', 'ig_mama', 'ig_papa', 'ig_anak',
      'nama_sekolah_2', 'parents_email_2', 'emergency_contact_person_2', 'emergency_contact_number_2',
      'kelas_peserta_2', 'tahu_smlone_dari_2', 'referensi_teman_2', 'ig_mama_2', 'ig_papa_2', 'ig_anak_2',
      'tujuan_pelatihan', 'harapan_pelatihan', 'tahu_event_dari', 'referensi_teman_3',
      'pernah_ikut_program', 'program_pernah_diikuti', 'raw_data'
    ];

    let setQuery = [];
    let values = [];
    let index = 1;

    for (const key of Object.keys(updates)) {
      if (allowedColumns.includes(key)) {
        setQuery.push(`${key} = $${index}`);
        values.push(updates[key]);
        index++;
      }
    }

    if (setQuery.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada kolom valid yang diupdate.' });
    }

    values.push(id);
    const query = `UPDATE cemara_registrations SET ${setQuery.join(', ')} WHERE id = $${index} RETURNING *`;
    
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data cemara_registrations tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Data cemara_registrations berhasil diupdate.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating cemara_registrations:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengupdate data.' });
  }
});

// DELETE endpoint: Admin Delete Data
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await db.query('DELETE FROM cemara_registrations WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data cemara_registrations tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Data cemara_registrations berhasil dihapus.'
    });
  } catch (error) {
    console.error('Error deleting cemara_registrations:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus data.' });
  }
});

module.exports = router;
