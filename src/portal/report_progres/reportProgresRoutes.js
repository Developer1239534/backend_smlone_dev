const express = require('express');
const router = express.Router();
const db = require('../../db/neonClient');

/**
 * ============================================================
 * ROUTE: Report Progres / Weekly Report
 * 16 Kolom Resmi:
 * 1.  ID
 * 2.  Student Name
 * 3.  Class Trainers
 * 4.  Date
 * 5.  Coach Feedback
 * 6.  Challenge
 * 7.  Speaking Project
 * 8.  Role 2
 * 9.  Role 3
 * 10. Role 4
 * 11. Life Project
 * 12. House
 * 13. Level
 * 14. Latest Speaking Project
 * 15. Last Time Speaking
 * 16. Class
 * ============================================================
 */

// Helper to format output with fallback keys for frontend & external system compatibility
function formatReportProgresRow(row) {
  if (!row) return null;
  return {
    ...row,
    // ID
    ID: row["ID"],
    id: row["ID"],
    // Student Name
    "Student Name": row["Student Name"],
    student_name: row["Student Name"],
    name: row["Student Name"],
    Nama: row["Student Name"],
    // Class Trainers
    "Class Trainers": row["Class Trainers"],
    class_trainers: row["Class Trainers"],
    "Trainer Homeroom": row["Class Trainers"],
    trainer_homeroom: row["Class Trainers"],
    // Date
    Date: row["Date"],
    date: row["Date"],
    Tanggal: row["Date"],
    // Coach Feedback
    "Coach Feedback": row["Coach Feedback"],
    coach_feedback: row["Coach Feedback"],
    feedback: row["Coach Feedback"],
    // Challenge
    Challenge: row["Challenge"],
    challenge: row["Challenge"],
    // Speaking Project
    "Speaking Project": row["Speaking Project"],
    speaking_project: row["Speaking Project"],
    // Role 2, 3, 4
    "Role 2": row["Role 2"],
    role_2: row["Role 2"],
    role2: row["Role 2"],
    "Role 3": row["Role 3"],
    role_3: row["Role 3"],
    role3: row["Role 3"],
    "Role 4": row["Role 4"],
    role_4: row["Role 4"],
    role4: row["Role 4"],
    // Life Project
    "Life Project": row["Life Project"],
    life_project: row["Life Project"],
    // House
    House: row["House"],
    house: row["House"],
    // Level
    Level: row["Level"],
    level: row["Level"],
    // Latest Speaking Project
    "Latest Speaking Project": row["Latest Speaking Project"],
    latest_speaking_project: row["Latest Speaking Project"],
    // Last Time Speaking
    "Last Time Speaking": row["Last Time Speaking"],
    last_time_speaking: row["Last Time Speaking"],
    last_speaking_time: row["Last Time Speaking"],
    // Class
    Class: row["Class"],
    class: row["Class"],
    "Class Name": row["Class"],
    class_name: row["Class"]
  };
}

