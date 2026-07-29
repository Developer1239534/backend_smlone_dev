const db = require('./src/db/neonClient');

async function verify() {
  const traineeId = '51';
  const profileRes = await db.query('SELECT real_stage_report_url FROM portal_trainee WHERE trainee_id = $1', [traineeId]);
  console.log(`portal_trainee latest real_stage_report_url for ID ${traineeId}:`, profileRes.rows[0]);

  const rsRes = await db.query('SELECT * FROM real_stage WHERE trainee_id = $1 ORDER BY periode DESC', [traineeId]);
  console.log(`real_stage rows for ID ${traineeId}:`, rsRes.rows);

  process.exit(0);
}

verify();
