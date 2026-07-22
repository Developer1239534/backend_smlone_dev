const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET all (Admin & Webhook)
router.get('/', async (req, res) => {
  try {
    const savedData = await db.query('SELECT * FROM registrasi_cp ORDER BY created_at DESC');
    res.json({
      success: true,
      message: 'Berhasil mengambil data registrasi CP.',
      data: savedData.rows
    });
  } catch (error) {
    console.error('Error fetching registrasi_cp:', error.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data dari database.', error: error.message });
  }
});

// GET single by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM registrasi_cp WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan.', error: error.message });
  }
});

// POST (Create / Push from n8n / Admin)
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
      const email_address = row['Email Address'] || row['email_address'] || '';
      const full_name = row['Full Name'] || row['full_name'] || '';

      if (!email_address || !full_name) continue;

      const last_name = row['Last Name'] || row['last_name'] || '';
      const dob = row['Date of Birth'] || row['dob'] || '';
      const gender = row['Gender'] || row['gender'] || '';
      const address = row['Address'] || row['address'] || '';
      const contact_whatsapp = row['Contact / Whatsapp No.'] || row['contact_whatsapp'] || '';
      const email_account = row['Email Account'] || row['email_account'] || '';
      const program = row['Program'] || row['program'] || '';
      const todays_date = row['Today\'s Date'] || row['todays_date'] || '';
      const i_agree_doc = row['I Agree, to allow PT. SMLONE INDONESIA, to use any documentation taken in SMLONE programs or other related programs to be used for promotional & educational Purposes.'] || row['i_agree_doc'] || '';
      const program_dipilih = row['Program Yang Dipilih'] || row['program_dipilih'] || '';
      const nama_sekolah = row['Nama Sekolah (Peserta Training)'] || row['nama_sekolah'] || '';
      const emergency_contact_person = row['Emergency Contact Person'] || row['emergency_contact_person'] || '';
      const emergency_contact_number = row['Emergency Contact Number'] || row['emergency_contact_number'] || '';
      const kelas_peserta = row['Kelas (Peserta Training)'] || row['kelas_peserta'] || '';
      const latest_self_portrait = row['Latest Self Potrait'] || row['latest_self_portrait'] || '';
      const shirt_size = row['Shirt Size'] || row['shirt_size'] || '';
      const tujuan_pelatihan = row['Apakah Tujuan Anda Mengikuti Pelatihan Ini?'] || row['tujuan_pelatihan'] || '';
      const harapan_pelatihan = row['Apa yang ingin Anda dapatkan dari pelatihan ini?'] || row['harapan_pelatihan'] || '';
      const tahu_event_dari = row['Dari Manakah Anda Mengetahui Event Ini?'] || row['tahu_event_dari'] || '';
      const parents_email = row['Parent\'s Email'] || row['parents_email'] || '';
      const tahu_program_dari = row['Mengetahui Program Ini Dari Mana?'] || row['tahu_program_dari'] || '';
      const tahu_smlone_dari = row['Dari Manakah Anda Mengetahui SMLONE?'] || row['tahu_smlone_dari'] || '';
      const referensi_teman = row['Jika Anda mengenal SMLONE dari Referensi Teman, bolehkah dituliskan nama teman / nama anak teman yang mereferensikan'] || row['referensi_teman'] || '';
      const referensi_teman_2 = row['Jika Anda mengenal SMLONE dari Referensi Teman, bolehkah dituliskan nama teman / nama anak teman yang mereferensikan_2'] || row['referensi_teman_2'] || '';
      const ig_mama = row['Akun Instagram Mama'] || row['ig_mama'] || '';
      const ig_papa = row['Akun Instagram Papa'] || row['ig_papa'] || '';
      const ig_anak = row['Akun Instagram Anak'] || row['ig_anak'] || '';
      const pernah_ikut_program = row['Apakah anak Anda sebelumnya pernah mengikuti program di SMLONE?'] || row['pernah_ikut_program'] || '';
      const program_pernah_diikuti = row['Jika pernah mengikuti program di SMLONE, mohon pilih program yang pernah anak Anda ikuti'] || row['program_pernah_diikuti'] || '';
      const ig_account_anda = row['Instagram Account Anda'] || row['ig_account_anda'] || '';
      const ig_account_anak_anda = row['Instagram Account Anak Anda'] || row['ig_account_anak_anda'] || '';
      const ig_account_anda_2 = row['Instagram Account Anda_2'] || row['ig_account_anda_2'] || '';
      const raw_data = JSON.stringify(row);

      const query = `
        INSERT INTO registrasi_cp (
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
          raw_data = EXCLUDED.raw_data
      `;

      await pool.query(query, [
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
    res.json({ success: true, message: `Berhasil menerima dan menyimpan ${insertedCount} data.` });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error in registrasi_cp push:', error);
    res.status(500).json({ success: false, message: 'Gagal memproses data.', error: error.message });
  }
});

// PUT (Edit/Update by Admin)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!id || Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'ID dan data update wajib diisi.' });
  }

  try {
    const allowedColumns = [
      'email_address', 'full_name', 'last_name', 'dob', 'gender', 'address', 
      'contact_whatsapp', 'email_account', 'program', 'todays_date', 'i_agree_doc', 'program_dipilih', 
      'nama_sekolah', 'emergency_contact_person', 'emergency_contact_number', 'kelas_peserta', 
      'latest_self_portrait', 'shirt_size', 'tujuan_pelatihan', 'harapan_pelatihan', 'tahu_event_dari', 
      'parents_email', 'tahu_program_dari', 'tahu_smlone_dari', 'referensi_teman', 'referensi_teman_2', 
      'ig_mama', 'ig_papa', 'ig_anak', 'pernah_ikut_program', 'program_pernah_diikuti', 
      'ig_account_anda', 'ig_account_anak_anda', 'ig_account_anda_2'
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
    const query = `UPDATE registrasi_cp SET ${setQuery.join(', ')} WHERE id = $${index} RETURNING *`;
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }

    res.json({ success: true, message: 'Data berhasil diupdate.', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating registrasi_cp:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengupdate data.' });
  }
});

// DELETE (Delete by Admin)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM registrasi_cp WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Data berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting registrasi_cp:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus data.' });
  }
});

module.exports = router;
