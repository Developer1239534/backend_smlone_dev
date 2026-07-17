const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET endpoint: Fetch all cleaned trainees
router.get('/', async (req, res) => {
  try {
    const savedData = await db.query('SELECT * FROM level_1_cp_cleaned_trainee ORDER BY created_at DESC');

    res.json({
      success: true,
      message: 'Berhasil mengambil data CP cleaned trainee.',
      data: savedData.rows
    });
  } catch (error) {
    console.error('Error fetching CP cleaned trainees:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data dari database.',
      error: error.message 
    });
  }
});

// DEBUG endpoint: Echo what n8n sends (TEMPORARY)
router.post('/debug', (req, res) => {
  const body = req.body;
  const isArray = Array.isArray(body);
  const sample = isArray ? body[0] : body;
  res.json({
    is_array: isArray,
    total_items: isArray ? body.length : 1,
    sample_keys: sample ? Object.keys(sample) : [],
    sample_first_item: sample || null
  });
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

    console.log(`[n8n Push CP Cleaned] Received ${data.length} items`);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      if (!row || typeof row !== 'object') {
        console.warn(`[n8n Push CP Cleaned] Skipping invalid row at index ${i}:`, row);
        skippedCount++;
        continue;
      }

      const trainee_id = row['ID'] || '';
      const name = row['Name'] || '';
      const gender = row['Gender'] || '';
      const dob = row['Date of Birth'] || '';
      const school = row['Nama Sekolah'] || '';
      const cleaned_program = row['Cleaned Program'] || '';
      const membership = row['MEMBERSHIP'] || '';
      const expiry_date = row['EXPIRY DATE'] || '';
      const cabang_id = row['CABANG ID'] || '';
      const first_enroll = row['FIRST ENROLL'] || '';
      const class_name = row['CLASS'] || '';
      const house = row['HOUSE'] || '';
      const level = row['Level'] || '';
      const house_role = row['House Role'] || '';
      const cabang_kelas = row['CABANG KELAS'] || '';
      const newest_grade = row['NEWEST GRADE'] || '';
      const trainee_homeroom = row['Trainee Homeroom'] || '';
      const screening_test = row['Screening Test'] || '';
      const draft_grade = row['Draft Grade'] || '';
      const prev_grade = row['Prev Grade'] || '';
      const ajy_by_class = row['A/J/Y by Class'] || '';
      const last_real_stage = row['Last Real Stage'] || '';
      const contact_whatsapp_parent = row['Contact / Whatsapp Parent'] || '';
      const contact_whatsapp_anak = row['Contact / Whatsapp Anak'] || '';

      if (!trainee_id && !name) {
        console.warn(`[n8n Push CP Cleaned] Skipping row ${i}: empty ID and Name.`);
        skippedCount++;
        continue;
      }

      const raw_data = JSON.stringify(row);

      try {
        const upsertQuery = `
          INSERT INTO level_1_cp_cleaned_trainee (
            trainee_id, name, gender, dob, school, cleaned_program, membership, expiry_date,
            cabang_id, first_enroll, class_name, house, level, house_role, cabang_kelas,
            newest_grade, trainee_homeroom, screening_test, draft_grade, prev_grade,
            ajy_by_class, last_real_stage, contact_whatsapp_parent, contact_whatsapp_anak, raw_data
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25
          ) ON CONFLICT (trainee_id) DO UPDATE SET
            name = EXCLUDED.name,
            gender = EXCLUDED.gender,
            dob = EXCLUDED.dob,
            school = EXCLUDED.school,
            cleaned_program = EXCLUDED.cleaned_program,
            membership = EXCLUDED.membership,
            expiry_date = EXCLUDED.expiry_date,
            cabang_id = EXCLUDED.cabang_id,
            first_enroll = EXCLUDED.first_enroll,
            class_name = EXCLUDED.class_name,
            house = EXCLUDED.house,
            level = EXCLUDED.level,
            house_role = EXCLUDED.house_role,
            cabang_kelas = EXCLUDED.cabang_kelas,
            newest_grade = EXCLUDED.newest_grade,
            trainee_homeroom = EXCLUDED.trainee_homeroom,
            screening_test = EXCLUDED.screening_test,
            draft_grade = EXCLUDED.draft_grade,
            prev_grade = EXCLUDED.prev_grade,
            ajy_by_class = EXCLUDED.ajy_by_class,
            last_real_stage = EXCLUDED.last_real_stage,
            contact_whatsapp_parent = EXCLUDED.contact_whatsapp_parent,
            contact_whatsapp_anak = EXCLUDED.contact_whatsapp_anak,
            raw_data = EXCLUDED.raw_data;
        `;
        
        await db.query(upsertQuery, [
            trainee_id, name, gender, dob, school, cleaned_program, membership, expiry_date,
            cabang_id, first_enroll, class_name, house, level, house_role, cabang_kelas,
            newest_grade, trainee_homeroom, screening_test, draft_grade, prev_grade,
            ajy_by_class, last_real_stage, contact_whatsapp_parent, contact_whatsapp_anak, raw_data
        ]);
        insertedCount++;
      } catch (rowError) {
        errorCount++;
        errors.push({ index: i, id: trainee_id, name: name, error: rowError.message });
        console.error(`[n8n Push CP Cleaned] Error on row ${i} (${name} / ${trainee_id}):`, rowError.message);
      }
    }

    console.log(`[n8n Push CP Cleaned] Done: inserted=${insertedCount}, skipped=${skippedCount}, errors=${errorCount}`);

    res.json({
      success: true,
      message: `Berhasil menyimpan ${insertedCount} data, ${skippedCount} di-skip, ${errorCount} error.`,
      details: { insertedCount, skippedCount, errorCount, errors: errors.slice(0, 10) }
    });

  } catch (error) {
    console.error('[n8n Push CP Cleaned] Fatal error:', error.message);
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
      'trainee_id', 'name', 'gender', 'dob', 'school', 'cleaned_program', 'membership', 'expiry_date',
      'cabang_id', 'first_enroll', 'class_name', 'house', 'level', 'house_role', 'cabang_kelas',
      'newest_grade', 'trainee_homeroom', 'screening_test', 'draft_grade', 'prev_grade',
      'ajy_by_class', 'last_real_stage', 'contact_whatsapp_parent', 'contact_whatsapp_anak', 'raw_data'
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
    const query = `UPDATE level_1_cp_cleaned_trainee SET ${setQuery.join(', ')} WHERE id = $${index} RETURNING *`;
    
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
    console.error('Error updating CP cleaned trainee:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengupdate data.' });
  }
});

// DELETE endpoint: Admin Delete Data
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await db.query('DELETE FROM level_1_cp_cleaned_trainee WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data trainee tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Data trainee berhasil dihapus.'
    });
  } catch (error) {
    console.error('Error deleting CP cleaned trainee:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus data.' });
  }
});

module.exports = router;
