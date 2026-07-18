const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET endpoint: Ambil semua data registrasi staff
router.get('/', async (req, res) => {
  try {
    const savedData = await db.query('SELECT * FROM level_1_automed_smlone_staff ORDER BY created_at DESC');

    res.json({
      success: true,
      message: 'Berhasil mengambil data level 1 automed smlone staff.',
      data: savedData.rows
    });
  } catch (error) {
    console.error('Error fetching level 1 automed smlone staff:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data dari database.',
      error: error.message 
    });
  }
});

// POST endpoint: Simpan/Push data dari N8N atau React FE
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
    
    console.log(`[Push Automed Smlone Staff] Menerima ${data.length} data`);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      if (!row || typeof row !== 'object') {
        console.warn(`[Push Automed Smlone Staff] Melewati baris tidak valid pada indeks ${i}:`, row);
        skippedCount++;
        continue;
      }

      // Pemetaan nama kolom dari Google Sheets (Spasi/Huruf Besar) dan camelCase/snake_case
      const trainee_id = row['ID'] || row['trainee_id'] || row['traineeId'] || '';
      const name = row['Name'] || row['name'] || '';
      const gender = row['Gender'] || row['gender'] || '';
      const dob = row['Date of Birth'] || row['dob'] || row['date_of_birth'] || '';
      const nama_sekolah = row['Nama Sekolah'] || row['school'] || row['schoolName'] || row['nama_sekolah'] || '';
      const cleaned_program = row['Cleaned Program'] || row['cleaned_program'] || row['cleanedProgram'] || '';
      const membership = row['MEMBERSHIP'] || row['membership'] || '';
      const expiry_date = row['EXPIRY DATE'] || row['expiry_date'] || row['expiryDate'] || '';
      const cabang_id = row['CABANG ID'] || row['cabang_id'] || row['cabangId'] || '';
      const first_enroll = row['FIRST ENROLL'] || row['first_enroll'] || row['firstEnroll'] || '';
      const class_name = row['CLASS'] || row['class'] || row['class_name'] || row['className'] || '';
      const house = row['HOUSE'] || row['house'] || '';
      const level = row['Level'] || row['level'] || '';
      const house_role = row['House Role'] || row['house_role'] || row['houseRole'] || '';
      const cabang_kelas = row['CABANG KELAS'] || row['cabang_kelas'] || row['cabangKelas'] || '';
      const newest_grade = row['NEWEST GRADE'] || row['newest_grade'] || row['newestGrade'] || '';
      const trainee_homeroom = row['Trainee Homeroom'] || row['trainee_homeroom'] || row['traineeHomeroom'] || '';
      const screening_test = row['Screening Test'] || row['screening_test'] || row['screeningTest'] || '';
      const draft_grade = row['Draft Grade'] || row['draft_grade'] || row['draftGrade'] || '';
      const prev_grade = row['Prev Grade'] || row['prev_grade'] || row['prevGrade'] || '';
      const ajy_by_class = row['A/J/Y by Class'] || row['ajy_by_class'] || row['ajyByClass'] || '';
      const last_real_stage = row['Last Real Stage'] || row['last_real_stage'] || row['lastRealStage'] || '';

      // Validasi data wajib (ID dan Nama)
      if (!trainee_id || !name) {
        console.warn(`[Push Automed Smlone Staff] Melewati baris ${i}: ID atau Name kosong. Keys: ${Object.keys(row).join(', ')}`);
        skippedCount++;
        continue;
      }

      const raw_data = JSON.stringify(row);

      try {
        const upsertQuery = `
          INSERT INTO level_1_automed_smlone_staff (
            trainee_id, name, gender, dob, nama_sekolah, cleaned_program, membership, 
            expiry_date, cabang_id, first_enroll, class_name, house, level, house_role, 
            cabang_kelas, newest_grade, trainee_homeroom, screening_test, draft_grade, 
            prev_grade, ajy_by_class, last_real_stage, raw_data
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, 
            $8, $9, $10, $11, $12, $13, $14, 
            $15, $16, $17, $18, $19, 
            $20, $21, $22, $23
          )
          ON CONFLICT (trainee_id) 
          DO UPDATE SET
            name = EXCLUDED.name,
            gender = EXCLUDED.gender,
            dob = EXCLUDED.dob,
            nama_sekolah = EXCLUDED.nama_sekolah,
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
            raw_data = EXCLUDED.raw_data;
        `;
        
        await db.query(upsertQuery, [
          trainee_id, name, gender, dob, nama_sekolah, cleaned_program, membership, 
          expiry_date, cabang_id, first_enroll, class_name, house, level, house_role, 
          cabang_kelas, newest_grade, trainee_homeroom, screening_test, draft_grade, 
          prev_grade, ajy_by_class, last_real_stage, raw_data
        ]);
        insertedCount++;
      } catch (rowError) {
        errorCount++;
        errors.push({ index: i, id: trainee_id, name: name, error: rowError.message });
        console.error(`[Push Automed Smlone Staff] Error pada baris ${i} (${name} / ${trainee_id}):`, rowError.message);
      }
    }

    console.log(`[Push Automed Smlone Staff] Selesai: sukses=${insertedCount}, dilewati=${skippedCount}, error=${errorCount}`);

    res.json({
      success: true,
      message: `Berhasil menyimpan ${insertedCount} data staff, ${skippedCount} di-skip, ${errorCount} error.`,
      details: { insertedCount, skippedCount, errorCount, errors: errors.slice(0, 10) }
    });

  } catch (error) {
    console.error('[Push Automed Smlone Staff] Fatal error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal memproses data kiriman.',
      error: error.message 
    });
  }
});

// PUT endpoint: Admin Edit Data Staff
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  if (!id || Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'ID dan data update wajib diisi.' });
  }

  try {
    const allowedColumns = [
      'trainee_id', 'name', 'gender', 'dob', 'nama_sekolah', 'cleaned_program', 'membership', 
      'expiry_date', 'cabang_id', 'first_enroll', 'class_name', 'house', 'level', 'house_role', 
      'cabang_kelas', 'newest_grade', 'trainee_homeroom', 'screening_test', 'draft_grade', 
      'prev_grade', 'ajy_by_class', 'last_real_stage', 'raw_data'
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
    const query = `UPDATE level_1_automed_smlone_staff SET ${setQuery.join(', ')} WHERE id = $${index} RETURNING *`;
    
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data staff tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Data staff berhasil diupdate.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating level_1_automed_smlone_staff:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengupdate data.' });
  }
});

// DELETE endpoint: Admin Delete Data Staff
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await db.query('DELETE FROM level_1_automed_smlone_staff WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data staff tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Data staff berhasil dihapus.'
    });
  } catch (error) {
    console.error('Error deleting level_1_automed_smlone_staff:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus data.' });
  }
});

module.exports = router;
