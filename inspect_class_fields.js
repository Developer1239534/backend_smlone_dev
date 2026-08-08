require('dotenv').config();
const db = require('./src/db/neonClient');

(async () => {
  try {
    const res = await db.query(`
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

    console.log('📊 Current non-empty counts in `profile_trainee`:');
    console.table(res.rows[0]);

    const sampleMissing = await db.query(`
      SELECT trainee_id, name, room, day, time, trainer, trainee_homeroom, homeroom_kelas, raw_data
      FROM profile_trainee
      WHERE room IS NULL OR room = ''
         OR day IS NULL OR day = ''
         OR time IS NULL OR time = ''
         OR trainer IS NULL OR trainer = ''
         OR trainee_homeroom IS NULL OR trainee_homeroom = ''
         OR homeroom_kelas IS NULL OR homeroom_kelas = ''
      LIMIT 5;
    `);

    console.log('\n🔍 Sample rows with missing fields:');
    console.log(JSON.stringify(sampleMissing.rows, null, 2));

  } catch (err) {
    console.error('Inspection error:', err);
  }
  process.exit(0);
})();
