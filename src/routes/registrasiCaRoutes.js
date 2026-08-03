const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// Helper to map DB row to Ca layout
const mapRowToCa = (row) => {
  return {
    id: row.id,
    email: row.parent_email || '',
    full_name: row.name,
    dob: row.date_of_birth,
    gender: row.gender,
    address: row.nama_sekolah || '',
    phone: '',
    program: row.cleaned_program,
    registration_date: row.first_enroll,
    agreement: 'Setuju',
    selected_program: row.cleaned_program,
    school: row.nama_sekolah,
    parent_email: row.parent_email || '',
    emergency_contact_name: row.trainee_homeroom || '',
    emergency_contact_phone: '',
    grade: row.newest_grade,
    source: '',
    referral_name: '',
    ig_mom: '',
    ig_dad: '',
    ig_child: '',
    training_goal: '',
    training_expectation: '',
    event_source: '',
    previous_program: '',
    previous_program_name: '',
    timestamp_str: row.first_enroll || '',
    created_at: row.created_at,
    raw_data: {
      ID: row.id,
      Name: row.name,
      Gender: row.gender,
      'Date of Birth': row.date_of_birth,
      School: row.nama_sekolah,
      CLASS: row.class,
      'CABANG ID': 'Cemara',
      'Cleaned Program': row.cleaned_program,
      MEMBERSHIP: row.membership,
      'EXPIRY DATE': row.expiry_date,
      Level: row.level,
      'House Role': row.house_role,
      House: row.house,
      'CABANG KELAS': row.cabang_kelas || 'Cemara',
      'NEWEST GRADE': row.newest_grade,
      'Trainee Homeroom': row.trainee_homeroom,
      'Screening Test': row.screening_test,
      'Draft Grade': row.draft_grade,
      'Prev Grade': row.prev_grade,
      'A/J/Y by Class': row.ajy_by_class,
      'Last Real Stage': row.last_real_stage
    }
  };
};

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

