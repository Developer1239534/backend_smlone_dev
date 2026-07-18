const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET endpoint: Ambil semua data registrasi
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

// GET endpoint: Ambil satu data berdasarkan ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM level_1_keseluruhan WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching single keseluruhan:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data dari database.',
      error: error.message 
    });
  }
});

// POST endpoint: Simpan data dari React FE atau N8N
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
    
    console.log(`[Push Level 1 Keseluruhan] Menerima ${data.length} data`);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      if (!row || typeof row !== 'object') {
        console.warn(`[Push Level 1 Keseluruhan] Melewati baris tidak valid pada indeks ${i}:`, row);
        skippedCount++;
        continue;
      }

      // Hapus row_number agar tidak tersimpan ke database
      delete row['row_number'];
      delete row['row number'];
      delete row['Row Number'];

      // ============================
      // HALAMAN 1: DATA DIRI UTAMA
      // Pemetaan dari JSON React FE (Bahasa Inggris/camelCase) & N8N (Google Sheets)
      // ============================
      const email_address = row['email'] || row['Email'] || row['Email Address'] || row['email_address'] || row['emailAddress'] || '';
      const full_name = row['fullName'] || row['Full Name'] || row['full_name'] || row['name'] || '';
      const dob = row['dob'] || row['Date of Birth'] || row['dateOfBirth'] || row['date_of_birth'] || '';
      const gender = row['gender'] || row['Gender'] || '';
      const address = row['address'] || row['Address'] || '';
      const contact_whatsapp = row['contact'] || row['Contact / Whatsapp No.'] || row['Contact / Whatsapp'] || row['contact_whatsapp'] || row['contactWhatsapp'] || row['phone'] || row['whatsapp'] || '';
      const program = row['programSelected'] || row['Program'] || row['program'] || '';
      const pernah_ikut_program = row['hasPriorProgram'] || row['Apakah anak Anda sebelumnya pernah mengikuti program di SMLONE?'] || row['pernah_ikut_program'] || '';
      
      // Menggabungkan priorPrograms (Array) dengan otherProgramText
      let program_pernah_diikuti = '';
      if (Array.isArray(row['priorPrograms'])) {
        program_pernah_diikuti = row['priorPrograms'].join(', ');
      } else {
        program_pernah_diikuti = row['priorPrograms'] || row['Jika pernah mengikuti program di SMLONE, mohon pilih program yang pernah anak Anda ikuti'] || 
                                 row['Jika pernah mengikuti program di SMLONE, mohon pilih program yang pernah anak Anda ikut'] || 
                                 row['Program yang pernah diikuti'] || row['program_pernah_diikuti'] || '';
      }
      if (row['otherProgramText']) {
        program_pernah_diikuti += program_pernah_diikuti ? ` (${row['otherProgramText']})` : row['otherProgramText'];
      }

      const todays_date = row['todayDate'] || row["Today's Date"] || row['todays_date'] || row['date'] || '';
      
      // Consent / Persetujuan
      let i_agree_doc = '';
      if (row['consent'] !== undefined) {
        i_agree_doc = row['consent'] ? 'Setuju' : 'Tidak Setuju';
      } else {
        i_agree_doc = row['Consent Box (Persetujuan Dokumentasi)'] || 
                      row['I Agree, to allow PT. SMLONE INDONESIA, to use any documentation taken in SMLONE programs or other related programs to be used for promotional & educational Purposes.'] || '';
      }

      // ============================
      // HALAMAN 2: DETAIL SEKOLAH & ORANG TUA
      // ============================
      const program_dipilih = row['subProgramSelected'] || row['Apprentice/Junior/Youth SMLONE Program Yang Dipilih'] || row['Program Yang Dipilih'] || row['program_dipilih'] || '';
      const nama_sekolah = row['schoolName'] || row['Nama Sekolah (Peserta Training)'] || row['Nama Sekolah (Peserta Training)1'] || row['nama_sekolah'] || '';
      const kelas_peserta = row['schoolGrade'] || row['Kelas (Peserta Training)'] || row['Kelas (Peserta Training)1'] || row['kelas_peserta'] || '';
      const parents_email = row['parentEmail'] || row["Parent's Email"] || row["Parent's Email1"] || row['parents_email'] || '';
      const emergency_contact_person = row['emergencyName'] || row['Emergency Contact Person'] || row['Emergency Contact Person1'] || row['emergency_contact_person'] || '';
      const emergency_contact_number = row['emergencyNumber'] || row['Emergency Contact Number'] || row['Emergency Contact Number1'] || row['emergency_contact_number'] || '';
      const tahu_smlone_dari = row['referralSource'] || row['Dari Manakah Anda Mengetahui SMLONE?'] || row['Dari Manakah Anda Mengetahui SMLONE?1'] || row['tahu_smlone_dari'] || '';
      
      // Menggabungkan referralFriendName dengan referralOtherText
      let referensi_teman = row['referralFriendName'] || row['Jika Anda mengenal SMLONE dari Referensi Teman, bolehkah dituliskan nama teman / nama anak teman yang mereferensikan'] || '';
      if (row['referralOtherText']) {
        referensi_teman += referensi_teman ? ` (${row['referralOtherText']})` : row['referralOtherText'];
      }

      const ig_mama = row['instagramMama'] || row['Akun Instagram Mama'] || row['Akun Instagram Mama1'] || row['ig_mama'] || '';
      const ig_papa = row['instagramPapa'] || row['Akun Instagram Papa'] || row['Akun Instagram Papa1'] || row['ig_papa'] || '';
      const ig_anak = row['instagramAnak'] || row['Akun Instagram Anak'] || row['Akun Instagram Anak1'] || row['ig_anak'] || '';

      // Skip jika data wajib kosong
      if (!email_address || !full_name) {
        console.warn(`[Push Level 1 Keseluruhan] Melewati baris ${i}: email_address atau full_name kosong. Keys: ${Object.keys(row).join(', ')}`);
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

        // ============================
        // OTOMATIS KIRIM KE GOOGLE SHEETS VIA N8N
        // ============================
        const n8nWebhookUrl = process.env.N8N_SHEETS_WEBHOOK_URL;
        if (n8nWebhookUrl) {
          // Kirim payload asli dari React FE ke N8N secara real-time
          fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': 'smlone-n8n-secret-key-2026'
            },
            body: JSON.stringify(row)
          })
          .then(res => {
            if (!res.ok) {
              console.warn(`[N8N Sync Warning] N8N merespons dengan status: ${res.status}`);
            }
          })
          .catch(err => {
            console.error('[N8N Sync Error] Gagal mengirim data ke N8N:', err.message);
          });
        }

      } catch (rowError) {
        errorCount++;
        errors.push({ index: i, email: email_address, name: full_name, error: rowError.message });
        console.error(`[Push Level 1 Keseluruhan] Error pada baris ${i} (${full_name} / ${email_address}):`, rowError.message);
      }
    }

    console.log(`[Push Level 1 Keseluruhan] Selesai: sukses=${insertedCount}, dilewati=${skippedCount}, error=${errorCount}`);

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
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Data berhasil diupdate.',
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
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Data berhasil dihapus.'
    });
  } catch (error) {
    console.error('Error deleting level_1_keseluruhan:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus data.' });
  }
});

module.exports = router;
