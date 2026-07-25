const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET endpoint: Ambil semua data registrasi dashboard cemara
router.get('/', async (req, res) => {
  try {
    const savedData = await db.query('SELECT * FROM dashboard_cemara ORDER BY created_at DESC');

    res.json({
      success: true,
      message: 'Berhasil mengambil data dashboard cemara.',
      data: savedData.rows
    });
  } catch (error) {
    console.error('Error fetching dashboard cemara:', error.message);
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
    const result = await db.query('SELECT * FROM dashboard_cemara WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data dashboard cemara tidak ditemukan.' });
    }
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching single dashboard cemara row:', error.message);
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
    
    console.log(`[Push Dashboard Cemara] Menerima ${data.length} data`);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      if (!row || typeof row !== 'object') {
        console.warn(`[Push Dashboard Cemara] Melewati baris tidak valid pada indeks ${i}:`, row);
        skippedCount++;
        continue;
      }

      // Hapus row_number agar tidak tersimpan ke database
      delete row['row_number'];
      delete row['row number'];
      delete row['Row Number'];

      // Pemetaan nama kolom dari Google Sheets (Spasi/Huruf Besar) dan camelCase/snake_case
      const trainee_id = row['Trainee ID'] || row['trainee_id'] || row['traineeId'] || row['ID'] || row['id'] || '';
      const full_name = row['Full Name'] || row['full_name'] || row['fullName'] || row['Name'] || row['name'] || '';
      const gender = row['Gender'] || row['gender'] || '';
      const birth_date = row['Birth Date'] || row['birth_date'] || row['birthDate'] || row['Date of Birth'] || row['dob'] || '';
      const school = row['School'] || row['school'] || row['Nama Sekolah'] || row['nama_sekolah'] || '';
      const learning_program = row['Learning Program'] || row['learning_program'] || row['learningProgram'] || row['Cleaned Program'] || row['cleaned_program'] || '';
      const membership = row['Membership'] || row['membership'] || row['MEMBERSHIP'] || '';
      const expiry_date = row['Expiry Date'] || row['expiry_date'] || row['expiryDate'] || row['EXPIRY DATE'] || '';
      const branch = row['Branch'] || row['branch'] || row['CABANG ID'] || row['cabang_id'] || '';
      const enrollment_date = row['Enrollment Date'] || row['enrollment_date'] || row['enrollmentDate'] || row['FIRST ENROLL'] || row['first_enroll'] || '';
      const class_name = row['Class'] || row['class'] || row['CLASS'] || row['class_name'] || '';
      const house = row['House'] || row['house'] || row['HOUSE'] || '';
      const level = row['Level'] || row['level'] || '';
      const house_role = row['House Role'] || row['house_role'] || row['houseRole'] || '';
      const class_branch = row['Class Branch'] || row['class_branch'] || row['classBranch'] || row['CABANG KELAS'] || row['cabang_kelas'] || '';
      const current_grade = row['Current Grade'] || row['current_grade'] || row['currentGrade'] || row['NEWEST GRADE'] || row['newest_grade'] || '';
      const homeroom = row['Homeroom'] || row['homeroom'] || row['Trainee Homeroom'] || row['trainee_homeroom'] || '';
      const screening_status = row['Screening Status'] || row['screening_status'] || row['screeningStatus'] || row['Screening Test'] || row['screening_test'] || '';
      const draft_grade = row['Draft Grade'] || row['draft_grade'] || row['draftGrade'] || '';
      const previous_grade = row['Previous Grade'] || row['previous_grade'] || row['previousGrade'] || row['Prev Grade'] || row['prev_grade'] || '';
      const class_category = row['Class Category'] || row['class_category'] || row['classCategory'] || row['A/J/Y by Class'] || row['ajy_by_class'] || '';
      const current_stage = row['Current Stage'] || row['current_stage'] || row['currentStage'] || row['Last Real Stage'] || row['last_real_stage'] || '';

      // Validasi data wajib (Trainee ID dan Full Name)
      if (!trainee_id || !full_name) {
        console.warn(`[Push Dashboard Cemara] Melewati baris ${i}: Trainee ID atau Full Name kosong. Keys: ${Object.keys(row).join(', ')}`);
        skippedCount++;
        continue;
      }

      const raw_data = JSON.stringify(row);

      try {
        const upsertQuery = `
          INSERT INTO dashboard_cemara (
            trainee_id, full_name, gender, birth_date, school, learning_program, membership, 
            expiry_date, branch, enrollment_date, class, house, level, house_role, 
            class_branch, current_grade, homeroom, screening_status, draft_grade, 
            previous_grade, class_category, current_stage, raw_data
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, 
            $8, $9, $10, $11, $12, $13, $14, 
            $15, $16, $17, $18, $19, 
            $20, $21, $22, $23
          )
          ON CONFLICT (trainee_id) 
          DO UPDATE SET
            full_name = EXCLUDED.full_name,
            gender = EXCLUDED.gender,
            birth_date = EXCLUDED.birth_date,
            school = EXCLUDED.school,
            learning_program = EXCLUDED.learning_program,
            membership = EXCLUDED.membership,
            expiry_date = EXCLUDED.expiry_date,
            branch = EXCLUDED.branch,
            enrollment_date = EXCLUDED.enrollment_date,
            class = EXCLUDED.class,
            house = EXCLUDED.house,
            level = EXCLUDED.level,
            house_role = EXCLUDED.house_role,
            class_branch = EXCLUDED.class_branch,
            current_grade = EXCLUDED.current_grade,
            homeroom = EXCLUDED.homeroom,
            screening_status = EXCLUDED.screening_status,
            draft_grade = EXCLUDED.draft_grade,
            previous_grade = EXCLUDED.previous_grade,
            class_category = EXCLUDED.class_category,
            current_stage = EXCLUDED.current_stage,
            raw_data = EXCLUDED.raw_data;
        `;
        
        await db.query(upsertQuery, [
          trainee_id, full_name, gender, birth_date, school, learning_program, membership, 
          expiry_date, branch, enrollment_date, class_name, house, level, house_role, 
          class_branch, current_grade, homeroom, screening_status, draft_grade, 
          previous_grade, class_category, current_stage, raw_data
        ]);
        insertedCount++;
      } catch (rowError) {
        errorCount++;
        errors.push({ index: i, id: trainee_id, name: full_name, error: rowError.message });
        console.error(`[Push Dashboard Cemara] Error pada baris ${i} (${full_name} / ${trainee_id}):`, rowError.message);
      }
    }

    console.log(`[Push Dashboard Cemara] Selesai: sukses=${insertedCount}, dilewati=${skippedCount}, error=${errorCount}`);

    res.json({
      success: true,
      message: `Berhasil menyimpan ${insertedCount} data dashboard cemara, ${skippedCount} di-skip, ${errorCount} error.`,
      details: { insertedCount, skippedCount, errorCount, errors: errors.slice(0, 10) }
    });

  } catch (error) {
    console.error('[Push Dashboard Cemara] Fatal error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal memproses data kiriman.',
      error: error.message 
    });
  }
});

// PUT endpoint: Admin Edit Data Dashboard Cemara
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  if (!id || Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'ID dan data update wajib diisi.' });
  }

  try {
    const allowedColumns = [
      'trainee_id', 'full_name', 'gender', 'birth_date', 'school', 'learning_program', 'membership', 
      'expiry_date', 'branch', 'enrollment_date', 'class', 'house', 'level', 'house_role', 
      'class_branch', 'current_grade', 'homeroom', 'screening_status', 'draft_grade', 
      'previous_grade', 'class_category', 'current_stage', 'raw_data'
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
    const query = `UPDATE dashboard_cemara SET ${setQuery.join(', ')} WHERE id = $${index} RETURNING *`;
    
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data dashboard cemara tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Data dashboard cemara berhasil diupdate.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating dashboard_cemara:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengupdate data.' });
  }
});

// DELETE endpoint: Admin Delete Data Dashboard Cemara
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await db.query('DELETE FROM dashboard_cemara WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data dashboard cemara tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Data dashboard cemara berhasil dihapus.'
    });
  } catch (error) {
    console.error('Error deleting dashboard_cemara:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus data.' });
  }
});

module.exports = router;
