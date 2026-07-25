const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

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

      if (!trainee_id) {
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
        name || null,
        trainee_id,
        program || null,
        className || item.class_name || null,
        level || null,
        membership_expired_date || null,
        latest_speaking_project || null,
        weekly_report_url || null,
        referral_code || null,
        progress_video_url || null,
        gender || null,
        date_of_birth || null,
        school_name || null,
        branch_id || null,
        first_enroll || null,
        newest_grade || null,
        trainee_homeroom || null,
        screening_test_url || null,
        speaking_project_to_next_level || null,
        last_life_project_date || null,
        last_life_project || null
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
