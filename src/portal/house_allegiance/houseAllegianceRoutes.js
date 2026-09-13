const express = require('express');
const router = express.Router();
const db = require('../../db/neonClient');

/**
 * ============================================================
 * ROUTE: House Allegiance (/api/house-allegiance & /api/quiz & /api/houses)
 * Kolom (3 Kolom Resmi):
 * id, question, options
 * ============================================================
 */



const HOUSE_MAPPING = {
  A: { id: 'A', name: 'Thenova', core_value: 'Seek the Truth', description: 'Thenova berani melangkah melampaui batas yang diketahui. Selalu terbuka dalam mencari kebenaran dan kebijaksanaan baru.' },
  B: { id: 'B', name: 'Havaria', core_value: 'Strong Care', description: 'Havaria dibangun di atas pondasi kepedulian dan ketulusan. Hadir untuk menguatkan sesama dan menjadi detak jantung kebersamaan.' },
  C: { id: 'C', name: 'Reverion', core_value: 'Honor and Trust', description: 'Reverion memegang teguh kehormatan, integritas, dan rasa hormat. Menghargai orang-orang di sekitarnya serta mempraktikkan disiplin tinggi.' },
  D: { id: 'D', name: 'Quorion', core_value: 'Excellence in Action', description: 'Quorion mengejar kesempurnaan dan presisi. Memilih mutu di atas kecepatan dalam setiap karya yang dihasilkan.' },
  E: { id: 'E', name: 'Creanova', core_value: 'Create Boldly', description: 'Creanova bermimpi lebih lantang dan merancang karya orisinal yang berani. Memiliki keberanian membangun apa yang hanya dibayangkan orang lain.' }
};