// GET all (Admin & Webhook)
router.get('/', async (req, res) => {
  try {
    let limitClause = '';
    const params = [];
    if (req.query.limit || req.query.page) {
      const limit = parseInt(req.query.limit) || 20;
      const page = parseInt(req.query.page) || 1;
      const offset = (page - 1) * limit;
      limitClause = ` LIMIT $1 OFFSET $2`;
      params.push(limit, offset);
    }
    const savedData = await db.query(`
      SELECT id, name, date_of_birth, gender, nama_sekolah, cleaned_program, first_enroll, 
             parent_email, trainee_homeroom, newest_grade, created_at, cabang_kelas, 
             screening_test, draft_grade, prev_grade, ajy_by_class, last_real_stage 
      FROM data_dashboard_keseluruhan 
      WHERE UPPER(cabang_id) = 'CEMARA' 
      ORDER BY created_at DESC${limitClause}
    `, params);
    res.json({
      success: true,
      message: 'Berhasil mengambil data registrasi CA.',
      data: savedData.rows.map(mapRowToCa)
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
    const result = await db.query('SELECT * FROM data_dashboard_keseluruhan WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }
    res.json({ success: true, data: mapRowToCa(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan.', error: error.message });
  }
});

const fieldMapping = {
  name: 'name',
  fullName: 'name',
  full_name: 'name',
  Name: 'name',
  gender: 'gender',
  Gender: 'gender',
  dob: 'date_of_birth',
  Date_of_Birth: 'date_of_birth',
  'Date of Birth': 'date_of_birth',
  school: 'nama_sekolah',
  nama_sekolah: 'nama_sekolah',
  'Nama Sekolah': 'nama_sekolah',
  grade: 'newest_grade',
  newest_grade: 'newest_grade',
  'NEWEST GRADE': 'newest_grade',
  class: 'class',
  CLASS: 'class',
  house: 'house',
  HOUSE: 'house',
  level: 'level',
  Level: 'level',
  house_role: 'house_role',
  'House Role': 'house_role',
  membership: 'membership',
  MEMBERSHIP: 'membership',
  expiry_date: 'expiry_date',
  'EXPIRY DATE': 'expiry_date',
  first_enroll: 'first_enroll',
  'FIRST ENROLL': 'first_enroll',
  trainee_homeroom: 'trainee_homeroom',
  'Trainee Homeroom': 'trainee_homeroom',
  screening_test: 'screening_test',
  'Screening Test': 'screening_test',
  draft_grade: 'draft_grade',
  'Draft Grade': 'draft_grade',
  prev_grade: 'prev_grade',
  'Prev Grade': 'prev_grade',
  ajy_by_class: 'ajy_by_class',
  'A/J/Y by Class': 'ajy_by_class',
  last_real_stage: 'last_real_stage',
  'Last Real Stage': 'last_real_stage',
  cleaned_program: 'cleaned_program',
  'Cleaned Program': 'cleaned_program',
  cabang_kelas: 'cabang_kelas',
  'CABANG KELAS': 'cabang_kelas'
};

const allowedColumns = [
  'id', 'name', 'gender', 'date_of_birth', 'nama_sekolah', 'cleaned_program', 'membership', 
  'expiry_date', 'cabang_id', 'first_enroll', 'class', 'house', 'level', 'house_role', 
  'cabang_kelas', 'newest_grade', 'trainee_homeroom', 'screening_test', 'draft_grade', 
  'prev_grade', 'ajy_by_class', 'last_real_stage'
];

// Helper to upsert data_dashboard_keseluruhan
async function upsertTrainee(id, updates, cabangId = 'CEMARA') {
  const columns = [];
  const placeholders = [];
  const values = [];
  let index = 1;

  columns.push('cabang_id');
  placeholders.push(`$${index}`);
  values.push(cabangId);
  index++;

  columns.push('cabang_kelas');
  placeholders.push(`$${index}`);
  values.push(cabangId);
  index++;

  columns.push('id');
  placeholders.push(`$${index}`);
  values.push(id);
  index++;

  for (const key of Object.keys(updates)) {
    const dbCol = fieldMapping[key] || fieldMapping[key.toLowerCase().trim().replace(/ /g, '_')];
    if (dbCol && allowedColumns.includes(dbCol) && !columns.includes(dbCol)) {
      columns.push(dbCol);
      placeholders.push(`$${index}`);
      values.push(updates[key]);
      index++;
    }
  }

  const updateStatements = columns
    .filter(col => col !== 'id')
    .map(col => `${col} = EXCLUDED.${col}`)
    .join(', ');

  const query = `
    INSERT INTO data_dashboard_keseluruhan (${columns.join(', ')}) 
    VALUES (${placeholders.join(', ')}) 
    ON CONFLICT (id) DO UPDATE SET ${updateStatements} 
    RETURNING *
  `;
  const result = await db.query(query, values);
  return result.rows[0];
}

// POST (Create single registration)
router.post('/', async (req, res) => {
  try {
    const rawData = req.body.raw_data || req.body;
    if (!rawData || Object.keys(rawData).length === 0) {
      return res.status(400).json({ success: false, message: 'Data trainee tidak boleh kosong.' });
    }

    const id = String(rawData.id || rawData.ID || rawData.trainee_id || '').trim();
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID trainee wajib diisi.' });
    }

    const result = await upsertTrainee(id, rawData, 'CEMARA');
    res.status(201).json({ success: true, message: 'Berhasil menyimpan data registrasi Cemara.', data: mapRowToCa(result) });
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
        INSERT INTO registrasi_new_seluruh_cabang (
          data_registrasi, cabang, email, full_name, dob, gender, phone, program, 
          address, previous_program, selected_program, school, grade, parent_email, 
          emergency_contact_name, emergency_contact_phone, source, agreement
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      `, [
        JSON.stringify(row), 'Cemara', email, full_name, dob, gender, phone, program, 
        address, previous_program, selected_program, school, grade, parent_email, 
        emergency_contact_name, emergency_contact_phone, source, agreement
      ]).catch(() => null);

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
  const updates = req.body.raw_data || req.body;

  if (!id || Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'ID dan data update wajib diisi.' });
  }

  try {
    const result = await upsertTrainee(id, updates, 'CEMARA');
    res.json({ success: true, message: 'Data berhasil diupdate.', data: mapRowToCa(result) });
  } catch (error) {
    console.error('Error updating registrasi_ca:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengupdate data.', error: error.message });
  }
});

// DELETE (Delete by Admin)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM data_dashboard_keseluruhan WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Data berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting registrasi_ca:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus data.', error: error.message });
  }
});

module.exports = router;
