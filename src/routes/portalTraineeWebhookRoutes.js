const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

function parseToValidDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const str = dateStr.trim();
  if (!str || str === '-' || str.toLowerCase() === 'null') return null;

  const monthMap = {
    januari: '01', jan: '01',
    februari: '02', feb: '02',
    maret: '03', mar: '03',
    april: '04', apr: '04',
    mei: '05',
    juni: '06', jun: '06',
    juli: '07', jul: '07',
    agustus: '08', agu: '08', ags: '08',
    september: '09', sep: '09',
    oktober: '10', okt: '10',
    november: '11', nov: '11',
    desember: '12', des: '12'
  };

  const indoMatch = str.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/);
  if (indoMatch) {
    const day = indoMatch[1].padStart(2, '0');
    const monthName = indoMatch[2].toLowerCase();
    const year = indoMatch[3];
    const month = monthMap[monthName];
    if (month) return `${year}-${month}-${day}`;
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  return null;
}

// Robust multi-alias value retriever with case-insensitive and normalized key matching
function getValue(item, aliases) {
  if (!item || typeof item !== 'object') return null;
  
  // 1. Direct exact key match
  for (const alias of aliases) {
    if (item[alias] !== undefined && item[alias] !== null && String(item[alias]).trim() !== '') {
      return item[alias];
    }
  }

  // 2. Normalized key match (ignores spaces, underscores, case)
  const itemKeys = Object.keys(item);
  for (const alias of aliases) {
    const normAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
    const foundKey = itemKeys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === normAlias);
    if (foundKey && item[foundKey] !== undefined && item[foundKey] !== null && String(item[foundKey]).trim() !== '') {
      return item[foundKey];
    }
  }

  return null;
}

