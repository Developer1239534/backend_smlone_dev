const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');
const bcrypt = require('bcryptjs');

// Helper function to dynamically build update queries
const buildUpdateQuery = (table, fields, id) => {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  
  if (keys.length === 0) return null;

  const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
  const query = `UPDATE ${table} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
  
  return { query, values: [...values, id] };
};

// Helper: format trainee data for admin response (include plain_password, exclude hashed password)
const formatForAdmin = (row) => {
  const { password, ...rest } = row;
  return {
    ...rest,
    plain_password: row.plain_password || null
  };
};

// 1. GET /api/admin/trainees - Get all trainees
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM dashboard_trainne ORDER BY CAST(id AS INTEGER) ASC');
    res.json({ success: true, count: result.rows.length, data: result.rows.map(formatForAdmin) });
  } catch (err) {
    console.error('[Admin Trainees] GET All Error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 2. GET /api/admin/trainees/:id - Get a single trainee by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM dashboard_trainne WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Trainee with ID ${id} not found.` });
    }
    res.json({ success: true, data: formatForAdmin(result.rows[0]) });
  } catch (err) {
    console.error(`[Admin Trainees] GET Single Error (ID: ${id}):`, err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 3. POST /api/admin/trainees - Create a new trainee
router.post('/', async (req, res) => {
  const data = req.body;
  if (!data.id || !data.trainee_name) {
    return res.status(400).json({ success: false, message: 'id and trainee_name are required.' });
  }

  try {
    // Check if exists
    const check = await db.query('SELECT 1 FROM dashboard_trainne WHERE id = $1', [data.id]);
    if (check.rows.length > 0) {
      return res.status(409).json({ success: false, message: `Trainee with ID ${data.id} already exists.` });
    }

    // Hash password if provided, else generate default password 'smlone{id}'
    let plainPassword = data.password;
    if (!plainPassword) {
      plainPassword = `smlone${data.id}`;
    }
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const insertQuery = `
      INSERT INTO dashboard_trainne (
        id, trainee_name, status, program, class, level, membership_expiry,
        last_speaking_project, progress_ke_next_level, highlight_terbaru,
        pengumuman, weekly_report, quarterly_report, referral_code, gold_rank,
        progress_video, laporan_sebelumnya, laporan_quarter_sebelumnya,
        completed_speaking_project, password, plain_password, phone, profile_picture, tanggal_lahir
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24
      ) RETURNING *;
    `;

    const values = [
      data.id, data.trainee_name, data.status || 'Active', data.program || null, data.class || null,
      data.level || null, data.membership_expiry || null,
      data.last_speaking_project || null, data.progress_ke_next_level || null,
      data.highlight_terbaru || null, data.pengumuman || null, data.weekly_report || null,
      data.quarterly_report || null, data.referral_code || null, data.gold_rank || null,
      data.progress_video || null, data.laporan_sebelumnya || null,
      data.laporan_quarter_sebelumnya || null, data.completed_speaking_project || null,
      hashedPassword, plainPassword, data.phone || null, data.profile_picture || null, data.tanggal_lahir || null
    ];

    const result = await db.query(insertQuery, values);
    res.status(201).json({ success: true, message: 'Trainee created successfully.', data: formatForAdmin(result.rows[0]) });
  } catch (err) {
    console.error('[Admin Trainees] POST Error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
});

// 4. PUT /api/admin/trainees/:id - Replace an existing trainee's data completely
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  if (!data.trainee_name) {
    return res.status(400).json({ success: false, message: 'trainee_name is required for PUT (replacement).' });
  }

  try {
    const check = await db.query('SELECT * FROM dashboard_trainne WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Trainee with ID ${id} not found.` });
    }
    const current = check.rows[0];

    // If password is being updated, hash it. If empty string or undefined, keep old.
    let passwordValue = data.password;
    let plainPasswordValue = current.plain_password;
    if (passwordValue && passwordValue !== '' && !passwordValue.startsWith('$2a$') && !passwordValue.startsWith('$2b$')) {
      plainPasswordValue = passwordValue; // save plain version before hashing
      passwordValue = await bcrypt.hash(passwordValue, 10);
    } else {
      passwordValue = current.password;
    }

    // Keep old profile picture if frontend sends empty string
    const profilePictureValue = (data.profile_picture !== undefined && data.profile_picture !== '') ? data.profile_picture : current.profile_picture;

    const updateQuery = `
      UPDATE dashboard_trainne SET
        trainee_name = $1, status = $2, program = $3, class = $4, level = $5,
        membership_expiry = $6, last_speaking_project = $7,
        progress_ke_next_level = $8, highlight_terbaru = $9, pengumuman = $10,
        weekly_report = $11, quarterly_report = $12, referral_code = $13, gold_rank = $14,
        progress_video = $15, laporan_sebelumnya = $16, laporan_quarter_sebelumnya = $17,
        completed_speaking_project = $18, password = $19, plain_password = $20, phone = $21,
        profile_picture = $22, tanggal_lahir = $23
      WHERE id = $24 RETURNING *;
    `;

    const values = [
      data.trainee_name, 
      data.status !== undefined ? data.status : current.status,
      data.program !== undefined ? data.program : current.program,
      data.class !== undefined ? data.class : current.class,
      data.level !== undefined ? data.level : current.level,
      data.membership_expiry !== undefined ? data.membership_expiry : current.membership_expiry,
      data.last_speaking_project !== undefined ? data.last_speaking_project : current.last_speaking_project,
      data.progress_ke_next_level !== undefined ? data.progress_ke_next_level : current.progress_ke_next_level,
      data.highlight_terbaru !== undefined ? data.highlight_terbaru : current.highlight_terbaru,
      data.pengumuman !== undefined ? data.pengumuman : current.pengumuman,
      data.weekly_report !== undefined ? data.weekly_report : current.weekly_report,
      data.quarterly_report !== undefined ? data.quarterly_report : current.quarterly_report,
      data.referral_code !== undefined ? data.referral_code : current.referral_code,
      data.gold_rank !== undefined ? data.gold_rank : current.gold_rank,
      data.progress_video !== undefined ? data.progress_video : current.progress_video,
      data.laporan_sebelumnya !== undefined ? data.laporan_sebelumnya : current.laporan_sebelumnya,
      data.laporan_quarter_sebelumnya !== undefined ? data.laporan_quarter_sebelumnya : current.laporan_quarter_sebelumnya,
      data.completed_speaking_project !== undefined ? data.completed_speaking_project : current.completed_speaking_project,
      passwordValue,
      plainPasswordValue,
      data.phone !== undefined ? data.phone : current.phone,
      profilePictureValue, 
      data.tanggal_lahir !== undefined ? data.tanggal_lahir : current.tanggal_lahir, 
      id
    ];

    const result = await db.query(updateQuery, values);
    res.json({ success: true, message: 'Trainee replaced successfully.', data: formatForAdmin(result.rows[0]) });
  } catch (err) {
    console.error(`[Admin Trainees] PUT Error (ID: ${id}):`, err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
});

// 5. PATCH /api/admin/trainees/:id - Partially update an existing trainee
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  
  // Prevent changing ID through PATCH
  delete updates.id;
  delete updates.hubungi_kami;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No fields provided to update.' });
  }

  try {
    const check = await db.query('SELECT 1 FROM dashboard_trainne WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Trainee with ID ${id} not found.` });
    }

    // Ignore empty strings for certain fields to prevent accidental deletion
    if (updates.password === '') {
      delete updates.password;
    }
    if (updates.profile_picture === '') {
      delete updates.profile_picture;
    }

    // Check if password needs to be hashed
    if (updates.password) {
      if (!updates.password.startsWith('$2a$') && !updates.password.startsWith('$2b$')) {
        updates.plain_password = updates.password; // save plain version before hashing
        updates.password = await bcrypt.hash(updates.password, 10);
      }
    }

    const { query, values } = buildUpdateQuery('dashboard_trainne', updates, id);
    if (!query) {
       return res.status(400).json({ success: false, message: 'Invalid update fields.' });
    }

    const result = await db.query(query, values);
    res.json({ success: true, message: 'Trainee updated successfully.', data: formatForAdmin(result.rows[0]) });
  } catch (err) {
    console.error(`[Admin Trainees] PATCH Error (ID: ${id}):`, err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
});

// 6. DELETE /api/admin/trainees/:id - Delete a trainee
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM dashboard_trainne WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Trainee with ID ${id} not found.` });
    }
    res.json({ success: true, message: 'Trainee deleted successfully.', data: result.rows[0] });
  } catch (err) {
    console.error(`[Admin Trainees] DELETE Error (ID: ${id}):`, err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
});

module.exports = router;
