const express = require('express');
const router = express.Router();
const db = require('../../db/neonClient');

/**
 * ============================================================
 * ROUTE: Profile Trainee Portal (/api/profile-trainee & /api/portal/profile-trainee)
 * HANYA 22 Kolom Resmi Sesuai Permintaan:
 * 1. Class
 * 2. Day
 * 3. Time
 * 4. Room
 * 5. Branch
 * 6. ID (Primary Key)
 * 7. Name
 * 8. Level
 * 9. HOUSE
 * 10. House Role
 * 11. Trainee Homeroom
 * 12. Homeroom kelas
 * 13. Trainer
 * 14. MEMBERSHIP
 * 15. EXPIRY DATE
 * 16. FIRST ENROLL
 * 17. Date of Birth
 * 18. Class in School
 * 19. Parents Email Account
 * 20. Parent WhatsApp Number
 * 21. Trainee WhatsApp Number
 * 22. School Name
 * ============================================================
 */

// Helper to ensure profile_trainee table exists with EXACTLY and ONLY the 22 columns
async function ensureProfileTraineeTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS profile_trainee (
        "Class"                   VARCHAR(100),
        "Day"                     VARCHAR(50),
        "Time"                    VARCHAR(50),
        "Room"                    VARCHAR(100),
        "Branch"                  VARCHAR(100),
        "ID"                      VARCHAR(255) PRIMARY KEY,
        "Name"                    VARCHAR(255),
        "Level"                   VARCHAR(100),
        "HOUSE"                   VARCHAR(100),
        "House Role"              VARCHAR(100),
        "Trainee Homeroom"        VARCHAR(255),
        "Homeroom kelas"          VARCHAR(100),
        "Trainer"                 VARCHAR(255),
        "MEMBERSHIP"              VARCHAR(100),
        "EXPIRY DATE"             TEXT,
        "FIRST ENROLL"            TEXT,
        "Date of Birth"           TEXT,
        "Class in School"         VARCHAR(100),
        "Parents Email Account"   VARCHAR(255),
        "Parent WhatsApp Number"  VARCHAR(100),
        "Trainee WhatsApp Number" VARCHAR(100),
        "School Name"             VARCHAR(255)
      );
    `);
  } catch (err) {
    console.error('[Profile Trainee] Ensure table error:', err.message);
  }
}

// Format row untuk menghasilkan 22 kolom resmi dan alias kompatibilitas frontend
function formatProfileRow(row) {
  return {
    "Class": row["Class"] ?? '',
    "Day": row["Day"] ?? '',
    "Time": row["Time"] ?? '',
    "Room": row["Room"] ?? '',
    "Branch": row["Branch"] ?? '',
    "ID": row["ID"] ?? '',
    "Name": row["Name"] ?? '',
    "Level": row["Level"] ?? '',
    "HOUSE": row["HOUSE"] ?? '',
    "House Role": row["House Role"] ?? '',
    "Trainee Homeroom": row["Trainee Homeroom"] ?? '',
    "Homeroom kelas": row["Homeroom kelas"] ?? '',
    "Trainer": row["Trainer"] ?? '',
    "MEMBERSHIP": row["MEMBERSHIP"] ?? '',
    "EXPIRY DATE": row["EXPIRY DATE"] ?? '',
    "FIRST ENROLL": row["FIRST ENROLL"] ?? '',
    "Date of Birth": row["Date of Birth"] ?? '',
    "Class in School": row["Class in School"] ?? '',
    "Parents Email Account": row["Parents Email Account"] ?? '',
    "Parent WhatsApp Number": row["Parent WhatsApp Number"] ?? '',
    "Trainee WhatsApp Number": row["Trainee WhatsApp Number"] ?? '',
    "School Name": row["School Name"] ?? '',
    // Alias kompatibilitas frontend
    id: row["ID"] ?? '',
    name: row["Name"] ?? '',
    class: row["Class"] ?? '',
    day: row["Day"] ?? '',
    time: row["Time"] ?? '',
    room: row["Room"] ?? '',
    branch: row["Branch"] ?? '',
    level: row["Level"] ?? '',
    house: row["HOUSE"] ?? '',
    house_role: row["House Role"] ?? '',
    trainee_homeroom: row["Trainee Homeroom"] ?? '',
    homeroom_kelas: row["Homeroom kelas"] ?? '',
    trainer: row["Trainer"] ?? '',
    membership: row["MEMBERSHIP"] ?? '',
    expiry_date: row["EXPIRY DATE"] ?? '',
    first_enroll: row["FIRST ENROLL"] ?? '',
    date_of_birth: row["Date of Birth"] ?? '',
    class_in_school: row["Class in School"] ?? '',
    parents_email_account: row["Parents Email Account"] ?? '',
    parent_whatsapp_number: row["Parent WhatsApp Number"] ?? '',
    trainee_whatsapp_number: row["Trainee WhatsApp Number"] ?? '',
    school_name: row["School Name"] ?? ''
  };
}

// 1. GET / - Ambil semua data Profile Trainee (search & filter) murni dari database Neon
router.get('/', async (req, res) => {
  try {
    await ensureProfileTraineeTable();
    const { search, house, class_name, membership, branch, level, limit, page } = req.query;

    let query = `
      SELECT 
        "Class", "Day", "Time", "Room", "Branch", "ID", "Name", "Level", "HOUSE", "House Role",
        "Trainee Homeroom", "Homeroom kelas", "Trainer", "MEMBERSHIP", "EXPIRY DATE", "FIRST ENROLL",
        "Date of Birth", "Class in School", "Parents Email Account", "Parent WhatsApp Number",
        "Trainee WhatsApp Number", "School Name"
      FROM profile_trainee
    `;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search.trim()}%`);
      const pIdx = `$${params.length}`;
      conditions.push(`("ID" ILIKE ${pIdx} OR "Name" ILIKE ${pIdx} OR "HOUSE" ILIKE ${pIdx} OR "Class" ILIKE ${pIdx} OR "Branch" ILIKE ${pIdx})`);
    }

    if (house) {
      params.push(house.trim());
      conditions.push(`"HOUSE" ILIKE $${params.length}`);
    }

    if (class_name) {
      params.push(class_name.trim());
      conditions.push(`"Class" ILIKE $${params.length}`);
    }

    if (membership) {
      params.push(membership.trim());
      conditions.push(`"MEMBERSHIP" ILIKE $${params.length}`);
    }

    if (branch) {
      params.push(branch.trim());
      conditions.push(`"Branch" ILIKE $${params.length}`);
    }

    if (level) {
      params.push(level.trim());
      conditions.push(`"Level" ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY "ID" ASC';

    if (limit) {
      const parsedLimit = parseInt(limit, 10) || 50;
      const parsedPage = parseInt(page, 10) || 1;
      const offset = (parsedPage - 1) * parsedLimit;
      params.push(parsedLimit, offset);
      query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;
    }

    const result = await db.query(query, params);
    const formatted = result.rows.map(formatProfileRow);

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data Profile Trainee.',
      count: formatted.length,
      total: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('[Profile Trainee] GET / error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data Profile Trainee dari database.',
      error: error.message
    });
  }
});

// 2. GET /:id - Ambil detail Profile Trainee berdasarkan ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await ensureProfileTraineeTable();
    const result = await db.query(
      `SELECT 
        "Class", "Day", "Time", "Room", "Branch", "ID", "Name", "Level", "HOUSE", "House Role",
        "Trainee Homeroom", "Homeroom kelas", "Trainer", "MEMBERSHIP", "EXPIRY DATE", "FIRST ENROLL",
        "Date of Birth", "Class in School", "Parents Email Account", "Parent WhatsApp Number",
        "Trainee WhatsApp Number", "School Name"
      FROM profile_trainee 
      WHERE "ID" = $1 OR "ID" ILIKE $1 
      LIMIT 1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Profile Trainee dengan ID: "${id}" tidak ditemukan di database.`
      });
    }

    const row = result.rows[0];
    return res.status(200).json({
      success: true,
      message: `Berhasil mengambil data Profile Trainee ID: ${id}.`,
      data: formatProfileRow(row),
      ...formatProfileRow(row)
    });
  } catch (error) {
    console.error('[Profile Trainee] GET /:id error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail data Profile Trainee.',
      error: error.message
    });
  }
});

// 3. POST / - Tambah / Upsert data tunggal (22 kolom murni)
router.post('/', async (req, res) => {
  try {
    await ensureProfileTraineeTable();
    const row = req.body;

    const id = String(row['ID'] ?? row['id'] ?? '').trim();
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Kolom "ID" wajib diisi.'
      });
    }

    const className = String(row['Class'] ?? row['class'] ?? '').trim();
    const day = String(row['Day'] ?? row['day'] ?? '').trim();
    const time = String(row['Time'] ?? row['time'] ?? '').trim();
    const room = String(row['Room'] ?? row['room'] ?? '').trim();
    const branch = String(row['Branch'] ?? row['branch'] ?? '').trim();
    const name = String(row['Name'] ?? row['name'] ?? row['Nama'] ?? row['nama'] ?? '').trim();
    const level = String(row['Level'] ?? row['level'] ?? '').trim();
    const house = String(row['HOUSE'] ?? row['House'] ?? row['house'] ?? '').trim();
    const houseRole = String(row['House Role'] ?? row['house_role'] ?? '').trim();
    const traineeHomeroom = String(row['Trainee Homeroom'] ?? row['trainee_homeroom'] ?? '').trim();
    const homeroomKelas = String(row['Homeroom kelas'] ?? row['homeroom_kelas'] ?? '').trim();
    const trainer = String(row['Trainer'] ?? row['trainer'] ?? '').trim();
    const membership = String(row['MEMBERSHIP'] ?? row['Membership'] ?? row['membership'] ?? '').trim();
    const expiryDate = String(row['EXPIRY DATE'] ?? row['Expiry Date'] ?? row['expiry_date'] ?? '').trim();
    const firstEnroll = String(row['FIRST ENROLL'] ?? row['First Enroll'] ?? row['first_enroll'] ?? row['Start Date'] ?? '').trim();
    const dob = String(row['Date of Birth'] ?? row['Date of Birthday'] ?? row['date_of_birth'] ?? '').trim();
    const classInSchool = String(row['Class in School'] ?? row['class_in_school'] ?? row['Kelas'] ?? '').trim();
    const parentsEmail = String(row['Parents Email Account'] ?? row['Email Account Parents'] ?? row['emailParents'] ?? '').trim();
    const parentWa = String(row['Parent WhatsApp Number'] ?? row['Nomor WA Parent'] ?? row['waParent'] ?? '').trim();
    const traineeWa = String(row['Trainee WhatsApp Number'] ?? row['Nomor WA Trainee'] ?? row['waTrainee'] ?? '').trim();
    const schoolName = String(row['School Name'] ?? row['Nama Sekolah'] ?? row['schoolName'] ?? '').trim();

    const insertResult = await db.query(`
      INSERT INTO profile_trainee (
        "Class", "Day", "Time", "Room", "Branch", "ID", "Name", "Level", "HOUSE", "House Role",
        "Trainee Homeroom", "Homeroom kelas", "Trainer", "MEMBERSHIP", "EXPIRY DATE", "FIRST ENROLL",
        "Date of Birth", "Class in School", "Parents Email Account", "Parent WhatsApp Number",
        "Trainee WhatsApp Number", "School Name"
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22
      )
      ON CONFLICT ("ID") DO UPDATE 
      SET "Class"                   = EXCLUDED."Class",
          "Day"                     = EXCLUDED."Day",
          "Time"                    = EXCLUDED."Time",
          "Room"                    = EXCLUDED."Room",
          "Branch"                  = EXCLUDED."Branch",
          "Name"                    = EXCLUDED."Name",
          "Level"                   = EXCLUDED."Level",
          "HOUSE"                   = EXCLUDED."HOUSE",
          "House Role"              = EXCLUDED."House Role",
          "Trainee Homeroom"        = EXCLUDED."Trainee Homeroom",
          "Homeroom kelas"          = EXCLUDED."Homeroom kelas",
          "Trainer"                 = EXCLUDED."Trainer",
          "MEMBERSHIP"              = EXCLUDED."MEMBERSHIP",
          "EXPIRY DATE"             = EXCLUDED."EXPIRY DATE",
          "FIRST ENROLL"            = EXCLUDED."FIRST ENROLL",
          "Date of Birth"           = EXCLUDED."Date of Birth",
          "Class in School"         = EXCLUDED."Class in School",
          "Parents Email Account"   = EXCLUDED."Parents Email Account",
          "Parent WhatsApp Number"  = EXCLUDED."Parent WhatsApp Number",
          "Trainee WhatsApp Number" = EXCLUDED."Trainee WhatsApp Number",
          "School Name"             = EXCLUDED."School Name"
      RETURNING *;
    `, [
      className, day, time, room, branch, id, name, level, house, houseRole,
      traineeHomeroom, homeroomKelas, trainer, membership, expiryDate, firstEnroll,
      dob, classInSchool, parentsEmail, parentWa, traineeWa, schoolName
    ]);

    return res.status(201).json({
      success: true,
      message: 'Data Profile Trainee berhasil disimpan/diperbarui.',
      data: formatProfileRow(insertResult.rows[0])
    });
  } catch (error) {
    console.error('[Profile Trainee] POST / error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal menyimpan data Profile Trainee.',
      error: error.message
    });
  }
});

// 4. POST /push - Bulk Upsert sinkronisasi Google Sheet / n8n (22 kolom murni)
router.post('/push', async (req, res) => {
  try {
    await ensureProfileTraineeTable();
    let data = req.body;

    if (!Array.isArray(data)) {
      data = [data];
    }

    if (data.length === 0) {
      return res.status(400).json({ success: false, message: 'Data array kosong.' });
    }

    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || typeof row !== 'object') {
        skippedCount++;
        continue;
      }

      const id = String(row['ID'] ?? row['id'] ?? '').trim();
      if (!id) {
        skippedCount++;
        continue;
      }

      const className = String(row['Class'] ?? row['class'] ?? '').trim();
      const day = String(row['Day'] ?? row['day'] ?? '').trim();
      const time = String(row['Time'] ?? row['time'] ?? '').trim();
      const room = String(row['Room'] ?? row['room'] ?? '').trim();
      const branch = String(row['Branch'] ?? row['branch'] ?? '').trim();
      const name = String(row['Name'] ?? row['name'] ?? row['Nama'] ?? row['nama'] ?? '').trim();
      const level = String(row['Level'] ?? row['level'] ?? '').trim();
      const house = String(row['HOUSE'] ?? row['House'] ?? row['house'] ?? '').trim();
      const houseRole = String(row['House Role'] ?? row['house_role'] ?? '').trim();
      const traineeHomeroom = String(row['Trainee Homeroom'] ?? row['trainee_homeroom'] ?? '').trim();
      const homeroomKelas = String(row['Homeroom kelas'] ?? row['homeroom_kelas'] ?? '').trim();
      const trainer = String(row['Trainer'] ?? row['trainer'] ?? '').trim();
      const membership = String(row['MEMBERSHIP'] ?? row['Membership'] ?? row['membership'] ?? '').trim();
      const expiryDate = String(row['EXPIRY DATE'] ?? row['Expiry Date'] ?? row['expiry_date'] ?? '').trim();
      const firstEnroll = String(row['FIRST ENROLL'] ?? row['First Enroll'] ?? row['first_enroll'] ?? '').trim();
      const dob = String(row['Date of Birth'] ?? row['Date of Birthday'] ?? row['date_of_birth'] ?? '').trim();
      const classInSchool = String(row['Class in School'] ?? row['class_in_school'] ?? row['Kelas'] ?? '').trim();
      const parentsEmail = String(row['Parents Email Account'] ?? row['Email Account Parents'] ?? '').trim();
      const parentWa = String(row['Parent WhatsApp Number'] ?? row['Nomor WA Parent'] ?? '').trim();
      const traineeWa = String(row['Trainee WhatsApp Number'] ?? row['Nomor WA Trainee'] ?? '').trim();
      const schoolName = String(row['School Name'] ?? row['Nama Sekolah'] ?? '').trim();

      try {
        await db.query(`
          INSERT INTO profile_trainee (
            "Class", "Day", "Time", "Room", "Branch", "ID", "Name", "Level", "HOUSE", "House Role",
            "Trainee Homeroom", "Homeroom kelas", "Trainer", "MEMBERSHIP", "EXPIRY DATE", "FIRST ENROLL",
            "Date of Birth", "Class in School", "Parents Email Account", "Parent WhatsApp Number",
            "Trainee WhatsApp Number", "School Name"
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22
          )
          ON CONFLICT ("ID") DO UPDATE 
          SET "Class"                   = EXCLUDED."Class",
              "Day"                     = EXCLUDED."Day",
              "Time"                    = EXCLUDED."Time",
              "Room"                    = EXCLUDED."Room",
              "Branch"                  = EXCLUDED."Branch",
              "Name"                    = EXCLUDED."Name",
              "Level"                   = EXCLUDED."Level",
              "HOUSE"                   = EXCLUDED."HOUSE",
              "House Role"              = EXCLUDED."House Role",
              "Trainee Homeroom"        = EXCLUDED."Trainee Homeroom",
              "Homeroom kelas"          = EXCLUDED."Homeroom kelas",
              "Trainer"                 = EXCLUDED."Trainer",
              "MEMBERSHIP"              = EXCLUDED."MEMBERSHIP",
              "EXPIRY DATE"             = EXCLUDED."EXPIRY DATE",
              "FIRST ENROLL"            = EXCLUDED."FIRST ENROLL",
              "Date of Birth"           = EXCLUDED."Date of Birth",
              "Class in School"         = EXCLUDED."Class in School",
              "Parents Email Account"   = EXCLUDED."Parents Email Account",
              "Parent WhatsApp Number"  = EXCLUDED."Parent WhatsApp Number",
              "Trainee WhatsApp Number" = EXCLUDED."Trainee WhatsApp Number",
              "School Name"             = EXCLUDED."School Name";
        `, [
          className, day, time, room, branch, id, name, level, house, houseRole,
          traineeHomeroom, homeroomKelas, trainer, membership, expiryDate, firstEnroll,
          dob, classInSchool, parentsEmail, parentWa, traineeWa, schoolName
        ]);
        insertedCount++;
      } catch (rowErr) {
        errorCount++;
        errors.push({ index: i, id, error: rowErr.message });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Bulk push selesai. Berhasil: ${insertedCount}, Dilewati: ${skippedCount}, Gagal: ${errorCount}`,
      details: { insertedCount, skippedCount, errorCount, errors: errors.slice(0, 5) }
    });
  } catch (error) {
    console.error('[Profile Trainee] POST /push error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memproses bulk push.',
      error: error.message
    });
  }
});

