const express = require('express');
const router = express.Router();
const db = require('../../db/neonClient');

/**
 * ============================================================
 * ROUTE: Report Progres (/api/report-progres & /api/report-trainee)
 * Kolom (12 Kolom Resmi):
 * ID, Student Name, Category, Class Name, Level,
 * Latest Speaking Project, Speaking Project to Next Level, Last Speaker date,
 * Latest Life Project, Life Project to Next Level, Last Life Project Date, Last Real Stage
 * ============================================================
 */

// Helper to ensure report_progres table exists with exact 12 columns
async function ensureReportProgresTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS report_progres (
        "ID"                              VARCHAR(255) PRIMARY KEY,
        "Student Name"                    VARCHAR(255),
        "Category"                        VARCHAR(100),
        "Class Name"                      VARCHAR(100),
        "Level"                           VARCHAR(100),
        "Latest Speaking Project"         TEXT,
        "Speaking Project to Next Level"  VARCHAR(50),
        "Last Speaker date"               TEXT,
        "Latest Life Project"             TEXT,
        "Life Project to Next Level"      VARCHAR(50),
        "Last Life Project Date"          TEXT,
        "Last Real Stage"                 TEXT,
        created_at                        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at                        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Pastikan semua kolom baru ditambahkan jika tabel sebelumnya sudah ada
    const columnsToAdd = [
      `ADD COLUMN IF NOT EXISTS "Student Name" VARCHAR(255)`,
      `ADD COLUMN IF NOT EXISTS "Category" VARCHAR(100)`,
      `ADD COLUMN IF NOT EXISTS "Class Name" VARCHAR(100)`,
      `ADD COLUMN IF NOT EXISTS "Level" VARCHAR(100)`,
      `ADD COLUMN IF NOT EXISTS "Latest Speaking Project" TEXT`,
      `ADD COLUMN IF NOT EXISTS "Speaking Project to Next Level" VARCHAR(50)`,
      `ADD COLUMN IF NOT EXISTS "Last Speaker date" TEXT`,
      `ADD COLUMN IF NOT EXISTS "Latest Life Project" TEXT`,
      `ADD COLUMN IF NOT EXISTS "Life Project to Next Level" VARCHAR(50)`,
      `ADD COLUMN IF NOT EXISTS "Last Life Project Date" TEXT`,
      `ADD COLUMN IF NOT EXISTS "Last Real Stage" TEXT`
    ];

    await db.query(`ALTER TABLE report_progres ${columnsToAdd.join(', ')};`);
  } catch (err) {
    console.error('[Report Progres] Ensure table error:', err.message);
  }
}

