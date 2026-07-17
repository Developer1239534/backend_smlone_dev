const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET endpoint: Fetch all level 1 CP registrations
router.get('/', async (req, res) => {
  try {
    const savedData = await db.query('SELECT * FROM level_1_cp_registrations ORDER BY created_at DESC');

    res.json({
      success: true,
      message: 'Berhasil mengambil data CP registrations.',
      data: savedData.rows
    });
  } catch (error) {
    console.error('Error fetching CP registrations:', error.message);
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

    await db.query('BEGIN');
    let insertedCount = 0;

    for (const row of data) {
      if (!row || typeof row !== 'object') continue;

      const timestamp_str = row['Timestamp'] || '';
      const email_address = row['Email Address'] || '';
      const full_name = row['Full Name'] || '';
      
      // Essential validation to avoid null conflicts
      if (!email_address || !full_name) continue;

      const last_name = row['Last Name'] || '';
      const dob = row['Date of Birth'] || '';
      const gender = row['Gender'] || '';
      const address = row['Address'] || '';
      const contact_whatsapp = row['Contact / Whatsapp No.'] || '';
      const email_account = row['Email Account'] || '';
      const program = row['Program'] || '';
      const todays_date = row['Today\'s Date'] || '';
      const i_agree_doc = row['I Agree, to allow PT. SMLONE INDONESIA, to use any documentation taken in SMLONE programs or other related programs to be used for promotional & educational Purposes.'] || '';
      const program_dipilih = row['Program Yang Dipilih'] || '';
      const nama_sekolah = row['Nama Sekolah (Peserta Training)'] || '';
      const emergency_contact_person = row['Emergency Contact Person'] || '';
      const emergency_contact_number = row['Emergency Contact Number'] || '';
      const kelas_peserta = row['Kelas (Peserta Training)'] || '';
      const latest_self_portrait = row['Latest Self Potrait'] || '';
      const shirt_size = row['Shirt Size'] || '';
      const tujuan_pelatihan = row['Apakah Tujuan Anda Mengikuti Pelatihan Ini?'] || '';
      const harapan_pelatihan = row['Apa yang ingin Anda dapatkan dari pelatihan ini?'] || '';
      const tahu_event_dari = row['Dari Manakah Anda Mengetahui Event Ini?'] || '';
      const parents_email = row['Parent\'s Email'] || '';
      const tahu_program_dari = row['Mengetahui Program Ini Dari Mana?'] || '';
      const tahu_smlone_dari = row['Dari Manakah Anda Mengetahui SMLONE?'] || '';
      const referensi_teman = row['Jika Anda mengenal SMLONE dari Referensi Teman, bolehkah dituliskan nama teman / nama anak teman yang mereferensikan'] || '';
      const referensi_teman_2 = row['Jika Anda mengenal SMLONE dari Referensi Teman, bolehkah dituliskan nama teman / nama anak teman yang mereferensikan_2'] || ''; // Optional fallback for duplicate handling
      const ig_mama = row['Akun Instagram Mama'] || '';
      const ig_papa = row['Akun Instagram Papa'] || '';
      const ig_anak = row['Akun Instagram Anak'] || '';
      const pernah_ikut_program = row['Apakah anak Anda sebelumnya pernah mengikuti program di SMLONE?'] || '';
      const program_pernah_diikuti = row['Jika pernah mengikuti program di SMLONE, mohon pilih program yang pernah anak Anda ikuti'] || '';
      const ig_account_anda = row['Instagram Account Anda'] || '';
      const ig_account_anak_anda = row['Instagram Account Anak Anda'] || '';
      const ig_account_anda_2 = row['Instagram Account Anda_2'] || '';

      const raw_data = JSON.stringify(row);

      const upsertQuery = `
        INSERT INTO level_1_cp_registrations (
          timestamp_str, email_address, full_name, last_name, dob, gender, address, 
          contact_whatsapp, email_account, program, todays_date, i_agree_doc, program_dipilih, 
          nama_sekolah, emergency_contact_person, emergency_contact_number, kelas_peserta, 
          latest_self_portrait, shirt_size, tujuan_pelatihan, harapan_pelatihan, tahu_event_dari, 
          parents_email, tahu_program_dari, tahu_smlone_dari, referensi_teman, referensi_teman_2, 
          ig_mama, ig_papa, ig_anak, pernah_ikut_program, program_pernah_diikuti, 
          ig_account_anda, ig_account_anak_anda, ig_account_anda_2, raw_data
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35, $36
        )
        ON CONFLICT (email_address, full_name) 
        DO UPDATE SET
          timestamp_str = EXCLUDED.timestamp_str,
          last_name = EXCLUDED.last_name,
          dob = EXCLUDED.dob,
          gender = EXCLUDED.gender,
          address = EXCLUDED.address,
          contact_whatsapp = EXCLUDED.contact_whatsapp,
          email_account = EXCLUDED.email_account,
          program = EXCLUDED.program,
          todays_date = EXCLUDED.todays_date,
          i_agree_doc = EXCLUDED.i_agree_doc,
          program_dipilih = EXCLUDED.program_dipilih,
          nama_sekolah = EXCLUDED.nama_sekolah,
          emergency_contact_person = EXCLUDED.emergency_contact_person,
          emergency_contact_number = EXCLUDED.emergency_contact_number,
          kelas_peserta = EXCLUDED.kelas_peserta,
          latest_self_portrait = EXCLUDED.latest_self_portrait,
          shirt_size = EXCLUDED.shirt_size,
          tujuan_pelatihan = EXCLUDED.tujuan_pelatihan,
          harapan_pelatihan = EXCLUDED.harapan_pelatihan,
          tahu_event_dari = EXCLUDED.tahu_event_dari,
          parents_email = EXCLUDED.parents_email,
          tahu_program_dari = EXCLUDED.tahu_program_dari,
          tahu_smlone_dari = EXCLUDED.tahu_smlone_dari,
          referensi_teman = EXCLUDED.referensi_teman,
          referensi_teman_2 = EXCLUDED.referensi_teman_2,
          ig_mama = EXCLUDED.ig_mama,
          ig_papa = EXCLUDED.ig_papa,
          ig_anak = EXCLUDED.ig_anak,
          pernah_ikut_program = EXCLUDED.pernah_ikut_program,
          program_pernah_diikuti = EXCLUDED.program_pernah_diikuti,
          ig_account_anda = EXCLUDED.ig_account_anda,
          ig_account_anak_anda = EXCLUDED.ig_account_anak_anda,
          ig_account_anda_2 = EXCLUDED.ig_account_anda_2,
          raw_data = EXCLUDED.raw_data;
      `;
      
      await db.query(upsertQuery, [
        timestamp_str, email_address, full_name, last_name, dob, gender, address, 
        contact_whatsapp, email_account, program, todays_date, i_agree_doc, program_dipilih, 
        nama_sekolah, emergency_contact_person, emergency_contact_number, kelas_peserta, 
        latest_self_portrait, shirt_size, tujuan_pelatihan, harapan_pelatihan, tahu_event_dari, 
        parents_email, tahu_program_dari, tahu_smlone_dari, referensi_teman, referensi_teman_2, 
        ig_mama, ig_papa, ig_anak, pernah_ikut_program, program_pernah_diikuti, 
        ig_account_anda, ig_account_anak_anda, ig_account_anda_2, raw_data
      ]);
      insertedCount++;
    }
    
    await db.query('COMMIT');

    res.json({
      success: true,
      message: `Berhasil menerima dan menyimpan ${insertedCount} data dari n8n.`
    });

  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error receiving push from n8n (CP Registrations):', error.message);
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
      'timestamp_str', 'email_address', 'full_name', 'last_name', 'dob', 'gender', 'address', 
      'contact_whatsapp', 'email_account', 'program', 'todays_date', 'i_agree_doc', 'program_dipilih', 
      'nama_sekolah', 'emergency_contact_person', 'emergency_contact_number', 'kelas_peserta', 
      'latest_self_portrait', 'shirt_size', 'tujuan_pelatihan', 'harapan_pelatihan', 'tahu_event_dari', 
      'parents_email', 'tahu_program_dari', 'tahu_smlone_dari', 'referensi_teman', 'referensi_teman_2', 
      'ig_mama', 'ig_papa', 'ig_anak', 'pernah_ikut_program', 'program_pernah_diikuti', 
      'ig_account_anda', 'ig_account_anak_anda', 'ig_account_anda_2', 'raw_data'
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
    const query = `UPDATE level_1_cp_registrations SET ${setQuery.join(', ')} WHERE id = $${index} RETURNING *`;
    
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data pendaftaran tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Data pendaftaran berhasil diupdate.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating CP registration:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengupdate data.' });
  }
});

// DELETE endpoint: Admin Delete Data
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await db.query('DELETE FROM level_1_cp_registrations WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data pendaftaran tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Data pendaftaran berhasil dihapus.'
    });
  } catch (error) {
    console.error('Error deleting CP registration:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus data.' });
  }
});

module.exports = router;
