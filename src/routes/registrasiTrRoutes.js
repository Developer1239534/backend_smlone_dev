const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET all (Admin & Webhook)
router.get('/', async (req, res) => {
  try {
    const savedData = await db.query('SELECT * FROM registrasi_tr ORDER BY created_at DESC');
    res.json({
      success: true,
      message: 'Berhasil mengambil data registrasi TR.',
      data: savedData.rows
    });
  } catch (error) {
    console.error('Error fetching registrasi_tr:', error.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data dari database.', error: error.message });
  }
});

// GET single by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM registrasi_tr WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan.', error: error.message });
  }
});

const getVal = (obj, keys) => {
  if (!obj) return '';
  const objKeys = Object.keys(obj);
  for (const key of keys) {
    const k = key.toLowerCase();
    const matched = objKeys.find(ok => ok.toLowerCase().includes(k) || ok.toLowerCase() === k);
    if (matched && obj[matched] !== undefined && obj[matched] !== null && obj[matched] !== '') {
      return String(obj[matched]).trim();
    }
  }
  return '';
};

// POST (Create single registration)
router.post('/', async (req, res) => {
  try {
    let data = req.body;
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'Data registrasi tidak boleh kosong.' });
    }
    const timestamp_str = getVal(data, ['timestamp']) || new Date().toLocaleString('id-ID');
    const email_address = getVal(data, ['email address', 'email_address', 'email', 'parentEmail']) || '';
    const full_name = getVal(data, ['full name', 'full_name', 'name', 'fullName']) || 'Peserta Baru';

    const dob = getVal(data, ['date of birth', 'dob', 'tanggal lahir']) || '';
    const gender = getVal(data, ['gender', 'jenis kelamin']) || '';
    const address = getVal(data, ['address', 'alamat']) || '';
    const contact_whatsapp = getVal(data, ['contact', 'whatsapp', 'phone', 'mobileNumber']) || '';
    const program = getVal(data, ['program', 'programSelected']) || '';
    const todays_date = getVal(data, ['todayDate', 'date']) || '';
    const i_agree_doc = getVal(data, ['consent', 'agreement']) ? 'Setuju' : '';
    const program_dipilih = getVal(data, ['subProgramSelected', 'program_dipilih']) || '';
    const nama_sekolah = getVal(data, ['schoolName', 'nama_sekolah']) || '';
    const parents_email = getVal(data, ['parentEmail', 'parents_email']) || '';
    const emergency_contact_person = getVal(data, ['emergencyName', 'emergency_contact_person']) || '';
    const emergency_contact_number = getVal(data, ['emergencyNumber', 'emergency_contact_number']) || '';
    const kelas_peserta = getVal(data, ['schoolGrade', 'kelas_peserta']) || '';
    const tahu_smlone_dari = getVal(data, ['referralSource', 'tahu_smlone_dari']) || '';
    const referensi_teman = getVal(data, ['referralFriendName', 'referensi_teman']) || '';

    const query = `
      INSERT INTO registrasi_tr (
        timestamp_str, email_address, full_name, dob, gender, address, contact_whatsapp, program, todays_date, i_agree_doc,
        program_dipilih, nama_sekolah, parents_email, emergency_contact_person, emergency_contact_number, kelas_peserta, tahu_smlone_dari, referensi_teman, raw_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `;

    const result = await db.query(query, [
      timestamp_str, email_address, full_name, dob, gender, address, contact_whatsapp, program, todays_date, i_agree_doc,
      program_dipilih, nama_sekolah, parents_email, emergency_contact_person, emergency_contact_number, kelas_peserta, tahu_smlone_dari, referensi_teman, JSON.stringify(data)
    ]);

    await db.query(`
      INSERT INTO registrasi_new_seluruh_cabang (data_registrasi, cabang)
      VALUES ($1, $2)
    `, [JSON.stringify(data), 'Tritura']).catch(() => null);

    res.status(201).json({ success: true, message: 'Berhasil menyimpan data registrasi Tritura.', data: result.rows[0] });
  } catch (error) {
    console.error('Error in registrasi_tr POST:', error);
    res.status(500).json({ success: false, message: 'Gagal menyimpan data.', error: error.message });
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

      const timestamp_str = getVal(row, ['timestamp']) || '';
      const email_address = getVal(row, ['email address', 'email_address', 'email']) || '';
      const full_name = getVal(row, ['full name', 'full_name', 'name', 'nama']) || '';

      if (!email_address || !full_name) continue;

      const dob = getVal(row, ['date of birth', 'dob', 'tanggal lahir']) || '';
      const gender = getVal(row, ['gender', 'jenis kelamin']) || '';
      const address = getVal(row, ['address', 'alamat']) || '';
      const contact_whatsapp = getVal(row, ['contact', 'whatsapp', 'phone', 'wa']) || '';
      const program = getVal(row, ['program']) || '';
      const todays_date = getVal(row, ['todayDate', 'today\'s date', 'date', 'tanggal']) || '';
      const i_agree_doc = getVal(row, ['consent', 'i agree', 'persetujuan']) || '';
      const program_dipilih = getVal(row, ['program yang dipilih', 'subprogram', 'program_dipilih']) || '';
      const nama_sekolah = getVal(row, ['sekolah', 'school']) || '';
      const parents_email = getVal(row, ['parent\'s email', 'parent email', 'email orang tua']) || '';
      const emergency_contact_person = getVal(row, ['emergency contact person', 'emergency name', 'kontak darurat nama']) || '';
      const emergency_contact_number = getVal(row, ['emergency contact number', 'emergency number', 'kontak darurat nomor']) || '';
      const kelas_peserta = getVal(row, ['kelas', 'grade']) || '';
      const tahu_smlone_dari = getVal(row, ['tahu smlone', 'referral source']) || '';
      const latest_self_portrait = getVal(row, ['portrait', 'self portrait', 'foto']) || '';
      const tujuan_pelatihan = getVal(row, ['tujuan', 'goal']) || '';
      const harapan_pelatihan = getVal(row, ['harapan', 'expectation']) || '';
      const tahu_event_dari = getVal(row, ['tahu event']) || '';
      const referensi_teman = getVal(row, ['referensi teman', 'referral friend']) || '';

      const program_dipilih_2 = getVal(row, ['program yang dipilih_2', 'program_dipilih_2']) || '';
      const nama_sekolah_2 = getVal(row, ['sekolah_2', 'school_2']) || '';
      const parents_email_2 = getVal(row, ['parent\'s email_2', 'parents_email_2']) || '';
      const emergency_contact_person_2 = getVal(row, ['emergency contact person_2', 'emergency_contact_person_2']) || '';
      const emergency_contact_number_2 = getVal(row, ['emergency contact number_2', 'emergency_contact_number_2']) || '';
      const kelas_peserta_2 = getVal(row, ['kelas_2', 'kelas_peserta_2']) || '';
      const tahu_smlone_dari_2 = getVal(row, ['tahu smlone_2', 'tahu_smlone_dari_2']) || '';
      const referensi_teman_2 = getVal(row, ['referensi teman_2', 'referensi_teman_2']) || '';
      const latest_self_portrait_2 = getVal(row, ['portrait_2', 'latest_self_portrait_2']) || '';
      const referensi_teman_3 = getVal(row, ['referensi teman_3', 'referensi_teman_3']) || '';

      const ig_mama = getVal(row, ['instagram mama', 'ig_mama']) || '';
      const ig_papa = getVal(row, ['instagram papa', 'ig_papa']) || '';
      const ig_anak = getVal(row, ['instagram anak', 'ig_anak']) || '';
      const ig_mama_2 = getVal(row, ['instagram mama_2', 'ig_mama_2']) || '';
      const ig_papa_2 = getVal(row, ['instagram papa_2', 'ig_papa_2']) || '';
      const ig_anak_2 = getVal(row, ['instagram anak_2', 'ig_anak_2']) || '';
      const pernah_ikut_program = getVal(row, ['pernah mengikuti program', 'pernah_ikut_program']) || '';
      const program_pernah_diikuti = getVal(row, ['program yang pernah diikuti', 'program_pernah_diikuti']) || '';
      const terhubung_ig = getVal(row, ['terhubung', 'instagram', 'terhubung_ig']) || '';
      const raw_data = JSON.stringify(row);

      const query = `
        INSERT INTO registrasi_tr (
          timestamp_str, email_address, full_name, dob, gender, address, contact_whatsapp, program, todays_date, i_agree_doc,
          program_dipilih, nama_sekolah, parents_email, emergency_contact_person, emergency_contact_number, kelas_peserta, tahu_smlone_dari, latest_self_portrait, tujuan_pelatihan, harapan_pelatihan,
          tahu_event_dari, referensi_teman, program_dipilih_2, nama_sekolah_2, parents_email_2, emergency_contact_person_2, emergency_contact_number_2, kelas_peserta_2, tahu_smlone_dari_2, referensi_teman_2,
          latest_self_portrait_2, referensi_teman_3, ig_mama, ig_papa, ig_anak, ig_mama_2, ig_papa_2, ig_anak_2, pernah_ikut_program, program_pernah_diikuti,
          terhubung_ig, raw_data
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
          $41, $42
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
          latest_self_portrait = EXCLUDED.latest_self_portrait,
          tujuan_pelatihan = EXCLUDED.tujuan_pelatihan,
          harapan_pelatihan = EXCLUDED.harapan_pelatihan,
          tahu_event_dari = EXCLUDED.tahu_event_dari,
          referensi_teman = EXCLUDED.referensi_teman,
          program_dipilih_2 = EXCLUDED.program_dipilih_2,
          nama_sekolah_2 = EXCLUDED.nama_sekolah_2,
          parents_email_2 = EXCLUDED.parents_email_2,
          emergency_contact_person_2 = EXCLUDED.emergency_contact_person_2,
          emergency_contact_number_2 = EXCLUDED.emergency_contact_number_2,
          kelas_peserta_2 = EXCLUDED.kelas_peserta_2,
          tahu_smlone_dari_2 = EXCLUDED.tahu_smlone_dari_2,
          referensi_teman_2 = EXCLUDED.referensi_teman_2,
          latest_self_portrait_2 = EXCLUDED.latest_self_portrait_2,
          referensi_teman_3 = EXCLUDED.referensi_teman_3,
          ig_mama = EXCLUDED.ig_mama,
          ig_papa = EXCLUDED.ig_papa,
          ig_anak = EXCLUDED.ig_anak,
          ig_mama_2 = EXCLUDED.ig_mama_2,
          ig_papa_2 = EXCLUDED.ig_papa_2,
          ig_anak_2 = EXCLUDED.ig_anak_2,
          pernah_ikut_program = EXCLUDED.pernah_ikut_program,
          program_pernah_diikuti = EXCLUDED.program_pernah_diikuti,
          terhubung_ig = EXCLUDED.terhubung_ig,
          raw_data = EXCLUDED.raw_data
      `;

      await db.query(query, [
        timestamp_str, email_address, full_name, dob, gender, address, contact_whatsapp, program, todays_date, i_agree_doc,
        program_dipilih, nama_sekolah, parents_email, emergency_contact_person, emergency_contact_number, kelas_peserta, tahu_smlone_dari, latest_self_portrait, tujuan_pelatihan, harapan_pelatihan,
        tahu_event_dari, referensi_teman, program_dipilih_2, nama_sekolah_2, parents_email_2, emergency_contact_person_2, emergency_contact_number_2, kelas_peserta_2, tahu_smlone_dari_2, referensi_teman_2,
        latest_self_portrait_2, referensi_teman_3, ig_mama, ig_papa, ig_anak, ig_mama_2, ig_papa_2, ig_anak_2, pernah_ikut_program, program_pernah_diikuti,
        terhubung_ig, raw_data
      ]);

      // Dual-insert into registrasi_new_seluruh_cabang
      await db.query(`
        INSERT INTO registrasi_new_seluruh_cabang (data_registrasi, cabang)
        VALUES ($1, $2)
      `, [JSON.stringify(row), 'Tritura']).catch(() => null);

      insertedCount++;
    }

    await db.query('COMMIT');
    res.json({ success: true, message: `Berhasil menerima dan menyimpan ${insertedCount} data.` });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error in registrasi_tr push:', error);
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
      'email_address', 'full_name', 'dob', 'gender', 'address', 'contact_whatsapp', 'program', 'todays_date', 'i_agree_doc',
      'program_dipilih', 'nama_sekolah', 'parents_email', 'emergency_contact_person', 'emergency_contact_number', 'kelas_peserta', 'tahu_smlone_dari', 'latest_self_portrait', 'tujuan_pelatihan', 'harapan_pelatihan',
      'tahu_event_dari', 'referensi_teman', 'program_dipilih_2', 'nama_sekolah_2', 'parents_email_2', 'emergency_contact_person_2', 'emergency_contact_number_2', 'kelas_peserta_2', 'tahu_smlone_dari_2', 'referensi_teman_2',
      'latest_self_portrait_2', 'referensi_teman_3', 'ig_mama', 'ig_papa', 'ig_anak', 'ig_mama_2', 'ig_papa_2', 'ig_anak_2', 'pernah_ikut_program', 'program_pernah_diikuti', 'terhubung_ig'
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
    const query = `UPDATE registrasi_tr SET ${setQuery.join(', ')} WHERE id = $${index} RETURNING *`;
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }

    res.json({ success: true, message: 'Data berhasil diupdate.', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating registrasi_tr:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengupdate data.' });
  }
});

// DELETE (Delete by Admin)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM registrasi_tr WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Data berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting registrasi_tr:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus data.' });
  }
});

module.exports = router;
