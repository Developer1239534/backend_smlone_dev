const db = require('./src/db/neonClient');

async function seedSampleFeedback() {
  try {
    console.log('🌱 Inserting sample feedback records into database...');

    await db.query(`
      INSERT INTO feedback (
        id, student_name, house, class_trainers, date,
        coach_feedback, challenge, speaking_project, role_2, role_3, role_4,
        life_project, win, fav, total_gold, level, latest_speaking_project,
        last_time_speaking, class_name
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      )
      ON CONFLICT (id) DO UPDATE SET
        student_name = EXCLUDED.student_name,
        house = EXCLUDED.house,
        class_trainers = EXCLUDED.class_trainers,
        date = EXCLUDED.date,
        coach_feedback = EXCLUDED.coach_feedback,
        challenge = EXCLUDED.challenge,
        speaking_project = EXCLUDED.speaking_project,
        role_2 = EXCLUDED.role_2,
        role_3 = EXCLUDED.role_3,
        role_4 = EXCLUDED.role_4,
        life_project = EXCLUDED.life_project,
        win = EXCLUDED.win,
        fav = EXCLUDED.fav,
        total_gold = EXCLUDED.total_gold,
        level = EXCLUDED.level,
        latest_speaking_project = EXCLUDED.latest_speaking_project,
        last_time_speaking = EXCLUDED.last_time_speaking,
        class_name = EXCLUDED.class_name,
        updated_at = NOW();
    `, [
      '70100104', 'Sofia Grace Wu', 'House of Creanova', 'Coach Alex & Coach Maya', '2026-08-08',
      'Sangat baik dalam penyampaian ide, artikulasi jelas, dan penguasaan panggung luar biasa.',
      'Meningkatkan variasi intonasi suara dan kontak mata audiens.',
      'Elevator Pitch', 'Timer', 'Evaluator', 'Grammarian',
      'Community Empowerment', 'Best Speaker of the Month', 'Yes',
      890, 'Colonel', 'Impromptu Presentation', '2026-08-01', 'Gladwell'
    ]);

    console.log('✅ Sample feedback record for ID 70100104 inserted successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding sample feedback:', err);
    process.exit(1);
  }
}

seedSampleFeedback();