// Helper to ensure report_progres table exists with exact 16 columns (no row_id)
async function ensureReportProgresTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS report_progres (
        "ID"                      VARCHAR(255),
        "Student Name"            VARCHAR(255),
        "Class Trainers"          TEXT,
        "Date"                    TEXT,
        "Coach Feedback"          TEXT,
        "Challenge"               TEXT,
        "Speaking Project"        TEXT,
        "Role 2"                  TEXT,
        "Role 3"                  TEXT,
        "Role 4"                  TEXT,
        "Life Project"            TEXT,
        "House"                   VARCHAR(100),
        "Level"                   VARCHAR(100),
        "Latest Speaking Project" TEXT,
        "Last Time Speaking"      TEXT,
        "Class"                   VARCHAR(100),
        created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_report_progres_trainee_id ON report_progres ("ID");
      CREATE INDEX IF NOT EXISTS idx_report_progres_class ON report_progres ("Class");
    `);

    // Tambah kolom jika belum ada
    const columnsToAdd = [
      `ADD COLUMN IF NOT EXISTS "ID" VARCHAR(255)`,
      `ADD COLUMN IF NOT EXISTS "Student Name" VARCHAR(255)`,
      `ADD COLUMN IF NOT EXISTS "Class Trainers" TEXT`,
      `ADD COLUMN IF NOT EXISTS "Date" TEXT`,
      `ADD COLUMN IF NOT EXISTS "Coach Feedback" TEXT`,
      `ADD COLUMN IF NOT EXISTS "Challenge" TEXT`,
      `ADD COLUMN IF NOT EXISTS "Speaking Project" TEXT`,
      `ADD COLUMN IF NOT EXISTS "Role 2" TEXT`,
      `ADD COLUMN IF NOT EXISTS "Role 3" TEXT`,
      `ADD COLUMN IF NOT EXISTS "Role 4" TEXT`,
      `ADD COLUMN IF NOT EXISTS "Life Project" TEXT`,
      `ADD COLUMN IF NOT EXISTS "House" VARCHAR(100)`,
      `ADD COLUMN IF NOT EXISTS "Level" VARCHAR(100)`,
      `ADD COLUMN IF NOT EXISTS "Latest Speaking Project" TEXT`,
      `ADD COLUMN IF NOT EXISTS "Last Time Speaking" TEXT`,
      `ADD COLUMN IF NOT EXISTS "Class" VARCHAR(100)`
    ];

    await db.query(`ALTER TABLE report_progres ${columnsToAdd.join(', ')};`);

    // Hapus row_id dan kolom usang jika masih ada
    const obsoleteCols = [
      'row_id',
      'Category',
      'Class Name',
      'Speaking Project to Next Level',
      'Last Speaker date',
      'Latest Life Project',
      'Life Project to Next Level',
      'Last Life Project Date',
      'Last Real Stage',
      'Win',
      'Fav',
      'Total Gold'
    ];

    for (const col of obsoleteCols) {
      try {
        await db.query(`ALTER TABLE report_progres DROP COLUMN IF EXISTS "${col}" CASCADE;`);
      } catch (dropErr) {}
    }
  } catch (err) {
    console.error('[Report Progres] Ensure table error:', err.message);
  }
}

// 1. GET / - Ambil semua data Report Progres (search, filter, pagination)
router.get('/', async (req, res) => {
  try {
    await ensureReportProgresTable();

    const { id, search, class_name, class: classFilter, house, level, date, limit, page } = req.query;
    let query = `
      SELECT 
        "ID",
        "Student Name",
        "Class Trainers",
        "Date",
        "Coach Feedback",
        "Challenge",
        "Speaking Project",
        "Role 2",
        "Role 3",
        "Role 4",
        "Life Project",
        "House",
        "Level",
        "Latest Speaking Project",
        "Last Time Speaking",
        "Class",
        created_at,
        updated_at
      FROM report_progres
    `;
    let conditions = [];
    let params = [];

    if (id) {
      params.push(id.trim());
      conditions.push(`"ID" = $${params.length}`);
    }

    if (search) {
      params.push(`%${search.trim()}%`);
      const pIdx = `$${params.length}`;
      conditions.push(`("ID" ILIKE ${pIdx} OR "Student Name" ILIKE ${pIdx} OR "Class" ILIKE ${pIdx} OR "House" ILIKE ${pIdx})`);
    }

    const targetClass = classFilter || class_name;
    if (targetClass) {
      params.push(targetClass.trim());
      conditions.push(`"Class" ILIKE $${params.length}`);
    }

    if (house) {
      params.push(house.trim());
      conditions.push(`"House" ILIKE $${params.length}`);
    }

    if (level) {
      params.push(level.trim());
      conditions.push(`"Level" ILIKE $${params.length}`);
    }

    if (date) {
      params.push(`%${date.trim()}%`);
      conditions.push(`"Date" ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    if (limit) {
      const parsedLimit = parseInt(limit, 10) || 50;
      const parsedPage = parseInt(page, 10) || 1;
      const offset = (parsedPage - 1) * parsedLimit;
      params.push(parsedLimit, offset);
      query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;
    }

    const result = await db.query(query, params);

    res.json({
      success: true,
      message: 'Berhasil mengambil data Report Progres.',
      count: result.rows.length,
      total: result.rows.length,
      data: result.rows.map(formatReportProgresRow)
    });
  } catch (err) {
    console.error('[Report Progres] GET error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /stream - SSE stream for real-time updates
router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  res.write(`data: ${JSON.stringify({ status: 'connected', timestamp: Date.now() })}\n\n`);

  const send = async () => {
    try {
      const result = await db.query('SELECT * FROM report_progres ORDER BY created_at DESC LIMIT 50');
      res.write(`data: ${JSON.stringify(result.rows.map(formatReportProgresRow))}\n\n`);
    } catch (e) {}
  };

  send();
  const interval = setInterval(send, 30000);
  req.on('close', () => clearInterval(interval));
});

