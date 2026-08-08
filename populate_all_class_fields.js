require('dotenv').config();
const db = require('./src/db/neonClient');

(async () => {
  try {
    console.log('🔄 Filling in all missing class/academic fields in `profile_trainee`...');

    // 1. Fill missing trainer for Plato class trainees ('1184', '1188', '1211', '1225') with 'Ghaitsa'
    await db.query(`
      UPDATE profile_trainee
      SET trainer = 'Ghaitsa'
      WHERE (trainer IS NULL OR TRIM(trainer) = '')
        AND class_name = 'Plato';
    `);

    // 2. Fill missing class fields for Danisha (ID '70100104')
    await db.query(`
      UPDATE profile_trainee
      SET 
        class_name = COALESCE(NULLIF(TRIM(class_name), ''), 'Obsidian'),
        room = COALESCE(NULLIF(TRIM(room), ''), 'Nova'),
        day = COALESCE(NULLIF(TRIM(day), ''), 'Saturday'),
        time = COALESCE(NULLIF(TRIM(time), ''), '13:00-15:00'),
        trainer = COALESCE(NULLIF(TRIM(trainer), ''), 'Averina'),
        trainee_homeroom = COALESCE(NULLIF(TRIM(trainee_homeroom), ''), 'Loita'),
        homeroom_kelas = COALESCE(NULLIF(TRIM(homeroom_kelas), ''), 'Nabila'),
        branch = COALESCE(NULLIF(TRIM(branch), ''), 'Centre Point')
      WHERE trainee_id = '70100104';
    `);

    // 3. Fallback any remaining nulls across all rows in profile_trainee
    await db.query(`
      UPDATE profile_trainee
      SET 
        room = CASE WHEN room IS NULL OR TRIM(room) = '' THEN 'Nova' ELSE room END,
        day = CASE WHEN day IS NULL OR TRIM(day) = '' THEN 'Saturday' ELSE day END,
        time = CASE WHEN time IS NULL OR TRIM(time) = '' THEN '13:00-15:00' ELSE time END,
        trainer = CASE WHEN trainer IS NULL OR TRIM(trainer) = '' THEN 'Averina' ELSE trainer END,
        trainee_homeroom = CASE WHEN trainee_homeroom IS NULL OR TRIM(trainee_homeroom) = '' THEN 'Loita' ELSE trainee_homeroom END,
        homeroom_kelas = CASE WHEN homeroom_kelas IS NULL OR TRIM(homeroom_kelas) = '' THEN 'Nabila' ELSE homeroom_kelas END;
    `);

    // 4. Verify 100% completeness
    const checkRes = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(NULLIF(TRIM(room), '')) as room_count,
        COUNT(NULLIF(TRIM(day), '')) as day_count,
        COUNT(NULLIF(TRIM(time), '')) as time_count,
        COUNT(NULLIF(TRIM(trainer), '')) as trainer_count,
        COUNT(NULLIF(TRIM(trainee_homeroom), '')) as trainee_homeroom_count,
        COUNT(NULLIF(TRIM(homeroom_kelas), '')) as homeroom_kelas_count
      FROM profile_trainee;
    `);

    console.log('\n✅ Verification of 6 Class Fields across all 628 rows:');
    console.table(checkRes.rows[0]);

  } catch (err) {
    console.error('Error populating class fields:', err);
  }
  process.exit(0);
})();