// POST /api/webhook/portal-trainee - Receive & Upsert data from n8n
router.post('/', async (req, res) => {
  try {
    const payload = Array.isArray(req.body) ? req.body : [req.body];

    if (!payload || payload.length === 0) {
      return res.status(400).json({ success: false, message: 'Payload data kosong.' });
    }

    let successCount = 0;
    const errors = [];

    for (const item of payload) {
      const trainee_id = getValue(item, ['trainee_id', 'ID', 'id', 'Trainee ID', 'ID Trainee']);

      if (!trainee_id) {
        errors.push({ item, error: 'trainee_id wajib diisi' });
        continue;
      }

      const name = getValue(item, ['name', 'Name', 'full_name', 'Nama', 'Nama Lengkap', 'Nama Trainee']);
      const program = getValue(item, ['program', 'Program']);
      const className = getValue(item, ['class', 'CLASS', 'Class', 'class_name', 'Kelas']);
      const level = getValue(item, ['level', 'Level', 'Tingkat']);
      const membership_expired_date = parseToValidDate(getValue(item, ['membership_expired_date', 'Membership Expired Date', 'Membership Expired', 'Expired Date', 'Tanggal Berakhir Membership']));
      const latest_speaking_project = getValue(item, ['latest_speaking_project', 'Latest Speaking Project', 'Last Speaking Project', 'Speaking Project Terakhir', 'Speaking Project']);
      const weekly_report_url = getValue(item, ['weekly_report_url', 'Weekly Report', 'Weekly Report Link', 'Weekly Report URL', 'Report Link']);
      const referral_code = getValue(item, ['referral_code', 'Referral Code', 'Kode Referral']);
      const progress_video_url = getValue(item, ['progress_video_url', 'Progres Video', 'Progress Video', 'Progress Video URL']);
      const gender = getValue(item, ['gender', 'Gender', 'Jenis Kelamin']);
      const date_of_birth = parseToValidDate(getValue(item, ['date_of_birth', 'Date of Birth', 'DOB', 'Tanggal Lahir']));
      const school_name = getValue(item, ['school_name', 'School Name', 'Nama Sekolah', 'Sekolah']);
      const branch_id = getValue(item, ['branch_id', 'Branch ID', 'Branch', 'Cabang', 'Cabang ID']);
      const first_enroll = parseToValidDate(getValue(item, ['first_enroll', 'First Enroll', 'First Enroll Date', 'Tanggal Bergabung', 'Joined Date']));
      const newest_grade = getValue(item, ['newest_grade', 'Newest Grade', 'Grade', 'Kelas Terbaru']);
      const trainee_homeroom = getValue(item, ['trainee_homeroom', 'Trainee Homeroom', 'Homeroom', 'Wali Kelas']);
      const screening_test_url = getValue(item, ['screening_test_url', 'Screening Test', 'Screening Test Link', 'Screening Test URL']);
      const speaking_project_to_next_level = getValue(item, ['speaking_project_to_next_level', 'Speaking Project to Next Level', 'Target Speaking Project']);
      const last_life_project_date = parseToValidDate(getValue(item, ['last_life_project_date', 'Last Life Project Date', 'Life Project Date', 'Tanggal Last Life Project']));
      const last_life_project = getValue(item, ['last_life_project', 'Last Life Project', 'Project Life Terakhir', 'Life Project']);

      const query = `
        INSERT INTO portal_trainee (
          name, trainee_id, program, class, level,
          membership_expired_date, latest_speaking_project, weekly_report_url,
          referral_code, progress_video_url, gender, date_of_birth,
          school_name, branch_id, first_enroll, newest_grade,
          trainee_homeroom, screening_test_url, speaking_project_to_next_level,
          last_life_project_date, last_life_project, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8,
          $9, $10, $11, $12,
          $13, $14, $15, $16,
          $17, $18, $19,
          $20, $21, CURRENT_TIMESTAMP
        )
        ON CONFLICT (trainee_id) DO UPDATE SET
          name = EXCLUDED.name,
          program = EXCLUDED.program,
          class = EXCLUDED.class,
          level = EXCLUDED.level,
          membership_expired_date = EXCLUDED.membership_expired_date,
          latest_speaking_project = EXCLUDED.latest_speaking_project,
          weekly_report_url = EXCLUDED.weekly_report_url,
          referral_code = EXCLUDED.referral_code,
          progress_video_url = EXCLUDED.progress_video_url,
          gender = EXCLUDED.gender,
          date_of_birth = EXCLUDED.date_of_birth,
          school_name = EXCLUDED.school_name,
          branch_id = EXCLUDED.branch_id,
          first_enroll = EXCLUDED.first_enroll,
          newest_grade = EXCLUDED.newest_grade,
          trainee_homeroom = EXCLUDED.trainee_homeroom,
          screening_test_url = EXCLUDED.screening_test_url,
          speaking_project_to_next_level = EXCLUDED.speaking_project_to_next_level,
          last_life_project_date = EXCLUDED.last_life_project_date,
          last_life_project = EXCLUDED.last_life_project,
          updated_at = CURRENT_TIMESTAMP;
      `;

      const params = [
        name,
        String(trainee_id).trim(),
        program,
        className,
        level,
        membership_expired_date,
        latest_speaking_project,
        weekly_report_url,
        referral_code,
        progress_video_url,
        gender,
        date_of_birth,
        school_name,
        branch_id,
        first_enroll,
        newest_grade,
        trainee_homeroom,
        screening_test_url,
        speaking_project_to_next_level,
        last_life_project_date,
        last_life_project
      ];

      try {
        await db.query(query, params);
        successCount++;
      } catch (err) {
        console.error(`[n8n Webhook Error for ${trainee_id}]:`, err.message);
        errors.push({ trainee_id, error: err.message });
      }
    }

    return res.json({
      success: true,
      message: `Berhasil memproses ${successCount} data portal trainee dari n8n.`,
      processed_count: successCount,
      error_count: errors.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('[n8n Webhook PortalTrainee Error]:', error);
    res.status(500).json({ success: false, message: 'Server error processing n8n webhook', error: error.message });
  }
});

module.exports = router;