// ALL /reset-schema - Reset skema tabel 16 kolom
router.all('/reset-schema', async (req, res) => {
  try {
    await db.query('DROP TABLE IF EXISTS report_progres CASCADE;');
    await ensureReportProgresTable();
    res.json({
      success: true,
      message: 'Tabel report_progres berhasil di-reset dengan 16 kolom resmi (tanpa row_id).'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mereset skema tabel.', error: err.message });
  }
});

// 2. GET /:id - Detail report progres per ID Trainee (mengembalikan histori baris & latest)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await ensureReportProgresTable();
    const result = await db.query(
      'SELECT * FROM report_progres WHERE "ID" = $1 OR "ID" ILIKE $1 ORDER BY created_at DESC',
      [id]
    );

    if (result.rows.length > 0) {
      const formattedRows = result.rows.map(formatReportProgresRow);
      const latest = formattedRows[0];

      return res.json({
        success: true,
        count: formattedRows.length,
        data: latest,
        latest: latest,
        history: formattedRows,
        all: formattedRows,
        ...latest
      });
    }

    return res.status(404).json({
      success: false,
      message: `Data Report Progres tidak ditemukan untuk ID: ${id}`
    });
  } catch (err) {
    console.error('[Report Progres] GET :id error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. POST / - Input single report progres record
router.post('/', async (req, res) => {
  try {
    await ensureReportProgresTable();
    const row = req.body;

    const id = String(row['ID'] ?? row['id'] ?? row['trainee_id'] ?? '').trim();
    const studentName = String(row['Student Name'] ?? row['student_name'] ?? row['Name'] ?? row['name'] ?? row['Nama'] ?? '').trim();
    const classTrainers = String(row['Class Trainers'] ?? row['class_trainers'] ?? row['Trainer Homeroom'] ?? row['trainer_homeroom'] ?? '').trim();
    const date = String(row['Date'] ?? row['date'] ?? row['Tanggal'] ?? '').trim();
    const coachFeedback = String(row['Coach Feedback'] ?? row['coach_feedback'] ?? row['feedback'] ?? '').trim();
    const challenge = String(row['Challenge'] ?? row['challenge'] ?? '').trim();
    const speakingProject = String(row['Speaking Project'] ?? row['speaking_project'] ?? '').trim();
    const role2 = String(row['Role 2'] ?? row['role_2'] ?? row['role2'] ?? '').trim();
    const role3 = String(row['Role 3'] ?? row['role_3'] ?? row['role3'] ?? '').trim();
    const role4 = String(row['Role 4'] ?? row['role_4'] ?? row['role4'] ?? '').trim();
    const lifeProject = String(row['Life Project'] ?? row['life_project'] ?? '').trim();
    const house = String(row['House'] ?? row['house'] ?? '').trim();
    const level = String(row['Level'] ?? row['level'] ?? '').trim();
    const latestSpeaking = String(row['Latest Speaking Project'] ?? row['latest_speaking_project'] ?? '').trim();
    const lastTimeSpeaking = String(row['Last Time Speaking'] ?? row['last_time_speaking'] ?? row['last_speaking_time'] ?? '').trim();
    const className = String(row['Class'] ?? row['class'] ?? row['Class Name'] ?? row['class_name'] ?? '').trim();

    const insertRes = await db.query(`
      INSERT INTO report_progres (
        "ID", "Student Name", "Class Trainers", "Date", "Coach Feedback",
        "Challenge", "Speaking Project", "Role 2", "Role 3", "Role 4",
        "Life Project", "House", "Level", "Latest Speaking Project",
        "Last Time Speaking", "Class", "updated_at"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP)
      RETURNING *;
    `, [
      id, studentName, classTrainers, date, coachFeedback,
      challenge, speakingProject, role2, role3, role4,
      lifeProject, house, level, latestSpeaking,
      lastTimeSpeaking, className
    ]);

    const formatted = formatReportProgresRow(insertRes.rows[0]);

    res.status(201).json({
      success: true,
      message: 'Data Report Progres berhasil disimpan.',
      data: formatted
    });
  } catch (err) {
    console.error('[Report Progres] POST error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. POST /push - Bulk High-Speed Batch Insert dari Google Sheets / n8n (Menyimpan seluruh 16k+ baris tanpa batasan ID)
router.post('/push', async (req, res) => {
  try {
    await ensureReportProgresTable();
    let data = req.body;
    if (!Array.isArray(data)) {
      data = [data];
    }

    if (data.length === 0) {
      return res.status(400).json({ success: false, message: 'Data array kosong.' });
    }

    console.log(`[Report Progres Push] Processing ${data.length} records in high-speed batches...`);

    let insertedCount = 0;
    let skippedCount = 0;
    const BATCH_SIZE = 500;

    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const chunk = data.slice(i, i + BATCH_SIZE);
      const validRows = [];

      for (const row of chunk) {
        if (!row || typeof row !== 'object') {
          skippedCount++;
          continue;
        }

        const id = String(row['ID'] ?? row['id'] ?? row['trainee_id'] ?? '').trim();
        const studentName = String(row['Student Name'] ?? row['student_name'] ?? row['Name'] ?? row['name'] ?? row['Nama'] ?? '').trim();
        const classTrainers = String(row['Class Trainers'] ?? row['class_trainers'] ?? row['Trainer Homeroom'] ?? row['trainer_homeroom'] ?? '').trim();
        const date = String(row['Date'] ?? row['date'] ?? row['Tanggal'] ?? '').trim();
        const coachFeedback = String(row['Coach Feedback'] ?? row['coach_feedback'] ?? row['feedback'] ?? '').trim();
        const challenge = String(row['Challenge'] ?? row['challenge'] ?? '').trim();
        const speakingProject = String(row['Speaking Project'] ?? row['speaking_project'] ?? '').trim();
        const role2 = String(row['Role 2'] ?? row['role_2'] ?? row['role2'] ?? '').trim();
        const role3 = String(row['Role 3'] ?? row['role_3'] ?? row['role3'] ?? '').trim();
        const role4 = String(row['Role 4'] ?? row['role_4'] ?? row['role4'] ?? '').trim();
        const lifeProject = String(row['Life Project'] ?? row['life_project'] ?? '').trim();
        const house = String(row['House'] ?? row['house'] ?? '').trim();
        const level = String(row['Level'] ?? row['level'] ?? '').trim();
        const latestSpeaking = String(row['Latest Speaking Project'] ?? row['latest_speaking_project'] ?? '').trim();
        const lastTimeSpeaking = String(row['Last Time Speaking'] ?? row['last_time_speaking'] ?? row['last_speaking_time'] ?? '').trim();
        const className = String(row['Class'] ?? row['class'] ?? row['Class Name'] ?? row['class_name'] ?? '').trim();

        // Pastikan bukan baris yang benar-benar kosong total
        if (!id && !studentName && !coachFeedback && !date && !className) {
          skippedCount++;
          continue;
        }

        validRows.push([
          id, studentName, classTrainers, date, coachFeedback,
          challenge, speakingProject, role2, role3, role4,
          lifeProject, house, level, latestSpeaking,
          lastTimeSpeaking, className
        ]);
      }

      if (validRows.length === 0) continue;

      // Construct multi-row parameterized query
      const valueClauses = [];
      const flatParams = [];
      let paramIndex = 1;

      for (const rowVals of validRows) {
        const placeholders = [];
        for (const val of rowVals) {
          placeholders.push(`$${paramIndex++}`);
          flatParams.push(val);
        }
        valueClauses.push(`(${placeholders.join(', ')}, CURRENT_TIMESTAMP)`);
      }

      const bulkQuery = `
        INSERT INTO report_progres (
          "ID", "Student Name", "Class Trainers", "Date", "Coach Feedback",
          "Challenge", "Speaking Project", "Role 2", "Role 3", "Role 4",
          "Life Project", "House", "Level", "Latest Speaking Project",
          "Last Time Speaking", "Class", "updated_at"
        )
        VALUES ${valueClauses.join(', ')};
      `;

      await db.query(bulkQuery, flatParams);
      insertedCount += validRows.length;
    }

    res.json({
      success: true,
      message: `Sinkronisasi selesai: ${insertedCount} tersimpan ke database, ${skippedCount} dilewati.`,
      details: { totalReceived: data.length, insertedCount, skippedCount }
    });
  } catch (err) {
    console.error('[Report Progres] POST /push error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. DELETE /truncate - Kosongkan seluruh data tabel
router.delete('/truncate', async (req, res) => {
  try {
    await db.query('TRUNCATE TABLE report_progres;');
    res.json({ success: true, message: 'Seluruh isi tabel report_progres berhasil dikosongkan.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengosongkan tabel.', error: error.message });
  }
});

// 6. DELETE /:id - Hapus data berdasarkan ID Trainee
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM report_progres WHERE "ID" = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Tidak ada data dengan ID: ${id}` });
    }
    res.json({ success: true, message: `Data (${result.rows.length} baris) berhasil dihapus.`, count: result.rows.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus data.', error: error.message });
  }
});

module.exports = router;