// 5. PUT /:id - Update data profil Trainee (hanya 22 kolom)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await ensureProfileTraineeTable();
    const checkRes = await db.query('SELECT * FROM profile_trainee WHERE "ID" = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Profile Trainee ID: "${id}" tidak ditemukan.`
      });
    }

    const existing = checkRes.rows[0];
    const b = req.body;

    const updatedClass = b["Class"] ?? b["class"] ?? existing["Class"];
    const updatedDay = b["Day"] ?? b["day"] ?? existing["Day"];
    const updatedTime = b["Time"] ?? b["time"] ?? existing["Time"];
    const updatedRoom = b["Room"] ?? b["room"] ?? existing["Room"];
    const updatedBranch = b["Branch"] ?? b["branch"] ?? existing["Branch"];
    const updatedName = b["Name"] ?? b["name"] ?? b["Nama"] ?? existing["Name"];
    const updatedLevel = b["Level"] ?? b["level"] ?? existing["Level"];
    const updatedHouse = b["HOUSE"] ?? b["House"] ?? b["house"] ?? existing["HOUSE"];
    const updatedHouseRole = b["House Role"] ?? b["house_role"] ?? existing["House Role"];
    const updatedTraineeHomeroom = b["Trainee Homeroom"] ?? b["trainee_homeroom"] ?? existing["Trainee Homeroom"];
    const updatedHomeroomKelas = b["Homeroom kelas"] ?? b["homeroom_kelas"] ?? existing["Homeroom kelas"];
    const updatedTrainer = b["Trainer"] ?? b["trainer"] ?? existing["Trainer"];
    const updatedMembership = b["MEMBERSHIP"] ?? b["Membership"] ?? existing["MEMBERSHIP"];
    const updatedExpiryDate = b["EXPIRY DATE"] ?? b["Expiry Date"] ?? existing["EXPIRY DATE"];
    const updatedFirstEnroll = b["FIRST ENROLL"] ?? b["First Enroll"] ?? existing["FIRST ENROLL"];
    const updatedDob = b["Date of Birth"] ?? b["Date of Birthday"] ?? existing["Date of Birth"];
    const updatedClassInSchool = b["Class in School"] ?? b["class_in_school"] ?? existing["Class in School"];
    const updatedParentsEmail = b["Parents Email Account"] ?? b["emailParents"] ?? existing["Parents Email Account"];
    const updatedParentWa = b["Parent WhatsApp Number"] ?? b["waParent"] ?? existing["Parent WhatsApp Number"];
    const updatedTraineeWa = b["Trainee WhatsApp Number"] ?? b["waTrainee"] ?? existing["Trainee WhatsApp Number"];
    const updatedSchoolName = b["School Name"] ?? b["schoolName"] ?? existing["School Name"];

    const updateRes = await db.query(`
      UPDATE profile_trainee
      SET "Class"                   = $2,
          "Day"                     = $3,
          "Time"                    = $4,
          "Room"                    = $5,
          "Branch"                  = $6,
          "Name"                    = $7,
          "Level"                   = $8,
          "HOUSE"                   = $9,
          "House Role"              = $10,
          "Trainee Homeroom"        = $11,
          "Homeroom kelas"          = $12,
          "Trainer"                 = $13,
          "MEMBERSHIP"              = $14,
          "EXPIRY DATE"             = $15,
          "FIRST ENROLL"            = $16,
          "Date of Birth"           = $17,
          "Class in School"         = $18,
          "Parents Email Account"   = $19,
          "Parent WhatsApp Number"  = $20,
          "Trainee WhatsApp Number" = $21,
          "School Name"             = $22
      WHERE "ID" = $1
      RETURNING *;
    `, [
      id, updatedClass, updatedDay, updatedTime, updatedRoom, updatedBranch,
      updatedName, updatedLevel, updatedHouse, updatedHouseRole,
      updatedTraineeHomeroom, updatedHomeroomKelas, updatedTrainer,
      updatedMembership, updatedExpiryDate, updatedFirstEnroll,
      updatedDob, updatedClassInSchool, updatedParentsEmail,
      updatedParentWa, updatedTraineeWa, updatedSchoolName
    ]);

    return res.status(200).json({
      success: true,
      message: `Profile Trainee ID: ${id} berhasil diperbarui.`,
      data: formatProfileRow(updateRes.rows[0])
    });
  } catch (error) {
    console.error('[Profile Trainee] PUT /:id error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data Profile Trainee.',
      error: error.message
    });
  }
});

// 6. DELETE /:id - Hapus data Profile Trainee berdasarkan ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleteRes = await db.query(
      'DELETE FROM profile_trainee WHERE "ID" = $1 RETURNING *;',
      [id]
    );

    if (deleteRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Tidak ditemukan data Profile Trainee dengan ID: "${id}".`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Data Profile Trainee ID: ${id} berhasil dihapus.`,
      deleted: formatProfileRow(deleteRes.rows[0])
    });
  } catch (error) {
    console.error('[Profile Trainee] DELETE /:id error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus data Profile Trainee.',
      error: error.message
    });
  }
});

module.exports = router;
