const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

function parseToValidDate(val) {
  if (!val) return null;
  const str = String(val).trim();
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

// Case-insensitive & whitespace-trimmed key lookup helper
function getValue(item, keys) {
  if (!item || typeof item !== 'object') return null;
  const normalizedMap = {};
  for (const k of Object.keys(item)) {
    normalizedMap[k.trim().toLowerCase()] = item[k];
  }
  for (const key of keys) {
    const targetKey = key.trim().toLowerCase();
    const val = normalizedMap[targetKey];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return val;
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
      const validTraineeId = getValue(item, ['trainee_id', 'id', 'trainee id', 'student_id']);

      if (!validTraineeId) {
        errors.push({ item, error: 'trainee_id / ID wajib diisi' });
        continue;
      }

      const name = getValue(item, ['name', 'nama']);
      const program = getValue(item, ['program']);
      const className = getValue(item, ['class', 'class_name', 'class name']);
      const level = getValue(item, ['level']);
      const membership_expired_date = parseToValidDate(getValue(item, ['membership_expired_date', 'membership expired date', 'membership_expiry']));
      const latest_speaking_project = getValue(item, ['latest_speaking_project', 'latest speaking project']);
      const weekly_report_url = getValue(item, ['weekly_report_url', 'weekly report']);
      const referral_code = getValue(item, ['referral_code', 'referral code']);
      const progress_video_url = getValue(item, ['progress_video_url', 'progres video', 'progress video']);
      const gender = getValue(item, ['gender', 'jenis kelamin']);
      const date_of_birth = parseToValidDate(getValue(item, ['date_of_birth', 'date of birth', 'tanggal lahir', 'dob']));
      const school_name = getValue(item, ['school_name', 'nama sekolah', 'school name', 'school']);
      const branch_id = getValue(item, ['branch_id', 'cabang id', 'branch id', 'branch', 'cabang']);
      const first_enroll = parseToValidDate(getValue(item, ['first_enroll', 'first enroll', 'joined_since']));
      const newest_grade = getValue(item, ['newest_grade', 'newest grade', 'grade']);
      const trainee_homeroom = getValue(item, ['trainee_homeroom', 'trainee homeroom', 'homeroom']);
      const screening_test_url = getValue(item, ['screening_test_url', 'screening test']);
      const speaking_project_to_next_level = getValue(item, ['speaking_project_to_next_level', 'speaking project to next level']);
      const last_life_project_date = parseToValidDate(getValue(item, ['last_life_project_date', 'last life project date']));
      const last_life_project = getValue(item, ['last_life_project', 'last life project']);

      const query = `
        INSERT INTO profile_trainee (
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
        String(validTraineeId).trim(),
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
        
        // Auto-provision default login account (SML + trainee_id)
        const cleanId = String(validTraineeId).trim();
        const defaultPassword = `SML${cleanId}`;
        const bcrypt = require('bcryptjs');
        const hash = await bcrypt.hash(defaultPassword, 10);
        await db.query(`
          INSERT INTO login_trainee (student_id, password, plain_password)
          VALUES ($1, $2, $3)
          ON CONFLICT (student_id) DO NOTHING
        `, [cleanId, hash, defaultPassword]).catch(() => {});

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
