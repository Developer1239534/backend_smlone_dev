const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// Helper to resolve table name from cabang_id query parameter
function getTableName(cabangId) {
  const cid = (cabangId || '').toLowerCase().trim();
  if (cid === 'cemara') {
    return 'level_1_ca_cleaned_trainee';
  } else if (cid === 'tritura' || cid === 'tr') {
    return 'level_1_tr_cleaned_trainee';
  } else if (cid === 'cp' || cid === 'citra garden' || cid === 'citragarden') {
    return 'level_1_cp_cleaned_trainee';
  }
  return null;
}

// Allowed columns list for validation
const ALLOWED_COLUMNS = [
  'name', 'trainee_id', 'first_name', 'last_name', 'gender', 'dob', 'school', 'grade', 'phone', 'profession', 
  'email_account', 'location', 'profile_picture', 'emergency_contact_name', 'emergency_contact_phone', 
  'allow_sharing', 'program_registered', 'parents_email', 'date_created', 'shirt_size', 'date_record_created', 
  'start_date', 'membership_duration_days', 'membership_expiry_date', 'days_left', 'status_active_expired', 
  'class_status', 'cleaned_program', 'membership_status', 'clean_membership_status', 'check_ac_ad', 'cabang', 
  'clean_parents_email', 'new_parent_email', 'class_name', 'house', 'level', 'house_role', 'nomor_trainee', 
  'email_trainee', 'check_double_id', 'new_profile_picture', 'raw_data'
];

// GET: Fetch all cleaned trainees for a specific branch
router.get('/', async (req, res) => {
  const { cabang_id } = req.query;
  const tableName = getTableName(cabang_id);
  
  if (!tableName) {
    return res.status(400).json({ 
      success: false, 
      message: 'Parameter cabang_id tidak valid atau wajib diisi (Cemara, Tritura, atau CP).' 
    });
  }

  try {
    const result = await db.query(`SELECT * FROM ${tableName} ORDER BY created_at DESC`);
    res.json({
      success: true,
      message: `Berhasil mengambil data cleaned trainee untuk cabang ${cabang_id}.`,
      data: result.rows
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

// POST: Add a new trainee for a specific branch
router.post('/', async (req, res) => {
  const { cabang_id } = req.query;
  const tableName = getTableName(cabang_id);
  
  if (!tableName) {
    return res.status(400).json({ 
      success: false, 
      message: 'Parameter cabang_id tidak valid atau wajib diisi (Cemara, Tritura, atau CP).' 
    });
  }

  const updates = req.body.raw_data || req.body;
  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'Data trainee wajib diisi.' });
  }

  try {
    const columns = [];
    const placeholders = [];
    const values = [];
    let index = 1;

    for (const key of Object.keys(updates)) {
      if (ALLOWED_COLUMNS.includes(key)) {
        columns.push(key);
        placeholders.push(`$${index}`);
        if (key === 'raw_data') {
          values.push(typeof updates[key] === 'object' ? JSON.stringify(updates[key]) : updates[key]);
        } else {
          values.push(updates[key]);
        }
        index++;
      }
    }

    if (columns.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada kolom valid yang dikirim.' });
    }

    const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
    const result = await db.query(query, values);

    res.json({
      success: true,
      message: 'Data trainee berhasil ditambahkan.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating cleaned trainee:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menyimpan data.' });
  }
});

// PUT: Update a trainee's data by ID for a specific branch
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { cabang_id } = req.query;
  const tableName = getTableName(cabang_id);
  
  if (!tableName) {
    return res.status(400).json({ 
      success: false, 
      message: 'Parameter cabang_id tidak valid atau wajib diisi (Cemara, Tritura, atau CP).' 
    });
  }

  const updates = req.body.raw_data || req.body;
  if (!id || !updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'ID dan data update wajib diisi.' });
  }

  try {
    let setQuery = [];
    let values = [];
    let index = 1;

    for (const key of Object.keys(updates)) {
      if (ALLOWED_COLUMNS.includes(key)) {
        setQuery.push(`${key} = $${index}`);
        if (key === 'raw_data') {
          values.push(typeof updates[key] === 'object' ? JSON.stringify(updates[key]) : updates[key]);
        } else {
          values.push(updates[key]);
        }
        index++;
      }
    }

    if (setQuery.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada kolom valid yang diupdate.' });
    }

    values.push(id);
    const query = `UPDATE ${tableName} SET ${setQuery.join(', ')} WHERE id = $${index} RETURNING *`;
    
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
    console.error('Error updating cleaned trainee:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengupdate data.' });
  }
});

// DELETE: Delete a trainee by ID for a specific branch
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { cabang_id } = req.query;
  const tableName = getTableName(cabang_id);
  
  if (!tableName) {
    return res.status(400).json({ 
      success: false, 
      message: 'Parameter cabang_id tidak valid atau wajib diisi (Cemara, Tritura, atau CP).' 
    });
  }

  try {
    const result = await db.query(`DELETE FROM ${tableName} WHERE id = $1 RETURNING id`, [id]);
    
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