// Helper to ensure questions & houses tables exist with exact columns (id, question, options)
async function ensureHouseAllegianceTables() {
  try {
    // Cek jika tabel questions masih menggunakan struktur lama (ada option_a)
    const checkLegacy = await db.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'questions' AND column_name = 'option_a'
    `);

    if (checkLegacy.rows.length > 0) {
      await db.query('DROP TABLE IF EXISTS questions CASCADE;');
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS questions (
        "id"       VARCHAR(50) PRIMARY KEY,
        "question" TEXT NOT NULL,
        "options"  TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS houses (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        core_value VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS quiz_history (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) UNIQUE,
        assigned_house VARCHAR(100),
        score_a INT DEFAULT 0,
        score_b INT DEFAULT 0,
        score_c INT DEFAULT 0,
        score_d INT DEFAULT 0,
        score_e INT DEFAULT 0,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

  } catch (err) {
    console.error('[House Allegiance] Ensure tables error:', err.message);
  }
}

// 1. GET / - Ambil semua pertanyaan quiz / house allegiance
router.get('/', async (req, res) => {
  try {
    await ensureHouseAllegianceTables();
    const result = await db.query('SELECT "id", "question", "options" FROM questions ORDER BY "id"::int ASC');
    
    const formatted = result.rows.map(row => {
      let parsedOptions = row.options;
      if (typeof row.options === 'string') {
        try { parsedOptions = JSON.parse(row.options); } catch {}
      }
      return {
        id: row.id,
        question: row.question,
        options: parsedOptions
      };
    });

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    console.error('[House Allegiance] GET error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /questions - Endpoint kompatibilitas frontend (/api/quiz/questions & /api/house-allegiance/questions)
router.get('/questions', async (req, res) => {
  try {
    await ensureHouseAllegianceTables();
    const result = await db.query('SELECT "id", "question", "options" FROM questions ORDER BY "id"::int ASC');
    
    const formatted = result.rows.map(row => {
      let parsedOptions = row.options;
      if (typeof row.options === 'string') {
        try { parsedOptions = JSON.parse(row.options); } catch {}
      }
      return {
        id: row.id,
        question: row.question,
        options: parsedOptions
      };
    });

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('[House Allegiance] Questions error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// GET /houses - Ambil daftar semua House
router.get('/houses', async (req, res) => {
  try {
    await ensureHouseAllegianceTables();
    const result = await db.query('SELECT * FROM houses ORDER BY id ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 2. POST /submit - Kirim jawaban kuis dan tentukan House murid
router.post('/submit', async (req, res) => {
  try {
    await ensureHouseAllegianceTables();
    const { studentId, answers } = req.body;

    if (!studentId || !answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: 'studentId dan jawaban (answers) wajib diisi.' });
    }

    // Hitung dominasi jawaban
    const scores = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    answers.forEach(item => {
      const opt = String(item.selectedOption || item.option || item.answer || '').toUpperCase();
      if (scores[opt] !== undefined) {
        scores[opt]++;
      }
    });

    let maxHouse = 'A';
    let maxScore = -1;
    for (const [houseOpt, sc] of Object.entries(scores)) {
      if (sc > maxScore) {
        maxScore = sc;
        maxHouse = houseOpt;
      }
    }

    const assigned = HOUSE_MAPPING[maxHouse] || HOUSE_MAPPING.A;

    // Simpan ke riwayat kuis
    await db.query(`
      INSERT INTO quiz_history (student_id, assigned_house, score_a, score_b, score_c, score_d, score_e, submitted_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      ON CONFLICT (student_id) DO UPDATE SET
        assigned_house = EXCLUDED.assigned_house,
        score_a = EXCLUDED.score_a,
        score_b = EXCLUDED.score_b,
        score_c = EXCLUDED.score_c,
        score_d = EXCLUDED.score_d,
        score_e = EXCLUDED.score_e,
        submitted_at = CURRENT_TIMESTAMP;
    `, [studentId, assigned.name, scores.A, scores.B, scores.C, scores.D, scores.E]).catch(() => null);

    // Update house pada profile_trainee jika ada
    await db.query(`
      UPDATE profile_trainee
      SET "HOUSE" = $2, "updated_at" = CURRENT_TIMESTAMP
      WHERE "ID" = $1
    `, [studentId, assigned.name]).catch(() => null);

    return res.json({
      success: true,
      message: `Selamat! Anda terpilih masuk ke dalam House of ${assigned.name}!`,
      result: {
        assignedHouse: assigned
      }
    });
  } catch (err) {
    console.error('[House Allegiance] Submit error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. POST /push - Bulk import soal dari Google Sheets / n8n (kolom: id, question, options)
router.post('/push', async (req, res) => {
  try {
    await ensureHouseAllegianceTables();
    let data = req.body;
    if (!Array.isArray(data)) {
      data = [data];
    }

    let inserted = 0;
    for (const row of data) {
      const id = String(row.id || row.ID || '').trim();
      const question = String(row.question || row.Question || row.question_text || '').trim();
      let options = row.options || row.Options || '';

      if (!id || !question) continue;

      if (!options && (row.A || row.option_a || row['Option A'])) {
        options = JSON.stringify({
          A: row.A || row.option_a || row['Option A'] || '',
          B: row.B || row.option_b || row['Option B'] || '',
          C: row.C || row.option_c || row['Option C'] || '',
          D: row.D || row.option_d || row['Option D'] || '',
          E: row.E || row.option_e || row['Option E'] || '',
        });
      } else if (typeof options === 'object') {
        options = JSON.stringify(options);
      }

      await db.query(`
        INSERT INTO questions ("id", "question", "options", "updated_at")
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT ("id") DO UPDATE SET
          "question" = EXCLUDED."question",
          "options" = EXCLUDED."options",
          "updated_at" = CURRENT_TIMESTAMP;
      `, [id, question, options]);
      inserted++;
    }

    res.json({ success: true, message: `Berhasil sinkronisasi ${inserted} pertanyaan.`, count: inserted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. PUT /:id - Update pertanyaan
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { question, options } = req.body;

  try {
    await ensureHouseAllegianceTables();
    let optStr = options;
    if (typeof options === 'object') optStr = JSON.stringify(options);

    const result = await db.query(`
      UPDATE questions
      SET "question" = COALESCE($2, "question"),
          "options" = COALESCE($3, "options"),
          "updated_at" = CURRENT_TIMESTAMP
      WHERE "id" = $1
      RETURNING *;
    `, [id, question, optStr]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pertanyaan tidak ditemukan.' });
    }

    res.json({ success: true, message: 'Pertanyaan berhasil diperbarui.', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. DELETE /:id - Hapus pertanyaan
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM questions WHERE "id" = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pertanyaan tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Pertanyaan berhasil dihapus.', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
