const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// Helper to map DB row to frontend expected format
const mapRowToFrontend = (row) => {
  return {
    id: row.id,
    trainee_id: row.id,
    full_name: row.name,
    name: row.name,
    gender: row.gender,
    dob: row.date_of_birth,
    school: row.nama_sekolah,
    grade: row.newest_grade,
    cleaned_program: row.cleaned_program,
    membership: row.membership,
    expiry_date: row.expiry_date,
    cabang_id: row.cabang_id,
    class_branch: row.cabang_kelas || row.cabang_id,
    branch: row.cabang_id,
    class: row.ajy_by_class || row.class,
    house: row.house,
    level: row.level,
    house_role: row.house_role,
    raw_data: {
      ID: row.id,
      Name: row.name,
      Gender: row.gender,
      'Date of Birth': row.date_of_birth,
      School: row.nama_sekolah,
      CLASS: row.class,
      'CABANG ID': row.cabang_id,
      MEMBERSHIP: row.membership,
      ...row
    }
  };
};

// GET: Fetch all cleaned trainees for a specific branch
router.get('/', async (req, res) => {
  const { cabang_id } = req.query;
  if (!cabang_id) {
    return res.status(400).json({ 
      success: false, 
      message: 'Parameter cabang_id wajib diisi (Cemara, Tritura, atau CP).' 
    });
  }

  try {
    let query = 'SELECT * FROM data_dashboard_keseluruhan WHERE UPPER(cabang_id) = $1 ORDER BY created_at DESC';
    let param = cabang_id.toUpperCase().trim();
    
    // Normalization mapping for CP and Tritura
    if (param === 'TR') param = 'TRITURA';
    if (param === 'CP') param = 'TIMOR';
    
    const result = await db.query(query, [param]);
    
    res.json({
      success: true,
      message: `Berhasil mengambil data cleaned trainee untuk cabang ${cabang_id}.`,
      data: result.rows.map(mapRowToFrontend)
    });
  } catch (error) {
    console.error(`Error fetching cleaned trainees for ${cabang_id}:`, error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data dari database.',
      error: error.message 
    });
  }
});

// POST: Add a new trainee
router.post('/', async (req, res) => {
  const { cabang_id } = req.query;
  const updates = req.body.raw_data || req.body;
  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'Data trainee wajib diisi.' });
  }

  try {
    const allowedColumns = [
      'name', 'gender', 'date_of_birth', 'nama_sekolah', 'cleaned_program', 'membership', 
      'expiry_date', 'cabang_id', 'first_enroll', 'class', 'house', 'level', 'house_role', 
      'cabang_kelas', 'newest_grade', 'trainee_homeroom', 'screening_test', 'draft_grade', 
      'prev_grade', 'ajy_by_class', 'last_real_stage'
    ];

    const fieldMapping = {
      name: 'name',
      fullName: 'name',
      full_name: 'name',
      gender: 'gender',
      dob: 'date_of_birth',
      birth_date: 'date_of_birth',
      school: 'nama_sekolah',
      nama_sekolah: 'nama_sekolah',
      grade: 'newest_grade',
      newest_grade: 'newest_grade',
      class: 'class',
      class_name: 'class',
      house: 'house',
      level: 'level',
      house_role: 'house_role',
      membership: 'membership',
      expiry_date: 'expiry_date',
      first_enroll: 'first_enroll',
      enrollment_date: 'first_enroll',
      trainee_homeroom: 'trainee_homeroom',
      homeroom: 'trainee_homeroom',
      screening_test: 'screening_test',
      screening_status: 'screening_test',
      draft_grade: 'draft_grade',
      prev_grade: 'prev_grade',
      ajy_by_class: 'ajy_by_class',
      last_real_stage: 'last_real_stage'
    };

    const columns = [];
    const placeholders = [];
    const values = [];
    let index = 1;

    // Auto-set cabang_id if present in query
    if (cabang_id) {
      let branchVal = cabang_id.toUpperCase().trim();
      if (branchVal === 'TR') branchVal = 'TRITURA';
      if (branchVal === 'CP') branchVal = 'TIMOR';
      
      columns.push('cabang_id');
      placeholders.push(`$${index}`);
      values.push(branchVal);
      index++;

      columns.push('cabang_kelas');
      placeholders.push(`$${index}`);
      values.push(branchVal);
      index++;
    }

    for (const key of Object.keys(updates)) {
      const dbCol = fieldMapping[key];
      if (dbCol && allowedColumns.includes(dbCol) && !columns.includes(dbCol)) {
        columns.push(dbCol);
        placeholders.push(`$${index}`);
        values.push(updates[key]);
        index++;
      }
    }

    if (columns.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada kolom valid yang dikirim.' });
    }

    const query = `INSERT INTO data_dashboard_keseluruhan (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
    const result = await db.query(query, values);

    res.json({
      success: true,
      message: 'Data trainee berhasil ditambahkan.',
      data: mapRowToFrontend(result.rows[0])
    });
  } catch (error) {
    console.error('Error creating cleaned trainee:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menyimpan data.' });
  }
});

// PUT: Update a trainee's data by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body.raw_data || req.body;
  if (!id || !updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'ID dan data update wajib diisi.' });
  }

  try {
    const allowedColumns = [
      'name', 'gender', 'date_of_birth', 'nama_sekolah', 'cleaned_program', 'membership', 
      'expiry_date', 'cabang_id', 'first_enroll', 'class', 'house', 'level', 'house_role', 
      'cabang_kelas', 'newest_grade', 'trainee_homeroom', 'screening_test', 'draft_grade', 
      'prev_grade', 'ajy_by_class', 'last_real_stage'
    ];

    const fieldMapping = {
      name: 'name',
      fullName: 'name',
      full_name: 'name',
      gender: 'gender',
      dob: 'date_of_birth',
      birth_date: 'date_of_birth',
      school: 'nama_sekolah',
      nama_sekolah: 'nama_sekolah',
      grade: 'newest_grade',
      newest_grade: 'newest_grade',
      class: 'class',
      class_name: 'class',
      house: 'house',
      level: 'level',
      house_role: 'house_role',
      membership: 'membership',
      expiry_date: 'expiry_date',
      first_enroll: 'first_enroll',
      enrollment_date: 'first_enroll',
      trainee_homeroom: 'trainee_homeroom',
      homeroom: 'trainee_homeroom',
      screening_test: 'screening_test',
      screening_status: 'screening_test',
      draft_grade: 'draft_grade',
      prev_grade: 'prev_grade',
      ajy_by_class: 'ajy_by_class',
      last_real_stage: 'last_real_stage'
    };

    let setQuery = [];
    let values = [];
    let index = 1;

    for (const key of Object.keys(updates)) {
      const dbCol = fieldMapping[key];
      if (dbCol && allowedColumns.includes(dbCol)) {
        setQuery.push(`${dbCol} = $${index}`);
        values.push(updates[key]);
        index++;
      }
    }

    if (setQuery.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada kolom valid yang diupdate.' });
    }

    values.push(id);
    const query = `UPDATE data_dashboard_keseluruhan SET ${setQuery.join(', ')} WHERE id = $${index} RETURNING *`;
    
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data trainee tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Data trainee berhasil diupdate.',
      data: mapRowToFrontend(result.rows[0])
    });
  } catch (error) {
    console.error('Error updating cleaned trainee:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengupdate data.' });
  }
});

// DELETE: Delete a trainee by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM data_dashboard_keseluruhan WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data trainee tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Data trainee berhasil dihapus.'
    });
  } catch (error) {
    console.error('Error deleting cleaned trainee:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus data.' });
  }
});

module.exports = router;
