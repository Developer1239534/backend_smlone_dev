const db = require('./src/db/neonClient');

async function stripClassSchedules() {
  console.log('🔄 Cleaning class names to remove schedules / numbers (e.g. "Gates (Sat 10-12)" -> "Gates")...');

  const res = await db.query('SELECT trainee_id, class FROM portal_trainee WHERE class IS NOT NULL');
  let cleanCount = 0;

  for (const row of res.rows) {
    let originalClass = row.class;
    let cleanedClass = originalClass.replace(/\s*\(.*?\)/g, '').trim();

    if (cleanedClass !== originalClass) {
      await db.query('UPDATE portal_trainee SET class = $1 WHERE trainee_id = $2', [cleanedClass, row.trainee_id]);
      cleanCount++;
    }
  }

  console.log(`✅ Cleaned class names for ${cleanCount} trainees.`);

  const distinctRes = await db.query('SELECT DISTINCT class FROM portal_trainee ORDER BY class');
  console.log('Cleaned distinct class list:', distinctRes.rows.map(x => x.class));
  process.exit(0);
}

stripClassSchedules().catch(err => {
  console.error('Error stripping class schedules:', err);
  process.exit(1);
});
