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
      const timestamp_str = row['Timestamp'] || '';
      const email = row['Email Address'] || row['email'] || '';
      const full_name = row['Full Name'] || row['full_name'] || '';

      if (!email || !full_name) continue;

      const dob = row['Date of Birth'] || row['dob'] || '';
      const gender = row['Gender'] || row['gender'] || '';
      const address = row['Address'] || row['address'] || '';
      const phone = row['Contact / Whatsapp No.'] || row['phone'] || '';
      const program = row['Program'] || row['program'] || '';
      const registration_date = row['Today\'s Date'] || row['registration_date'] || '';
      const agreement = row['I Agree, to allow PT. SMLONE INDONESIA, to use any documentation taken in SMLONE programs or other related programs to be used for promotional & educational Purposes.'] || row['agreement'] || '';
      const selected_program = row['Program Yang Dipilih'] || row['selected_program'] || '';
      const school = row['Nama Sekolah (Peserta Training)'] || row['school'] || '';
      const parent_email = row['Parent\'s Email'] || row['parent_email'] || '';
      const emergency_contact_name = row['Emergency Contact Person'] || row['emergency_contact_name'] || '';
      const emergency_contact_phone = row['Emergency Contact Number'] || row['emergency_contact_phone'] || '';
      const grade = row['Kelas (Peserta Training)'] || row['grade'] || '';
      const source = row['Dari Manakah Anda Mengetahui SMLONE?'] || row['source'] || '';
      const referral_name = row['Jika Anda mengenal SMLONE dari Referensi Teman, bolehkah dituliskan nama teman / nama anak teman yang mereferensikan'] || row['referral_name'] || '';
      const ig_mom = row['Akun Instagram Mama'] || row['ig_mom'] || '';
      const ig_dad = row['Akun Instagram Papa'] || row['ig_dad'] || '';
      const ig_child = row['Akun Instagram Anak'] || row['ig_child'] || '';
      const training_goal = row['Apakah Tujuan Anda Mengikuti Pelatihan Ini?'] || row['training_goal'] || '';
      const training_expectation = row['Apa yang ingin Anda dapatkan dari pelatihan ini?'] || row['training_expectation'] || '';
      const event_source = row['Dari Manakah Anda Mengetahui Event Ini?'] || row['event_source'] || '';
      const previous_program = row['Apakah anak Anda sebelumnya pernah mengikuti program di SMLONE?'] || row['previous_program'] || '';
      const previous_program_name = row['Jika pernah mengikuti program di SMLONE, mohon pilih program yang pernah anak Anda ikuti'] || row['previous_program_name'] || '';
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
