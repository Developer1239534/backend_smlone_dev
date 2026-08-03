const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/neonClient');

const JWT_SECRET = process.env.JWT_SECRET || 'smlone-portal-jwt-secret-2026';

// Helper to fetch complete integrated trainee data across 3 tables
function formatProfileResponse(row) {
  if (!row) return null;
  const raw = row.raw_data || {};
  const cleanStr = (v) => (v === null || v === undefined || v === 'null' ? '' : String(v).trim());
  const formattedDate = (val) => {
    if (!val) return '';
    if (val instanceof Date) return val.toISOString().split('T')[0];
    return cleanStr(val);
  };

  const name = cleanStr(row.name || raw.name);
  const student_id = cleanStr(row.trainee_id || raw.trainee_id || raw.student_id);
  const personal_email = cleanStr(row.personal_email || raw.personal_email || raw.email);
  const school = cleanStr(row.school || raw.school || raw.school_name);
  const birthday = cleanStr(row.birthday || raw.birthday || raw.dob || raw.date_of_birth);
  const trainee_wa_number = cleanStr(row.trainee_wa_number || raw.trainee_wa_number || raw.wa_trainee);
  const parent_wa_number = cleanStr(row.parent_wa_number || raw.parent_wa_number || raw.phone || raw.contact_whatsapp);
  const house = cleanStr(row.house || raw.house);
  const house_role = cleanStr(row.house_role || raw.house_role);
  const membership = cleanStr(row.membership_status || raw.membership_status || raw.membership);
  const first_enroll = formattedDate(row.first_enroll || raw.first_enroll);
  const expiry_date = formattedDate(row.membership_expired_date || raw.membership_expired_date || raw.expiry_date);
  const className = cleanStr(row.class_name || raw.class_name || raw.class);
  const level = cleanStr(row.level || raw.level);
  const newest_grade = cleanStr(row.newest_grade || raw.newest_grade);
  const branch = cleanStr(row.branch || raw.branch);
  const room = cleanStr(row.room || raw.room);
  const day = cleanStr(row.day || raw.day);
  const time = cleanStr(row.time || raw.time);
  const trainer = cleanStr(row.trainer || raw.trainer);
  const trainee_homeroom = cleanStr(row.trainee_homeroom || raw.trainee_homeroom);
  const class_homeroom = cleanStr(row.homeroom_kelas || raw.homeroom_kelas || raw.class_homeroom);

  return {
    ...row,
    name,
    student_id,
    trainee_id: student_id,
    personal_email,
    school,
    birthday,
    trainee_wa_number,
    parent_wa_number,
    house,
    house_role,
    membership,
    membership_status: membership,
    first_enroll,
    expiry_date,
    membership_expired_date: expiry_date,
    class: className,
    class_name: className,
    level,
    newest_grade,
    branch,
    room,
    day,
    time,
    trainer,
    trainee_homeroom,
    class_homeroom,
    homeroom_kelas: class_homeroom
  };
}

// Helper to fetch complete integrated trainee data across tables
async function getIntegratedTraineeData(traineeId) {
  const cleanId = String(traineeId).trim();

  // 1. Fetch link_report entries
  const linkReportRes = await db.query(
    `SELECT * FROM link_report WHERE LOWER(trainee_id) = LOWER($1) ORDER BY term DESC`,
    [cleanId]
  );

  // 2. Fetch report_activity entry
  const reportActivityRes = await db.query(
    `SELECT * FROM report_activity WHERE LOWER(trainee_id) = LOWER($1)`,
    [cleanId]
  );

  // 3. Fetch profile_trainee entry
  const profileTraineeRes = await db.query(
    `SELECT * FROM profile_trainee WHERE LOWER(trainee_id) = LOWER($1)`,
    [cleanId]
  );

  // 4. Fetch legacy portal_trainee profile entry
  const legacyPortalTraineeRes = await db.query(
    `SELECT * FROM portal_trainee WHERE LOWER(trainee_id) = LOWER($1)`,
    [cleanId]
  );

  const rawProfileData = profileTraineeRes.rows[0] || null;
  const formattedProfileData = formatProfileResponse(rawProfileData);

  return {
    trainee_id: cleanId,
    profile: formattedProfileData || legacyPortalTraineeRes.rows[0] || null,
    link_reports: linkReportRes.rows,
    report_activity: reportActivityRes.rows[0] || null,
    profile_trainee: formattedProfileData,
    portal_admin: formattedProfileData
  };
}

