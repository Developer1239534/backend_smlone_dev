const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET endpoint: Fetch all registrations
router.get('/', async (req, res) => {
  try {
    const savedData = await db.query('SELECT * FROM level_1_keseluruhan ORDER BY created_at DESC');

    res.json({
      success: true,
      message: 'Berhasil mengambil data level 1 keseluruhan.',
      data: savedData.rows
    });
  } catch (error) {
    console.error('Error fetching level 1 keseluruhan:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data dari database.',
      error: error.message 
    });
  }
});

// POST endpoint: Push data from n8n or React FE
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
    
    console.log(`[Push Level 1 Keseluruhan] Received ${data.length} items`);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      if (!row || typeof row !== 'object') {
        console.warn(`[Push Level 1 Keseluruhan] Skipping invalid row at index ${i}:`, row);
        skippedCount++;
        continue;
      }

      // Hapus row_number secara paksa agar tidak tersimpan ke database
      delete row['row_number'];
      delete row['row number'];
      delete row['Row Number'];

      // ============================
      // HALAMAN 1: DATA DIRI UTAMA
      // Mendukung Google Sheets header DAN standard camelCase/snake_case dari React FE
      // ============================
      const email_address = row['Email'] || row['Email Address'] || row['email'] || row['email_address'] || row['emailAddress'] || '';
      const full_name = row['Full Name'] || row['fullName'] || row['full_name'] || row['name'] || '';
      const dob = row['Date of Birth'] || row['dateOfBirth'] || row['date_of_birth'] || row['dob'] || '';
      const gender = row['Gender'] || row['gender'] || '';
      const address = row['Address'] || row['address'] || '';
      const contact_whatsapp = row['Contact / Whatsapp No.'] || row['Contact / Whatsapp'] || row['contact_whatsapp'] || row['contactWhatsapp'] || row['phone'] || row['whatsapp'] || '';
      const program = row['Program'] || row['program'] || '';
      const pernah_ikut_program = row['Apakah anak Anda sebelumnya pernah mengikuti program di SMLONE?'] || row['pernah_ikut_program'] || row['alreadyFollowed'] || row['is_previous_student'] || '';
      const program_pernah_diikuti = row['Jika pernah mengikuti program di SMLONE, mohon pilih program yang pernah anak Anda ikuti'] || 
                                     row['Jika pernah mengikuti program di SMLONE, mohon pilih program yang pernah anak Anda ikut'] || 
                                     row['Program yang pernah diikuti'] || 
                                     row['program_pernah_diikuti'] || row['previous_programs'] || '';
      const todays_date = row["Today's Date"] || row['todays_date'] || row['todaysDate'] || row['date'] || '';
      const i_agree_doc = row['Consent Box (Persetujuan Dokumentasi)'] || 
                          row['I Agree, to allow PT. SMLONE INDONESIA, to use any documentation taken in SMLONE programs or other related programs to be used for promotional & educational Purposes.'] || 
                          row['i_agree_doc'] || row['consent'] || row['agreement'] || '';

      // ============================
      // HALAMAN 2: DETAIL SEKOLAH & ORANG TUA
      // ============================
      const program_dipilih = row['Apprentice/Junior/Youth SMLONE Program Yang Dipilih'] || row['Program Yang Dipilih'] || row['program_dipilih'] || row['selected_program'] || row['selectedProgram'] || '';
      
      const nama_sekolah = row['Nama Sekolah (Peserta Training)'] || 
                           row['Nama Sekolah (Peserta Training)1'] || 
                           row['Nama Sekolah (Peserta Training) 1'] || 
                           row['nama_sekolah'] || row['school'] || row['schoolName'] || '';
      
      const kelas_peserta = row['Kelas (Peserta Training)'] || 
                            row['Kelas (Peserta Training)1'] || 
                            row['Kelas (Peserta Training) 1'] || 
                            row['kelas_peserta'] || row['grade'] || row['class'] || '';
      
      const parents_email = row["Parent's Email"] || 
                            row["Parent's Email1"] || 
                            row["Parent's Email 1"] || 
                            row['parents_email'] || row['parentEmail'] || row['parent_email'] || '';
      
      const emergency_contact_person = row['Emergency Contact Person'] || 
                                       row['Emergency Contact Person1'] || 
                                       row['Emergency Contact Person 1'] || 
                                       row['emergency_contact_person'] || row['emergencyContactPerson'] || row['emergency_contact_name'] || '';
      
      const emergency_contact_number = row['Emergency Contact Number'] || 
                                       row['Emergency Contact Number1'] || 
                                       row['Emergency Contact Number 1'] || 
                                       row['emergency_contact_number'] || row['emergencyContactNumber'] || row['emergency_contact_phone'] || '';
      
      const tahu_smlone_dari = row['Dari Manakah Anda Mengetahui SMLONE?'] || 
                               row['Dari Manakah Anda Mengetahui SMLONE?1'] || 
                               row['Dari Manakah Anda Mengetahui SMLONE? 1'] || 
                               row['tahu_smlone_dari'] || row['source'] || row['knowFrom'] || '';
      
      const referensi_teman = row['Jika Anda mengenal SMLONE dari Referensi Teman, bolehkah dituliskan nama teman / nama anak teman yang mereferensikan'] || 
                              row['Jika Anda mengenal SMLONE dari Referensi Teman, bolehkah dituliskan nama teman / nama anak teman yang mereferensikan1'] || 
                              row['Jika Anda mengenal SMLONE dari Referensi Teman, bolehkah dituliskan nama teman / nama anak teman yang mereferensikan 1'] || 
                              row['Jika Anda mengenal SMLONE dari Referensi Teman, bolehkah dituliskan nama teman / nama anak teman yang mereferensikan2'] || 
                              row['Jika Anda mengenal SMLONE dari Referensi Teman, bolehkah dituliskan nama teman / nama anak teman yang mereferensikan 2'] || 
                              row['referensi_teman'] || row['referral'] || row['friendName'] || '';

      const ig_mama = row['Akun Instagram Mama'] || 
                      row['Akun Instagram Mama1'] || 
                      row['Akun Instagram Mama 1'] || 
                      row['ig_mama'] || row['instagram_mama'] || row['instagramMama'] || '';
      
      const ig_papa = row['Akun Instagram Papa'] || 
                      row['Akun Instagram Papa1'] || 
                      row['Akun Instagram Papa 1'] || 
                      row['ig_papa'] || row['instagram_papa'] || row['instagramPapa'] || '';
      
      const ig_anak = row['Akun Instagram Anak'] || 
                      row['Akun Instagram Anak1'] || 
                      row['Akun Instagram Anak 1'] || 
                      row['ig_anak'] || row['instagram_anak'] || row['instagramAnak'] || '';

      // Skip jika data penting kosong
      if (!email_address || !full_name) {
        console.warn(`[Push Level 1 Keseluruhan] Skipping row ${i}: missing email_address="${email_address}" or full_name="${full_name}". Keys: ${Object.keys(row).join(', ')}`);
        skippedCount++;
        continue;
      }

      const raw_data = JSON.stringify(row);

      try {
        const upsertQuery = `
          INSERT INTO level_1_keseluruhan (
            email_address, full_name, dob, gender, address, contact_whatsapp, program, 
            pernah_ikut_program, program_pernah_diikuti, todays_date, i_agree_doc, 
            program_dipilih, nama_sekolah, kelas_peserta, parents_email, 
            emergency_contact_person, emergency_contact_number, tahu_smlone_dari, 
            referensi_teman, ig_mama, ig_papa, ig_anak, raw_data
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, 
            $8, $9, $10, $11, 
            $12, $13, $14, $15, 
            $16, $17, $18, 
            $19, $20, $21, $22, $23
          )
          ON CONFLICT (email_address, full_name) 
          DO UPDATE SET
            dob = EXCLUDED.dob,
            gender = EXCLUDED.gender,
            address = EXCLUDED.address,
            contact_whatsapp = EXCLUDED.contact_whatsapp,
            program = EXCLUDED.program,
            pernah_ikut_program = EXCLUDED.pernah_ikut_program,
            program_pernah_diikuti = EXCLUDED.program_pernah_diikuti,
            todays_date = EXCLUDED.todays_date,
            i_agree_doc = EXCLUDED.i_agree_doc,
            program_dipilih = EXCLUDED.program_dipilih,
            nama_sekolah = EXCLUDED.nama_sekolah,
            kelas_peserta = EXCLUDED.kelas_peserta,
            parents_email = EXCLUDED.parents_email,
            emergency_contact_person = EXCLUDED.emergency_contact_person,
            emergency_contact_number = EXCLUDED.emergency_contact_number,
            tahu_smlone_dari = EXCLUDED.tahu_smlone_dari,
            referensi_teman = EXCLUDED.referensi_teman,
            ig_mama = EXCLUDED.ig_mama,
            ig_papa = EXCLUDED.ig_papa,
            ig_anak = EXCLUDED.ig_anak,
            raw_data = EXCLUDED.raw_data;
        `;
        
        await db.query(upsertQuery, [
          email_address, full_name, dob, gender, address, contact_whatsapp, program, 
          pernah_ikut_program, program_pernah_diikuti, todays_date, i_agree_doc, 
          program_dipilih, nama_sekolah, kelas_peserta, parents_email, 
          emergency_contact_person, emergency_contact_number, tahu_smlone_dari, 
          referensi_teman, ig_mama, ig_papa, ig_anak, raw_data
        ]);
        insertedCount++;
      } catch (rowError) {
        errorCount++;
        errors.push({ index: i, email: email_address, name: full_name, error: rowError.message });
        console.error(`[Push Level 1 Keseluruhan] Error on row ${i} (${full_name} / ${email_address}):`, rowError.message);
      }
    }

    console.log(`[Push Level 1 Keseluruhan] Done: inserted=${insertedCount}, skipped=${skippedCount}, errors=${errorCount}`);

    res.json({
      success: true,
      message: `Berhasil menyimpan ${insertedCount} data, ${skippedCount} di-skip, ${errorCount} error.`,
      details: { insertedCount, skippedCount, errorCount, errors: errors.slice(0, 10) }
    });

  } catch (error) {
    console.error('[Push Level 1 Keseluruhan] Fatal error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal memproses data kiriman.',
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
      'email_address', 'full_name', 'dob', 'gender', 'address', 'contact_whatsapp', 'program', 
      'pernah_ikut_program', 'program_pernah_diikuti', 'todays_date', 'i_agree_doc', 
      'program_dipilih', 'nama_sekolah', 'kelas_peserta', 'parents_email', 
      'emergency_contact_person', 'emergency_contact_number', 'tahu_smlone_dari', 
      'referensi_teman', 'ig_mama', 'ig_papa', 'ig_anak', 'raw_data'
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
    const query = `UPDATE level_1_keseluruhan SET ${setQuery.join(', ')} WHERE id = $${index} RETURNING *`;
    
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data level_1_keseluruhan tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Data level_1_keseluruhan berhasil diupdate.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating level_1_keseluruhan:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengupdate data.' });
  }
});

// DELETE endpoint: Admin Delete Data
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await db.query('DELETE FROM level_1_keseluruhan WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data level_1_keseluruhan tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Data level_1_keseluruhan berhasil dihapus.'
    });
  } catch (error) {
    console.error('Error deleting level_1_keseluruhan:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus data.' });
  }
});

module.exports = router;
