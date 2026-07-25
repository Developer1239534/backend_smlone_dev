const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET endpoint: Fetch all cleaned trainees
router.get('/', async (req, res) => {
  try {
    const savedData = await db.query('SELECT * FROM level_1_tr_cleaned_trainee ORDER BY created_at DESC');

    res.json({
      success: true,
      message: 'Berhasil mengambil data TR cleaned trainee.',
      data: savedData.rows
    });
  } catch (error) {
    console.error('Error fetching TR cleaned trainees:', error.message);
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

    console.log(`[n8n Push TR Cleaned] Received ${data.length} items`);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      if (!row || typeof row !== 'object') {
        console.warn(`[n8n Push TR Cleaned] Skipping invalid row at index ${i}:`, row);
        skippedCount++;
        continue;
      }

      const name = row['Name'] || row['AUTOMATED'] || ''; 
      const trainee_id = row['ID'] || '';
      const first_name = row['First Name'] || '';
      const last_name = row['Last Name'] || '';
      const gender = row['Gender'] || '';
      const dob = row['Date of Birth'] || '';
      const school = row['Nama Sekolah'] || '';
      const grade = row['Kelas'] || '';
      const phone = row['Contact / Whatsapp'] || '';
      const profession = row['Profession'] || '';
      const email_account = row['Email Account'] || '';
      const location = row['Location'] || '';
      const profile_picture = row['Profile Picture'] || '';
      const admin_and_invoice = row['🧾 Admin & Invoice'] || '';
      const emergency_contact_phone = row['Emergency Contact No'] || '';
      const allow_sharing = row['Allow Sharing/Documentation'] || '';
      const program_registered = row['Program Registered'] || '';
      const parents_email = row['Parents Email'] || '';
      const date_created = row['Date Created'] || '';
      const shirt_size = row['Shirt Size'] || '';
      const date_record_created = row['Date Record Created'] || '';
      const start_date = row['Start Date'] || '';
      const membership_duration_days = row['Membership Duration (in Days)'] || '';
      const membership_expiry_date = row['Membership Expiry Date (AE2)'] || '';
      const days_left = row['Days Left'] || '';
      const status_active_expired = row['Active/ Expired'] || '';
      const class_status = row['Class Status'] || '';
      const cleaned_program = row['Cleaned Program'] || '';
      const membership_status = row['MEMBERSHIP STATUS'] || '';
      const clean_membership_status = row['Clean Membership Status'] || '';
      const check_ac_ad = row['CHECK AC=AD'] || '';
      const cabang = row['CABANG'] || '';
      const clean_parents_email = row['Clean Parents? Email'] || '';
      const new_parent_email = row['New Parent Email'] || '';
      const class_name = row['CLASS'] || '';
      const house = row['HOUSE'] || '';
      const level = row['Level'] || '';
      const house_role = row['House Role'] || '';
      const nomor_trainee = row['Nomor Trainee'] || '';
      const email_trainee = row['Email Trainee'] || '';
      const check_double_id = row['Check double ID'] || '';
      const new_profile_picture = row['New Profile Picture'] || '';
      const raw_data = JSON.stringify(row);

      try {
        const insertQuery = `
          INSERT INTO level_1_tr_cleaned_trainee (
            name, trainee_id, first_name, last_name, gender, dob, school, grade, phone, profession, 
            email_account, location, profile_picture, admin_and_invoice, emergency_contact_phone, 
            allow_sharing, program_registered, parents_email, date_created, shirt_size, date_record_created, 
            start_date, membership_duration_days, membership_expiry_date, days_left, status_active_expired, 
            class_status, cleaned_program, membership_status, clean_membership_status, check_ac_ad, cabang, 
            clean_parents_email, new_parent_email, class_name, house, level, house_role, nomor_trainee, 
            email_trainee, check_double_id, new_profile_picture, raw_data
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
            $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
            $41, $42, $43
          )
        `;
        
        await db.query(insertQuery, [
          name, trainee_id, first_name, last_name, gender, dob, school, grade, phone, profession, 
          email_account, location, profile_picture, admin_and_invoice, emergency_contact_phone, 
          allow_sharing, program_registered, parents_email, date_created, shirt_size, date_record_created, 
          start_date, membership_duration_days, membership_expiry_date, days_left, status_active_expired, 
          class_status, cleaned_program, membership_status, clean_membership_status, check_ac_ad, cabang, 
          clean_parents_email, new_parent_email, class_name, house, level, house_role, nomor_trainee, 
          email_trainee, check_double_id, new_profile_picture, raw_data
        ]);
        insertedCount++;
      } catch (rowError) {
        errorCount++;
        errors.push({ index: i, email: email_account, name: first_name, error: rowError.message });
        console.error(`[n8n Push TR Cleaned] Error on row ${i} (${first_name} / ${email_account}):`, rowError.message);
      }
    }

    console.log(`[n8n Push TR Cleaned] Done: inserted=${insertedCount}, skipped=${skippedCount}, errors=${errorCount}`);

    res.json({
      success: true,
      message: `Berhasil menyimpan ${insertedCount} data, ${skippedCount} di-skip, ${errorCount} error.`,
      details: { insertedCount, skippedCount, errorCount, errors: errors.slice(0, 10) }
    });

  } catch (error) {
    console.error('[n8n Push TR Cleaned] Fatal error:', error.message);
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
      'name', 'trainee_id', 'first_name', 'last_name', 'gender', 'dob', 'school', 'grade', 'phone', 'profession', 
      'email_account', 'location', 'profile_picture', 'admin_and_invoice', 'emergency_contact_phone', 
      'allow_sharing', 'program_registered', 'parents_email', 'date_created', 'shirt_size', 'date_record_created', 
      'start_date', 'membership_duration_days', 'membership_expiry_date', 'days_left', 'status_active_expired', 
      'class_status', 'cleaned_program', 'membership_status', 'clean_membership_status', 'check_ac_ad', 'cabang', 
      'clean_parents_email', 'new_parent_email', 'class_name', 'house', 'level', 'house_role', 'nomor_trainee', 
      'email_trainee', 'check_double_id', 'new_profile_picture', 'raw_data'
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
    const query = `UPDATE level_1_tr_cleaned_trainee SET ${setQuery.join(', ')} WHERE id = $${index} RETURNING *`;
    
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data trainee tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Data trainee berhasil diupdate.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating TR cleaned trainee:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengupdate data.' });
  }
});

// DELETE endpoint: Admin Delete Data
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await db.query('DELETE FROM level_1_tr_cleaned_trainee WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data trainee tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Data trainee berhasil dihapus.'
    });
  } catch (error) {
    console.error('Error deleting TR cleaned trainee:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus data.' });
  }
});

module.exports = router;