// GET /api/tabel-login-trainee - List all login records with pagination & search
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 50, all } = req.query;

    let query = `SELECT id, trainee_id, nama, plain_password, raw_data, created_at, updated_at FROM tabel_login_trainee`;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(trainee_id ILIKE $${params.length} OR nama ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY id ASC`;

    const countRes = await db.query(
      `SELECT COUNT(*) FROM tabel_login_trainee` + (conditions.length > 0 ? ` WHERE ` + conditions.join(' AND ') : ''),
      params
    );
    const totalItems = parseInt(countRes.rows[0].count, 10);

    if (all === 'true' || all === '1' || limit === '0') {
      const result = await db.query(query, params);
      return res.json({ success: true, data: result.rows, total: totalItems });
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const offset = (pageNum - 1) * limitNum;

    params.push(limitNum);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: totalItems,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalItems / limitNum) || 1
      }
    });
  } catch (error) {
    console.error('[TabelLoginTrainee] Fetch error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data tabel_login_trainee', error: error.message });
  }
});

// POST /api/tabel-login-trainee/login - Trainee Login Endpoint using SML+Trainee ID password
router.post('/login', async (req, res) => {
  try {
    const { trainee_id, password } = req.body;
    const cleanId = String(trainee_id || req.body.student_id || '').trim();

    if (!cleanId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Trainee ID / Student ID dan Password wajib diisi.'
      });
    }

    // Query tabel_login_trainee
    let accountRes = await db.query(
      `SELECT * FROM tabel_login_trainee WHERE LOWER(trainee_id) = LOWER($1)`,
      [cleanId]
    );

    let account = accountRes.rows[0];

    if (!account) {
      // Auto-register default SML+trainee_id password if trainee exists in system
      const integratedCheck = await getIntegratedTraineeData(cleanId);
      if (integratedCheck.profile || integratedCheck.link_reports.length > 0 || integratedCheck.report_activity || integratedCheck.portal_admin) {
        const defaultPlain = `SML${cleanId}`;
        const defaultHash = await bcrypt.hash(defaultPlain, 6);
        const autoInsert = await db.query(
          `INSERT INTO tabel_login_trainee (trainee_id, nama, password, plain_password, raw_data, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT (trainee_id) DO UPDATE SET updated_at = NOW()
           RETURNING *`,
          [cleanId, integratedCheck.profile ? integratedCheck.profile.name : `Trainee ${cleanId}`, defaultHash, defaultPlain, JSON.stringify({ trainee_id: cleanId, plain_password: defaultPlain })]
        );
        account = autoInsert.rows[0];
      } else {
        return res.status(404).json({
          success: false,
          message: 'Trainee ID tidak terdaftar.'
        });
      }
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, account.password) || (password === account.plain_password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: `Password salah. Password default adalah SML+Trainee ID (Contoh: SML${cleanId}).`
      });
    }

    // Fetch integrated data across link_report, report_activity, and portal_admin
    const integratedData = await getIntegratedTraineeData(cleanId);

    const token = jwt.sign(
      { trainee_id: account.trainee_id, role: 'trainee' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      message: 'Login berhasil!',
      token,
      data: {
        trainee_id: account.trainee_id,
        nama: account.nama,
        plain_password: account.plain_password,
        ...integratedData
      }
    });
  } catch (error) {
    console.error('[TabelLoginTrainee] Login error:', error);
    res.status(500).json({ success: false, message: 'Gagal melakukan login trainee', error: error.message });
  }
});

// GET /api/tabel-login-trainee/:trainee_id - Get single login details with integrated table contents
router.get('/:trainee_id', async (req, res) => {
  const { trainee_id } = req.params;
  try {
    const accountRes = await db.query(
      `SELECT id, trainee_id, nama, plain_password, raw_data, created_at, updated_at FROM tabel_login_trainee WHERE LOWER(trainee_id) = LOWER($1)`,
      [trainee_id]
    );

    if (accountRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data login trainee tidak ditemukan' });
    }

    const account = accountRes.rows[0];
    const integratedData = await getIntegratedTraineeData(trainee_id);

    res.json({
      success: true,
      data: {
        account,
        ...integratedData
      }
    });
  } catch (error) {
    console.error('[TabelLoginTrainee] Fetch single error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail login trainee', error: error.message });
  }
});

// POST /api/tabel-login-trainee - Create / insert new login record
router.post('/', async (req, res) => {
  try {
    const { trainee_id, nama, password, plain_password, raw_data } = req.body;
    if (!trainee_id) {
      return res.status(400).json({ success: false, message: 'Trainee ID wajib diisi' });
    }

    const cleanId = String(trainee_id).trim();
    const finalPlainPassword = plain_password || password || `SML${cleanId}`;
    const hashedPassword = await bcrypt.hash(finalPlainPassword, 6);

    const payloadRawData = raw_data || { trainee_id: cleanId, nama, plain_password: finalPlainPassword };

    const result = await db.query(
      `INSERT INTO tabel_login_trainee (trainee_id, nama, password, plain_password, raw_data, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (trainee_id) DO UPDATE SET
        nama = COALESCE(EXCLUDED.nama, tabel_login_trainee.nama),
        password = EXCLUDED.password,
        plain_password = EXCLUDED.plain_password,
        raw_data = EXCLUDED.raw_data,
        updated_at = NOW()
       RETURNING id, trainee_id, nama, plain_password, raw_data, created_at, updated_at`,
      [cleanId, nama || null, hashedPassword, finalPlainPassword, JSON.stringify(payloadRawData)]
    );

    // Sync to profile_trainee
    if (nama) {
      await db.query(`
        INSERT INTO profile_trainee (trainee_id, name, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (trainee_id) DO UPDATE SET
          name = EXCLUDED.name,
          updated_at = NOW();
      `, [cleanId, nama]).catch(() => null);
    }

    res.status(201).json({
      success: true,
      message: 'Data login trainee berhasil dibuat/diperbarui',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[TabelLoginTrainee] Create error:', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan data login trainee', error: error.message });
  }
});

// PUT /api/tabel-login-trainee/:trainee_id - Update login details
router.put('/:trainee_id', async (req, res) => {
  const { trainee_id } = req.params;
  try {
    const { nama, password, plain_password, raw_data } = req.body;
    const cleanId = String(trainee_id).trim();

    const existingRes = await db.query(`SELECT * FROM tabel_login_trainee WHERE LOWER(trainee_id) = LOWER($1)`, [cleanId]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data login trainee tidak ditemukan' });
    }

    const cur = existingRes.rows[0];
    const newNama = nama !== undefined ? nama : cur.nama;
    const newPlainPassword = plain_password !== undefined ? plain_password : (password !== undefined ? password : cur.plain_password);
    const newHashedPassword = password !== undefined || plain_password !== undefined ? await bcrypt.hash(newPlainPassword, 6) : cur.password;

    const payloadRawData = raw_data || { trainee_id: cleanId, nama: newNama, plain_password: newPlainPassword };

    const result = await db.query(
      `UPDATE tabel_login_trainee
       SET nama = $1, password = $2, plain_password = $3, raw_data = $4, updated_at = NOW()
       WHERE LOWER(trainee_id) = LOWER($5)
       RETURNING id, trainee_id, nama, plain_password, raw_data, created_at, updated_at`,
      [newNama, newHashedPassword, newPlainPassword, JSON.stringify(payloadRawData), cleanId]
    );

    // Sync updated name to profile_trainee
    if (newNama) {
      await db.query(`UPDATE profile_trainee SET name = $1, updated_at = NOW() WHERE LOWER(trainee_id) = LOWER($2)`, [newNama, cleanId]).catch(() => null);
    }

    res.json({
      success: true,
      message: 'Data login trainee berhasil diperbarui',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[TabelLoginTrainee] Update error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui data login trainee', error: error.message });
  }
});

// DELETE /api/tabel-login-trainee/:trainee_id - Delete login record
router.delete('/:trainee_id', async (req, res) => {
  const { trainee_id } = req.params;
  try {
    const result = await db.query(`DELETE FROM tabel_login_trainee WHERE LOWER(trainee_id) = LOWER($1) RETURNING *`, [trainee_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data login trainee tidak ditemukan' });
    }

    res.json({
      success: true,
      message: 'Data login trainee berhasil dihapus',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[TabelLoginTrainee] Delete error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus data login trainee', error: error.message });
  }
});

module.exports = router;
