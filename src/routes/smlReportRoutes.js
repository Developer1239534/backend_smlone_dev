const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// Define schema mapping helper
const schemaFields = {
  student_id: ['ID', 'student_id', 'studentId'],
  name: ['Name', 'name', 'full_name', 'fullName'],
  branch: ['BRANCH', 'Branch', 'branch'],
  membership_expiry_date: ['Membership Expiry Date', 'membership_expiry_date', 'membershipExpiryDate'],
  active_expired: ['Active/ Expired', 'Active / Expired', 'active_expired', 'activeExpired'],
  cleaned_program: ['Cleaned Program', 'cleaned_program', 'cleanedProgram'],
  cleaned_class: ['Cleaned Class', 'cleaned_class', 'cleanedClass'],
  house: ['House', 'house'],
  students_report_link: ['Students Report Link', 'students_report_link', 'studentsReportLink'],
  id_vs_student_report_link: ['ID vs Student Report Link', 'id_vs_student_report_link', 'idVsStudentReportLink'],
  total_gold: ['Total Gold', 'total_gold', 'totalGold'],
  level: ['Level', 'level'],
  latest_speaking_project: ['Latest Speaking Project', 'latest_speaking_project', 'latestSpeakingProject'],
  speaking_project_to_next_level: ['Speaking Project to Next Level', 'speaking_project_to_next_level', 'speakingProjectToNextLevel'],
  discipline: ['Discipline', 'discipline'],
  family_life: ['Family Life', 'family_life', 'familyLife'],
  school_life: ['School Life', 'school_life', 'schoolLife'],
  basic_manner: ['Basic Manner', 'basic_manner', 'basicManner'],
  survival_skill: ['Survival Skill', 'survival_skill', 'survivalSkill'],
  appreciation: ['Appreciation', 'appreciation'],
  free_project: ['Free Project', 'free_project', 'freeProject'],
  life_project_to_next_level: ['Life Project to Next Level', 'life_project_to_next_level', 'lifeProjectToNextLevel'],
  basic_level: ['Level1', 'Level_1', 'level_1', 'level1', 'Level_alt', 'basic_level'],
  level_6_link: ['Level 6 Link', 'level_6_link', 'level6Link'],
  last_speaker_date: ['Last Speaker date', 'last_speaker_date', 'lastSpeakerDate'],
  last_life_project_date: ['Last Life Project date', 'last_life_project_date', 'lastLifeProjectDate'],
  last_life_project: ['Last Life Project', 'last_life_project', 'lastLifeProject'],
  last_attendance: ['Last Attendance', 'last_attendance', 'lastAttendance']
};

// Generate dynamic speaking projects
for (let lvl = 1; lvl <= 6; lvl++) {
  const maxProj = lvl === 1 ? 8 : 10;
  for (let p = 1; p <= maxProj; p++) {
    const colName = `l${lvl}_s_project_${p}`;
    schemaFields[colName] = [
      `L${lvl}. S.Project ${p}`,
      `l${lvl}. s.project ${p}`,
      `l${lvl}_s_project_${p}`,
      `L${lvl} S Project ${p}`
    ];
  }
}

// Generate dynamic basic projects
for (let p = 1; p <= 10; p++) {
  const colName = `s_project_${p}`;
  schemaFields[colName] = [
    `S.Project ${p}`,
    `s.project ${p}`,
    `s_project_${p}`,
    `S Project ${p}`
  ];
}

// Generate dynamic monthly columns (Set A & Set B)
const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
months.forEach((m) => {
  const monthCapitalized = m.charAt(0).toUpperCase() + m.slice(1);
  const colA = `${m}25_a`;
  const colB = `${m}25_b`;
  
  schemaFields[colA] = [
    `${monthCapitalized}25`,
    `${m}25`,
    `${m}25_a`
  ];
  
  schemaFields[colB] = [
    `${monthCapitalized}25_1`,
    `${monthCapitalized}251`,
    `${m}25_1`,
    `${m}251`,
    `${m}25_b`
  ];
});

