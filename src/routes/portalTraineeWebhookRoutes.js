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
      const {
        name,
        trainee_id,
        program,
        class: className,
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
      } = item;

      const validTraineeId = trainee_id || item.ID || item.id;

      if (!validTraineeId || String(validTraineeId).trim() === '') {
        errors.push({ item, error: 'trainee_id wajib diisi' });
        continue;
      }

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
        name || item.Name || null,
        String(validTraineeId).trim(),
        program || item.Program || null,
        className || item.class_name || item.CLASS || null,
        level || item.Level || null,
        parseToValidDate(membership_expired_date || item['Membership Expired Date']),
        latest_speaking_project || item['Latest Speaking Project'] || null,
        weekly_report_url || item['Weekly Report'] || null,
        referral_code || item['Referral Code'] || null,
        progress_video_url || item['Progres Video'] || null,
        gender || item.Gender || null,
        parseToValidDate(date_of_birth || item['Date of Birth'] || item['Tanggal Lahir']),
        school_name || item['School Name'] || item['Nama Sekolah'] || null,
        branch_id || item['Branch ID'] || item['Cabang'] || null,
        parseToValidDate(first_enroll || item['First Enroll']),
        newest_grade || item['Newest Grade'] || null,
        trainee_homeroom || item['Trainee Homeroom'] || null,
        screening_test_url || item['Screening Test'] || null,
        speaking_project_to_next_level || item['Speaking Project to Next Level'] || null,
        parseToValidDate(last_life_project_date || item['Last Life Project Date']),
        last_life_project || item['Last Life Project'] || null
      ];

      try {
        await db.query(query, params);
        successCount++;
      } catch (err) {
        console.error(`[n8n Webhook Error for ${validTraineeId}]:`, err.message);
        errors.push({ trainee_id: validTraineeId, error: err.message });
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