// 1. GET / - Ambil semua data Report Progres (search & filter)
router.get('/', async (req, res) => {
  try {
    await ensureReportProgresTable();

    const { search, category, class_name, level, limit, page } = req.query;
    let query = `
      SELECT 
        "ID",
        "Student Name",
        "Category",
        "Class Name",
        "Level",
        "Latest Speaking Project",
        "Speaking Project to Next Level",
        "Last Speaker date",
        "Latest Life Project",
        "Life Project to Next Level",
        "Last Life Project Date",
        "Last Real Stage"
      FROM report_progres
    `;
    let conditions = [];
    let params = [];

    if (search) {
      params.push(`%${search.trim()}%`);
      const pIdx = `$${params.length}`;
      conditions.push(`("ID" ILIKE ${pIdx} OR "Student Name" ILIKE ${pIdx} OR "Class Name" ILIKE ${pIdx})`);
    }

    if (category) {
      params.push(category.trim());
      conditions.push(`"Category" ILIKE $${params.length}`);
    }

    if (class_name) {
      params.push(class_name.trim());
      conditions.push(`"Class Name" ILIKE $${params.length}`);
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

    res.json({
      success: true,
      message: 'Berhasil mengambil data Report Progres.',
      count: result.rows.length,
      total: result.rows.length,
      data: result.rows
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
      const result = await db.query('SELECT * FROM report_progres ORDER BY "ID" ASC LIMIT 100');
      res.write(`data: ${JSON.stringify(result.rows)}\n\n`);
    } catch (e) {}
  };

  send();
  const interval = setInterval(send, 30000);
  req.on('close', () => clearInterval(interval));
});

// 2. GET /:id - Detail report progres per ID Trainee
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await ensureReportProgresTable();
    const result = await db.query(
      'SELECT * FROM report_progres WHERE "ID" = $1 OR "ID" ILIKE $1 LIMIT 1',
      [id]
    );

    if (result.rows.length > 0) {
      const row = result.rows[0];
      return res.json({
        success: true,
        data: row,
        // Kompatibilitas frontend camelCase & lowercase
        id: row["ID"],
        ID: row["ID"],
        student_name: row["Student Name"],
        "Student Name": row["Student Name"],
        category: row["Category"],
        Category: row["Category"],
        class_name: row["Class Name"],
        "Class Name": row["Class Name"],
        level: row["Level"],
        Level: row["Level"],
        latest_speaking_project: row["Latest Speaking Project"],
        "Latest Speaking Project": row["Latest Speaking Project"],
        speaking_project_to_next_level: row["Speaking Project to Next Level"],
        "Speaking Project to Next Level": row["Speaking Project to Next Level"],
        last_speaker_date: row["Last Speaker date"],
        "Last Speaker date": row["Last Speaker date"],
        latest_life_project: row["Latest Life Project"],
        "Latest Life Project": row["Latest Life Project"],
        life_project_to_next_level: row["Life Project to Next Level"],
        "Life Project to Next Level": row["Life Project to Next Level"],
        last_life_project_date: row["Last Life Project Date"],
        "Last Life Project Date": row["Last Life Project Date"],
        last_real_stage: row["Last Real Stage"],
        "Last Real Stage": row["Last Real Stage"]
      });
    }

    return res.status(404).json({
      success: false,
      message: `Data Report Progres tidak ditemukan di database untuk ID: ${id}`
    });
  } catch (err) {
    console.error('[Report Progres] GET :id error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. POST / - Input / Upsert single report progres (12 kolom)
router.post('/', async (req, res) => {
  try {
    await ensureReportProgresTable();
    const row = req.body;

    const id = String(row['ID'] ?? row['id'] ?? row['trainee_id'] ?? '').trim();
    if (!id) {
      return res.status(400).json({ success: false, message: 'Kolom "ID" wajib diisi.' });
    }

    const studentName = String(row['Student Name'] ?? row['student_name'] ?? row['Name'] ?? row['name'] ?? '').trim();
    const category = String(row['Category'] ?? row['category'] ?? '').trim();
    const className = String(row['Class Name'] ?? row['class_name'] ?? row['Class'] ?? row['class'] ?? '').trim();
    const level = String(row['Level'] ?? row['level'] ?? '').trim();
    const latestSpeaking = String(row['Latest Speaking Project'] ?? row['latest_speaking_project'] ?? '').trim();
    const speakingToNext = String(row['Speaking Project to Next Level'] ?? row['speaking_project_to_next_level'] ?? '').trim();
    const lastSpeakerDate = String(row['Last Speaker date'] ?? row['last_speaker_date'] ?? '').trim();
    const latestLife = String(row['Latest Life Project'] ?? row['latest_life_project'] ?? '').trim();
    const lifeToNext = String(row['Life Project to Next Level'] ?? row['life_project_to_next_level'] ?? '').trim();
    const lastLifeDate = String(row['Last Life Project Date'] ?? row['last_life_project_date'] ?? '').trim();
    const lastRealStage = String(row['Last Real Stage'] ?? row['last_real_stage'] ?? '').trim();

    const insertRes = await db.query(`
      INSERT INTO report_progres (
        "ID", "Student Name", "Category", "Class Name", "Level",
        "Latest Speaking Project", "Speaking Project to Next Level", "Last Speaker date",
        "Latest Life Project", "Life Project to Next Level", "Last Life Project Date",
        "Last Real Stage", "updated_at"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
      ON CONFLICT ("ID") DO UPDATE SET
        "Student Name"                    = EXCLUDED."Student Name",
        "Category"                        = EXCLUDED."Category",
        "Class Name"                      = EXCLUDED."Class Name",
        "Level"                           = EXCLUDED."Level",
        "Latest Speaking Project"         = EXCLUDED."Latest Speaking Project",
        "Speaking Project to Next Level"  = EXCLUDED."Speaking Project to Next Level",
        "Last Speaker date"               = EXCLUDED."Last Speaker date",
        "Latest Life Project"             = EXCLUDED."Latest Life Project",
        "Life Project to Next Level"      = EXCLUDED."Life Project to Next Level",
        "Last Life Project Date"          = EXCLUDED."Last Life Project Date",
        "Last Real Stage"                 = EXCLUDED."Last Real Stage",
        "updated_at"                      = CURRENT_TIMESTAMP
      RETURNING *;
    `, [
      id, studentName, category, className, level,
      latestSpeaking, speakingToNext, lastSpeakerDate,
      latestLife, lifeToNext, lastLifeDate, lastRealStage
    ]);

    res.status(201).json({
      success: true,
      message: 'Data Report Progres berhasil disimpan/diperbarui.',
      data: insertRes.rows[0]
    });
  } catch (err) {
    console.error('[Report Progres] POST error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. POST /push - Bulk Upsert dari Google Sheets / n8n (12 kolom)
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

      const id = String(row['ID'] ?? row['id'] ?? row['trainee_id'] ?? '').trim();
      if (!id) {
        skippedCount++;
        continue;
      }

      const studentName = String(row['Student Name'] ?? row['student_name'] ?? row['Name'] ?? row['name'] ?? '').trim();
      const category = String(row['Category'] ?? row['category'] ?? '').trim();
      const className = String(row['Class Name'] ?? row['class_name'] ?? row['Class'] ?? row['class'] ?? '').trim();
      const level = String(row['Level'] ?? row['level'] ?? '').trim();
      const latestSpeaking = String(row['Latest Speaking Project'] ?? row['latest_speaking_project'] ?? '').trim();
      const speakingToNext = String(row['Speaking Project to Next Level'] ?? row['speaking_project_to_next_level'] ?? '').trim();
      const lastSpeakerDate = String(row['Last Speaker date'] ?? row['last_speaker_date'] ?? '').trim();
      const latestLife = String(row['Latest Life Project'] ?? row['latest_life_project'] ?? '').trim();
      const lifeToNext = String(row['Life Project to Next Level'] ?? row['life_project_to_next_level'] ?? '').trim();
      const lastLifeDate = String(row['Last Life Project Date'] ?? row['last_life_project_date'] ?? '').trim();
      const lastRealStage = String(row['Last Real Stage'] ?? row['last_real_stage'] ?? '').trim();

      try {
        await db.query(`
          INSERT INTO report_progres (
            "ID", "Student Name", "Category", "Class Name", "Level",
            "Latest Speaking Project", "Speaking Project to Next Level", "Last Speaker date",
            "Latest Life Project", "Life Project to Next Level", "Last Life Project Date",
            "Last Real Stage", "updated_at"
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
          ON CONFLICT ("ID") DO UPDATE SET
            "Student Name"                    = EXCLUDED."Student Name",
            "Category"                        = EXCLUDED."Category",
            "Class Name"                      = EXCLUDED."Class Name",
            "Level"                           = EXCLUDED."Level",
            "Latest Speaking Project"         = EXCLUDED."Latest Speaking Project",
            "Speaking Project to Next Level"  = EXCLUDED."Speaking Project to Next Level",
            "Last Speaker date"               = EXCLUDED."Last Speaker date",
            "Latest Life Project"             = EXCLUDED."Latest Life Project",
            "Life Project to Next Level"      = EXCLUDED."Life Project to Next Level",
            "Last Life Project Date"          = EXCLUDED."Last Life Project Date",
            "Last Real Stage"                 = EXCLUDED."Last Real Stage",
            "updated_at"                      = CURRENT_TIMESTAMP;
        `, [
          id, studentName, category, className, level,
          latestSpeaking, speakingToNext, lastSpeakerDate,
          latestLife, lifeToNext, lastLifeDate, lastRealStage
        ]);
        insertedCount++;
      } catch (rowErr) {
        errorCount++;
        errors.push({ index: i, id, error: rowErr.message });
      }
    }

    res.json({
      success: true,
      message: `Sinkronisasi selesai: ${insertedCount} tersimpan/diperbarui, ${skippedCount} dilewati, ${errorCount} gagal.`,
      details: { insertedCount, skippedCount, errorCount, errors: errors.slice(0, 10) }
    });
  } catch (err) {
    console.error('[Report Progres] POST /push error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. PUT /:id - Update parsial data Report Progres
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await ensureReportProgresTable();
    const checkRes = await db.query('SELECT * FROM report_progres WHERE "ID" = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Data dengan ID: "${id}" tidak ditemukan.` });
    }

    const existing = checkRes.rows[0];
    const b = req.body;

    const updatedName = b["Student Name"] ?? b["student_name"] ?? existing["Student Name"];
    const updatedCategory = b["Category"] ?? b["category"] ?? existing["Category"];
    const updatedClass = b["Class Name"] ?? b["class_name"] ?? existing["Class Name"];
    const updatedLevel = b["Level"] ?? b["level"] ?? existing["Level"];
    const updatedLatestSpeaking = b["Latest Speaking Project"] ?? b["latest_speaking_project"] ?? existing["Latest Speaking Project"];
    const updatedSpeakingToNext = b["Speaking Project to Next Level"] ?? b["speaking_project_to_next_level"] ?? existing["Speaking Project to Next Level"];
    const updatedLastSpeaker = b["Last Speaker date"] ?? b["last_speaker_date"] ?? existing["Last Speaker date"];
    const updatedLatestLife = b["Latest Life Project"] ?? b["latest_life_project"] ?? existing["Latest Life Project"];
    const updatedLifeToNext = b["Life Project to Next Level"] ?? b["life_project_to_next_level"] ?? existing["Life Project to Next Level"];
    const updatedLastLife = b["Last Life Project Date"] ?? b["last_life_project_date"] ?? existing["Last Life Project Date"];
    const updatedLastRealStage = b["Last Real Stage"] ?? b["last_real_stage"] ?? existing["Last Real Stage"];

    const updateRes = await db.query(`
      UPDATE report_progres
      SET "Student Name"                    = $2,
          "Category"                        = $3,
          "Class Name"                      = $4,
          "Level"                           = $5,
          "Latest Speaking Project"         = $6,
          "Speaking Project to Next Level"  = $7,
          "Last Speaker date"               = $8,
          "Latest Life Project"             = $9,
          "Life Project to Next Level"      = $10,
          "Last Life Project Date"          = $11,
          "Last Real Stage"                 = $12,
          "updated_at"                      = CURRENT_TIMESTAMP
      WHERE "ID" = $1
      RETURNING *;
    `, [
      id, updatedName, updatedCategory, updatedClass, updatedLevel,
      updatedLatestSpeaking, updatedSpeakingToNext, updatedLastSpeaker,
      updatedLatestLife, updatedLifeToNext, updatedLastLife, updatedLastRealStage
    ]);

    res.json({
      success: true,
      message: `Data ID: ${id} berhasil diperbarui.`,
      data: updateRes.rows[0]
    });
  } catch (err) {
    console.error('[Report Progres] PUT :id error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. DELETE /truncate - Kosongkan tabel
router.delete('/truncate', async (req, res) => {
  try {
    await db.query('TRUNCATE TABLE report_progres');
    res.json({ success: true, message: 'Seluruh isi tabel report_progres berhasil dikosongkan.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengosongkan tabel.', error: error.message });
  }
});

// 7. DELETE /:id - Hapus data berdasarkan ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM report_progres WHERE "ID" = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Tidak ada data dengan ID: ${id}` });
    }
    res.json({ success: true, message: `Data Report Progres ID ${id} berhasil dihapus.`, deleted: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus data.', error: error.message });
  }
});

module.exports = router;