// GET endpoint: Ambil semua data sml_report
router.get('/', async (req, res) => {
  try {
    const savedData = await db.query('SELECT * FROM sml_report ORDER BY created_at DESC');
    res.json({
      success: true,
      message: 'Berhasil mengambil data sml_report.',
      data: savedData.rows
    });
  } catch (error) {
    console.error('Error fetching sml_report:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dari database.',
      error: error.message
    });
  }
});

// GET endpoint: Ambil satu data berdasarkan student_id atau ID database
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM sml_report WHERE id = $1 OR student_id = $2', [
      isNaN(id) ? -1 : parseInt(id),
      id
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching single sml_report:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data.',
      error: error.message
    });
  }
});

// POST endpoint: Simpan/Push data dari N8N (UPSERT)
router.post('/push', async (req, res) => {
  try {
    let data = req.body;
    if (!Array.isArray(data)) {
      data = [data];
    }

    if (data.length === 0) {
      return res.status(400).json({ success: false, message: 'Data kosong.' });
    }

    let insertedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const errors = [];

    console.log(`[Push SML Report] Menerima ${data.length} data`);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || typeof row !== 'object') {
        skippedCount++;
        continue;
      }

      // Hapus row number info
      delete row['row_number'];
      delete row['row number'];
      delete row['Row Number'];

      // Map spreadsheet row keys to DB fields
      const mappedRow = {};
      for (const [field, keys] of Object.entries(schemaFields)) {
        let value = '';
        for (const k of keys) {
          if (row[k] !== undefined && row[k] !== null) {
            value = String(row[k]).trim();
            break;
          }
        }
        mappedRow[field] = value;
      }

      // Skip jika student_id kosong
      if (!mappedRow.student_id) {
        skippedCount++;
        continue;
      }

      const fields = Object.keys(mappedRow);
      const values = Object.values(mappedRow);
      
      const columnsCsv = fields.join(', ');
      const placeholdersCsv = fields.map((_, idx) => `$${idx + 1}`).join(', ');
      
      const updateSetCsv = fields
        .filter(f => f !== 'student_id')
        .map((f, idx) => `${f} = EXCLUDED.${f}`)
        .join(', ');

      const raw_data = JSON.stringify(row);

      try {
        const upsertQuery = `
          INSERT INTO sml_report (${columnsCsv}, raw_data)
          VALUES (${placeholdersCsv}, $${fields.length + 1})
          ON CONFLICT (student_id)
          DO UPDATE SET ${updateSetCsv}, raw_data = EXCLUDED.raw_data
        `;

        await db.query(upsertQuery, [...values, raw_data]);
        insertedCount++;
      } catch (rowError) {
        errorCount++;
        errors.push({ index: i, id: mappedRow.student_id, error: rowError.message });
        console.error(`[Push SML Report] Error pada student ID ${mappedRow.student_id}:`, rowError.message);
      }
    }

    console.log(`[Push SML Report] Selesai: sukses=${insertedCount}, dilewati=${skippedCount}, error=${errorCount}`);

    res.json({
      success: true,
      message: `Berhasil memproses ${insertedCount} data sml_report, ${skippedCount} di-skip, ${errorCount} error.`,
      details: { insertedCount, skippedCount, errorCount, errors }
    });

  } catch (error) {
    console.error('[Push SML Report] Fatal error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal memproses data.',
      error: error.message
    });
  }
});

// DELETE endpoint: Hapus semua data (Truncate)
router.delete('/clear', async (req, res) => {
  try {
    await db.query('TRUNCATE TABLE sml_report RESTART IDENTITY;');
    res.json({
      success: true,
      message: 'Semua data di dalam tabel sml_report berhasil dihapus bersih.'
    });
  } catch (error) {
    console.error('Error clearing sml_report:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data dari database.',
      error: error.message
    });
  }
});

module.exports = router;
