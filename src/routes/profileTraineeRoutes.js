const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// Helper to format profile response according to specifications while keeping backward compatibility
function formatProfileResponse(row) {
  if (!row) return null;

  const raw = row.raw_data || {};
  const cleanStr = (v) => (v === null || v === undefined || v === 'null' ? '' : String(v).trim());

  const formattedDate = (val) => {
    if (!val) return '';
    if (val instanceof Date) {
      return val.toISOString().split('T')[0];
    }
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
    ...row, // Preserve raw DB columns for backward compatibility
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

// 1. GET /api/profile-trainee - List profile trainee data with search, filtering & pagination
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      branch, 
      class_name, 
      class: classParam,
      house, 
      level, 
      membership_status, 
      membership,
      trainer,
      school,
      all,
      page = 1, 
      limit = 50 
    } = req.query;

    let query = `SELECT * FROM profile_trainee`;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR trainee_id ILIKE $${params.length} OR class_name ILIKE $${params.length} OR school ILIKE $${params.length} OR personal_email ILIKE $${params.length})`);
    }

    if (branch) {
      params.push(branch);
      conditions.push(`branch ILIKE $${params.length}`);
    }

    const filterClass = class_name || classParam;
    if (filterClass) {
      params.push(filterClass);
      conditions.push(`class_name ILIKE $${params.length}`);
    }

    if (house) {
      params.push(house);
      conditions.push(`house ILIKE $${params.length}`);
    }

    if (level) {
      params.push(level);
      conditions.push(`level ILIKE $${params.length}`);
    }

    const filterStatus = membership_status || membership;
    if (filterStatus) {
      params.push(filterStatus);
      conditions.push(`membership_status ILIKE $${params.length}`);
    }

    if (trainer) {
      params.push(trainer);
      conditions.push(`trainer ILIKE $${params.length}`);
    }

    if (school) {
      params.push(school);
      conditions.push(`school ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY trainee_id ASC`;

    let totalItems = 0;
    let countQuery = `SELECT COUNT(*) FROM profile_trainee`;
    if (conditions.length > 0) {
      countQuery += ` WHERE ` + conditions.join(' AND ');
    }

    const countRes = await db.query(countQuery, params);
    totalItems = parseInt(countRes.rows[0].count, 10);

    if (all === 'true' || all === '1' || limit === '0') {
      const result = await db.query(query, params);
      const formatted = result.rows.map(formatProfileResponse);
      return res.json({
        success: true,
        data: formatted,
        total: totalItems
      });
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const offset = (pageNum - 1) * limitNum;

    params.push(limitNum);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await db.query(query, params);
    const formatted = result.rows.map(formatProfileResponse);

    res.json({
      success: true,
      data: formatted,
      pagination: {
        total: totalItems,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalItems / limitNum) || 1
      }
    });
  } catch (error) {
    console.error('[ProfileTrainee] Fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data profile trainee',
      error: error.message
    });
  }
});

// 2. GET /api/profile-trainee/stats/summary - Summary statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalRes = await db.query(`SELECT COUNT(*) FROM profile_trainee`);
    const branchRes = await db.query(`SELECT branch, COUNT(*) as count FROM profile_trainee GROUP BY branch ORDER BY count DESC`);
    const classRes = await db.query(`SELECT class_name, COUNT(*) as count FROM profile_trainee GROUP BY class_name ORDER BY count DESC`);
    const houseRes = await db.query(`SELECT house, COUNT(*) as count FROM profile_trainee GROUP BY house ORDER BY count DESC`);
    const statusRes = await db.query(`SELECT membership_status, COUNT(*) as count FROM profile_trainee GROUP BY membership_status ORDER BY count DESC`);

    res.json({
      success: true,
      stats: {
        total_records: parseInt(totalRes.rows[0].count, 10),
        by_branch: branchRes.rows,
        by_class: classRes.rows,
        by_house: houseRes.rows,
        by_status: statusRes.rows
      }
    });
  } catch (error) {
    console.error('[ProfileTrainee] Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik profile trainee',
      error: error.message
    });
  }
});

// 3. GET /api/profile-trainee/:trainee_id - Fetch single trainee profile by trainee_id or student_id
router.get('/:trainee_id', async (req, res) => {
  const { trainee_id } = req.params;
  const cleanId = String(trainee_id || '').trim();

  try {
    let result = await db.query(`SELECT * FROM profile_trainee WHERE LOWER(trainee_id) = LOWER($1)`, [cleanId]);

    if (result.rows.length === 0) {
      // Check tabel_login_trainee or portal_trainee as fallback
      const loginCheck = await db.query(`SELECT * FROM tabel_login_trainee WHERE LOWER(trainee_id) = LOWER($1)`, [cleanId]).catch(() => ({ rows: [] }));
      const legacyCheck = await db.query(`SELECT * FROM portal_trainee WHERE LOWER(trainee_id) = LOWER($1)`, [cleanId]).catch(() => ({ rows: [] }));

      const foundName = loginCheck.rows[0]?.nama || legacyCheck.rows[0]?.name || `Trainee ${cleanId}`;
      const foundBranch = legacyCheck.rows[0]?.branch_id || legacyCheck.rows[0]?.cabang || null;
      const foundClass = legacyCheck.rows[0]?.class || legacyCheck.rows[0]?.class_name || null;
      const foundLevel = legacyCheck.rows[0]?.level || null;
      const foundHouse = legacyCheck.rows[0]?.house || legacyCheck.rows[0]?.house_sml || null;

      // Auto-upsert into profile_trainee so future requests hit profile_trainee directly
      const autoUpsert = await db.query(`
        INSERT INTO profile_trainee (trainee_id, name, branch, class_name, level, house, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (trainee_id) DO UPDATE SET updated_at = NOW()
        RETURNING *;
      `, [cleanId, foundName, foundBranch, foundClass, foundLevel, foundHouse]).catch(() => null);

      if (autoUpsert && autoUpsert.rows.length > 0) {
        result = autoUpsert;
      } else {
        return res.json({
          success: true,
          data: formatProfileResponse({ trainee_id: cleanId, name: foundName })
        });
      }
    }

    return res.json({
      success: true,
      data: formatProfileResponse(result.rows[0])
    });
  } catch (error) {
    console.error('[ProfileTrainee] Fetch single error:', error);
    return res.json({
      success: true,
      data: formatProfileResponse({ trainee_id: cleanId, name: `Trainee ${cleanId}` })
    });
  }
});

// 4. POST /api/profile-trainee - Create or upsert a record with new personal fields
router.post('/', async (req, res) => {
  try {
    const {
      class_name, class: classAlias, day, time, room, branch, trainee_id, student_id, name, level,
      newest_grade, house, house_role, trainee_homeroom, homeroom_kelas, class_homeroom,
      trainer, membership_status, membership, membership_expired_date, expiry_date, first_enroll,
      school, personal_email, birthday, trainee_wa_number, parent_wa_number, raw_data
    } = req.body;

    const finalTraineeId = String(trainee_id || student_id || '').trim();
    const finalName = String(name || '').trim();

    if (!finalTraineeId || !finalName) {
      return res.status(400).json({
        success: false,
        message: 'Trainee ID / Student ID dan Nama wajib diisi.'
      });
    }

    const finalClassName = class_name || classAlias || null;
    const finalHomeroomKelas = homeroom_kelas || class_homeroom || null;
    const finalMembershipStatus = membership_status || membership || 'Active';
    const finalExpiryDate = membership_expired_date || expiry_date || null;

    const payloadRawData = raw_data || {
      class_name: finalClassName, day, time, room, branch, trainee_id: finalTraineeId, student_id: finalTraineeId,
      name: finalName, level, newest_grade, house, house_role, trainee_homeroom, homeroom_kelas: finalHomeroomKelas,
      class_homeroom: finalHomeroomKelas, trainer, membership_status: finalMembershipStatus, membership: finalMembershipStatus,
      membership_expired_date: finalExpiryDate, expiry_date: finalExpiryDate, first_enroll,
      school, personal_email, birthday, trainee_wa_number, parent_wa_number
    };

    const queryText = `
      INSERT INTO profile_trainee (
        class_name, day, time, room, branch, trainee_id, name, level,
        newest_grade, house, house_role, trainee_homeroom, homeroom_kelas,
        trainer, membership_status, membership_expired_date, first_enroll,
        school, personal_email, birthday, trainee_wa_number, parent_wa_number,
        raw_data, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, NOW()
      ) 
      ON CONFLICT (trainee_id) 
      DO UPDATE SET
        class_name = COALESCE(EXCLUDED.class_name, profile_trainee.class_name),
        day = COALESCE(EXCLUDED.day, profile_trainee.day),
        time = COALESCE(EXCLUDED.time, profile_trainee.time),
        room = COALESCE(EXCLUDED.room, profile_trainee.room),
        branch = COALESCE(EXCLUDED.branch, profile_trainee.branch),
        name = COALESCE(EXCLUDED.name, profile_trainee.name),
        level = COALESCE(EXCLUDED.level, profile_trainee.level),
        newest_grade = COALESCE(EXCLUDED.newest_grade, profile_trainee.newest_grade),
        house = COALESCE(EXCLUDED.house, profile_trainee.house),
        house_role = COALESCE(EXCLUDED.house_role, profile_trainee.house_role),
        trainee_homeroom = COALESCE(EXCLUDED.trainee_homeroom, profile_trainee.trainee_homeroom),
        homeroom_kelas = COALESCE(EXCLUDED.homeroom_kelas, profile_trainee.homeroom_kelas),
        trainer = COALESCE(EXCLUDED.trainer, profile_trainee.trainer),
        membership_status = COALESCE(EXCLUDED.membership_status, profile_trainee.membership_status),
        membership_expired_date = COALESCE(EXCLUDED.membership_expired_date, profile_trainee.membership_expired_date),
        first_enroll = COALESCE(EXCLUDED.first_enroll, profile_trainee.first_enroll),
        school = COALESCE(EXCLUDED.school, profile_trainee.school),
        personal_email = COALESCE(EXCLUDED.personal_email, profile_trainee.personal_email),
        birthday = COALESCE(EXCLUDED.birthday, profile_trainee.birthday),
        trainee_wa_number = COALESCE(EXCLUDED.trainee_wa_number, profile_trainee.trainee_wa_number),
        parent_wa_number = COALESCE(EXCLUDED.parent_wa_number, profile_trainee.parent_wa_number),
        raw_data = EXCLUDED.raw_data,
        updated_at = NOW()
      RETURNING *;
    `;

    const values = [
      finalClassName, day || null, time || null, room || null, branch || null,
      finalTraineeId, finalName, level || null, newest_grade || null,
      house || null, house_role || null, trainee_homeroom || null, finalHomeroomKelas,
      trainer || null, finalMembershipStatus, finalExpiryDate,
      first_enroll || null, school || null, personal_email || null, birthday || null,
      trainee_wa_number || null, parent_wa_number || null, JSON.stringify(payloadRawData)
    ];

    const result = await db.query(queryText, values);

    // Synchronize to tabel_login_trainee
    await db.query(`
      INSERT INTO tabel_login_trainee (trainee_id, nama, password, plain_password, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (trainee_id) DO UPDATE SET
        nama = EXCLUDED.nama,
        updated_at = NOW();
    `, [finalTraineeId, finalName, `SML${finalTraineeId}`, `SML${finalTraineeId}`]).catch(() => null);

    res.status(201).json({
      success: true,
      message: 'Data profile trainee berhasil disimpan/diperbarui',
      data: formatProfileResponse(result.rows[0])
    });
  } catch (error) {
    console.error('[ProfileTrainee] Create error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat/memperbarui data profile trainee',
      error: error.message
    });
  }
});

// 5. PUT /api/profile-trainee/:trainee_id - Update record by trainee_id
router.put('/:trainee_id', async (req, res) => {
  const { trainee_id } = req.params;
  try {
    const {
      class_name, class: classAlias, day, time, room, branch, name, level,
      newest_grade, house, house_role, trainee_homeroom, homeroom_kelas, class_homeroom,
      trainer, membership_status, membership, membership_expired_date, expiry_date, first_enroll,
      school, personal_email, birthday, trainee_wa_number, parent_wa_number, raw_data
    } = req.body;

    const finalClassName = class_name !== undefined ? class_name : classAlias;
    const finalHomeroomKelas = homeroom_kelas !== undefined ? homeroom_kelas : class_homeroom;
    const finalMembershipStatus = membership_status !== undefined ? membership_status : membership;
    const finalExpiryDate = membership_expired_date !== undefined ? membership_expired_date : expiry_date;

    const existingRes = await db.query(`SELECT * FROM profile_trainee WHERE LOWER(trainee_id) = LOWER($1)`, [trainee_id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data profile trainee tidak ditemukan'
      });
    }

    const cur = existingRes.rows[0];
    const updatedRaw = {
      ...(cur.raw_data || {}),
      ...(raw_data || {}),
      ...(name !== undefined && { name }),
      ...(school !== undefined && { school }),
      ...(personal_email !== undefined && { personal_email }),
      ...(birthday !== undefined && { birthday }),
      ...(trainee_wa_number !== undefined && { trainee_wa_number }),
      ...(parent_wa_number !== undefined && { parent_wa_number })
    };

    const queryText = `
      UPDATE profile_trainee SET
        class_name = COALESCE($1, class_name),
        day = COALESCE($2, day),
        time = COALESCE($3, time),
        room = COALESCE($4, room),
        branch = COALESCE($5, branch),
        name = COALESCE($6, name),
        level = COALESCE($7, level),
        newest_grade = COALESCE($8, newest_grade),
        house = COALESCE($9, house),
        house_role = COALESCE($10, house_role),
        trainee_homeroom = COALESCE($11, trainee_homeroom),
        homeroom_kelas = COALESCE($12, homeroom_kelas),
        trainer = COALESCE($13, trainer),
        membership_status = COALESCE($14, membership_status),
        membership_expired_date = COALESCE($15, membership_expired_date),
        first_enroll = COALESCE($16, first_enroll),
        school = COALESCE($17, school),
        personal_email = COALESCE($18, personal_email),
        birthday = COALESCE($19, birthday),
        trainee_wa_number = COALESCE($20, trainee_wa_number),
        parent_wa_number = COALESCE($21, parent_wa_number),
        raw_data = $22,
        updated_at = NOW()
      WHERE LOWER(trainee_id) = LOWER($23)
      RETURNING *;
    `;

    const values = [
      finalClassName, day, time, room, branch, name, level,
      newest_grade, house, house_role, trainee_homeroom, finalHomeroomKelas,
      trainer, finalMembershipStatus, finalExpiryDate, first_enroll,
      school, personal_email, birthday, trainee_wa_number, parent_wa_number,
      JSON.stringify(updatedRaw),
      trainee_id
    ];

    const result = await db.query(queryText, values);

    if (name) {
      await db.query(`UPDATE tabel_login_trainee SET nama = $1, updated_at = NOW() WHERE LOWER(trainee_id) = LOWER($2)`, [name, trainee_id]).catch(() => null);
    }

    res.json({
      success: true,
      message: 'Data profile trainee berhasil diperbarui',
      data: formatProfileResponse(result.rows[0])
    });
  } catch (error) {
    console.error('[ProfileTrainee] Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data profile trainee',
      error: error.message
    });
  }
});

// 6. DELETE /api/profile-trainee/:trainee_id - Delete record by trainee_id
router.delete('/:trainee_id', async (req, res) => {
  const { trainee_id } = req.params;
  try {
    const result = await db.query(`DELETE FROM profile_trainee WHERE LOWER(trainee_id) = LOWER($1) RETURNING *`, [trainee_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data profile trainee tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Data profile trainee berhasil dihapus',
      data: formatProfileResponse(result.rows[0])
    });
  } catch (error) {
    console.error('[ProfileTrainee] Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data profile trainee',
      error: error.message
    });
  }
});

module.exports = router;
