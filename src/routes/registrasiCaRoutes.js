const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET all (Admin & Webhook)
router.get('/', async (req, res) => {
  try {
    const savedData = await db.query('SELECT * FROM registrasi_ca ORDER BY created_at DESC');
    res.json({
      success: true,
      message: 'Berhasil mengambil data registrasi CA.',
      data: savedData.rows
    });
  } catch (error) {
    console.error('Error fetching registrasi_ca:', error.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data dari database.', error: error.message });
  }
});

// GET single by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM registrasi_ca WHERE id = $1', [id]);
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
    const email = getVal(data, ['email address', 'email_address', 'email', 'parentEmail']) || '';
    const full_name = getVal(data, ['full name', 'full_name', 'name', 'fullName']) || 'Peserta Baru';

    const dob = getVal(data, ['date of birth', 'dob', 'tanggal lahir']) || '';
    const gender = getVal(data, ['gender', 'jenis kelamin']) || '';
    const address = getVal(data, ['address', 'alamat']) || '';
    const phone = getVal(data, ['contact', 'whatsapp', 'phone', 'mobileNumber']) || '';
    const program = getVal(data, ['program', 'programSelected']) || '';
    const registration_date = getVal(data, ['todayDate', 'date']) || '';
    const agreement = getVal(data, ['consent', 'agreement']) ? 'Setuju' : '';
    const selected_program = getVal(data, ['subProgramSelected', 'program_dipilih']) || '';
    const school = getVal(data, ['schoolName', 'nama_sekolah']) || '';
    const parent_email = getVal(data, ['parentEmail', 'parents_email']) || '';
    const emergency_contact_name = getVal(data, ['emergencyName', 'emergency_contact_person']) || '';
    const emergency_contact_phone = getVal(data, ['emergencyNumber', 'emergency_contact_number']) || '';
    const grade = getVal(data, ['schoolGrade', 'kelas_peserta']) || '';
    const source = getVal(data, ['referralSource', 'tahu_smlone_dari']) || '';
    const referral_name = getVal(data, ['referralFriendName', 'referensi_teman']) || '';
    const ig_mom = getVal(data, ['instagramMama', 'ig_mama']) || '';
    const ig_dad = getVal(data, ['instagramPapa', 'ig_papa']) || '';
    const ig_child = getVal(data, ['instagramAnak', 'ig_anak']) || '';

    const query = `
      INSERT INTO registrasi_ca (
        timestamp_str, email, full_name, dob, gender, address, phone, program, 
        registration_date, agreement, selected_program, school, parent_email, emergency_contact_name, 
        emergency_contact_phone, grade, source, referral_name, ig_mom, ig_dad, ig_child, raw_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *
    `;

    const result = await db.query(query, [
      timestamp_str, email, full_name, dob, gender, address, phone, program, 
      registration_date, agreement, selected_program, school, parent_email, emergency_contact_name, 
      emergency_contact_phone, grade, source, referral_name, ig_mom, ig_dad, ig_child, JSON.stringify(data)
    ]);

    await db.query(`
      INSERT INTO registrasi_new_seluruh_cabang (data_registrasi, cabang)
      VALUES ($1, $2)
    `, [JSON.stringify(data), 'Cemara']).catch(() => null);

    res.status(201).json({ success: true, message: 'Berhasil menyimpan data registrasi Cemara.', data: result.rows[0] });
  } catch (error) {
    console.error('Error in registrasi_ca POST:', error);
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
      const timestamp_str = getVal(row, ['timestamp']) || '';
      const email = getVal(row, ['email address', 'email_address', 'email']) || '';
      const full_name = getVal(row, ['full name', 'full_name', 'name', 'nama']) || '';

      if (!email || !full_name) continue;

      const dob = getVal(row, ['date of birth', 'dob', 'tanggal lahir']) || '';
      const gender = getVal(row, ['gender', 'jenis kelamin']) || '';
      const address = getVal(row, ['address', 'alamat']) || '';
      const phone = getVal(row, ['contact', 'whatsapp', 'phone', 'wa']) || '';
      const program = getVal(row, ['program']) || '';
      const registration_date = getVal(row, ['todayDate', 'today\'s date', 'date', 'tanggal']) || '';
      const agreement = getVal(row, ['consent', 'i agree', 'persetujuan']) || '';
      const selected_program = getVal(row, ['program yang dipilih', 'subprogram', 'selected_program']) || '';
      const school = getVal(row, ['sekolah', 'school']) || '';
      const parent_email = getVal(row, ['parent\'s email', 'parent email', 'email orang tua']) || '';
      const emergency_contact_name = getVal(row, ['emergency contact person', 'emergency name', 'kontak darurat nama']) || '';
      const emergency_contact_phone = getVal(row, ['emergency contact number', 'emergency number', 'kontak darurat nomor']) || '';
      const grade = getVal(row, ['kelas', 'grade']) || '';
      const source = getVal(row, ['tahu smlone', 'referral source']) || '';
      const referral_name = getVal(row, ['referensi teman', 'referral friend']) || '';
      const ig_mom = getVal(row, ['instagram mama', 'ig_mama', 'ig_mom']) || '';
      const ig_dad = getVal(row, ['instagram papa', 'ig_papa', 'ig_dad']) || '';
      const ig_child = getVal(row, ['instagram anak', 'ig_anak', 'ig_child']) || '';
      const training_goal = getVal(row, ['tujuan', 'goal']) || '';
      const training_expectation = getVal(row, ['harapan', 'expectation']) || '';
      const event_source = getVal(row, ['tahu event']) || '';
      const previous_program = getVal(row, ['pernah mengikuti program', 'previous_program']) || '';
      const previous_program_name = getVal(row, ['program yang pernah diikuti', 'previous_program_name']) || '';
      const raw_data = JSON.stringify(row);

      const query = `
        INSERT INTO registrasi_ca (
          timestamp_str, email, full_name, dob, gender, address, phone, program, 
          registration_date, agreement, selected_program, school, parent_email, emergency_contact_name, 
          emergency_contact_phone, grade, source, referral_name, ig_mom, ig_dad, ig_child, 
          training_goal, training_expectation, event_source, previous_program, previous_program_name, raw_data
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
        )
        ON CONFLICT (email, full_name) 
        DO UPDATE SET
          timestamp_str = EXCLUDED.timestamp_str,
          dob = EXCLUDED.dob,
          gender = EXCLUDED.gender,
          address = EXCLUDED.address,
          phone = EXCLUDED.phone,
          program = EXCLUDED.program,
          registration_date = EXCLUDED.registration_date,
          agreement = EXCLUDED.agreement,
          selected_program = EXCLUDED.selected_program,
          school = EXCLUDED.school,
          parent_email = EXCLUDED.parent_email,
          emergency_contact_name = EXCLUDED.emergency_contact_name,
          emergency_contact_phone = EXCLUDED.emergency_contact_phone,
          grade = EXCLUDED.grade,
          source = EXCLUDED.source,
          referral_name = EXCLUDED.referral_name,
          ig_mom = EXCLUDED.ig_mom,
          ig_dad = EXCLUDED.ig_dad,
          ig_child = EXCLUDED.ig_child,
          training_goal = EXCLUDED.training_goal,
          training_expectation = EXCLUDED.training_expectation,
          event_source = EXCLUDED.event_source,
          previous_program = EXCLUDED.previous_program,
          previous_program_name = EXCLUDED.previous_program_name,
          raw_data = EXCLUDED.raw_data
      `;

      await db.query(query, [
        timestamp_str, email, full_name, dob, gender, address, phone, program, 
        registration_date, agreement, selected_program, school, parent_email, emergency_contact_name, 
        emergency_contact_phone, grade, source, referral_name, ig_mom, ig_dad, ig_child, 
        training_goal, training_expectation, event_source, previous_program, previous_program_name, raw_data
      ]);

      // Dual-insert into registrasi_new_seluruh_cabang
      await db.query(`
        INSERT INTO registrasi_new_seluruh_cabang (data_registrasi, cabang)
        VALUES ($1, $2)
      `, [JSON.stringify(row), 'Cemara']).catch(() => null);

      insertedCount++;
    }

    await db.query('COMMIT');
    res.json({ success: true, message: `Berhasil menerima dan menyimpan ${insertedCount} data.` });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error in registrasi_ca push:', error);
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
      'email', 'full_name', 'dob', 'gender', 'address', 'phone', 'program', 
      'registration_date', 'selected_program', 'school', 'parent_email', 
      'emergency_contact_name', 'emergency_contact_phone', 'grade', 
      'source', 'referral_name', 'ig_mom', 'ig_dad', 'ig_child', 
      'training_goal', 'training_expectation', 'event_source', 
      'previous_program', 'previous_program_name'
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
    const query = `UPDATE registrasi_ca SET ${setQuery.join(', ')} WHERE id = $${index} RETURNING *`;
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }

    res.json({ success: true, message: 'Data berhasil diupdate.', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating registrasi_ca:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengupdate data.' });
  }
});

// DELETE (Delete by Admin)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM registrasi_ca WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Data berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting registrasi_ca:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus data.' });
  }
});

module.exports = router;
