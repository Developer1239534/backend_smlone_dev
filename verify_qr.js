const db = require('./src/db/neonClient');

async function verify() {
  const traineeId = '50';
  const profileRes = await db.query('SELECT name, quarterly_report_url FROM portal_trainee WHERE trainee_id = $1', [traineeId]);
  console.log(`portal_trainee latest quarterly_report_url for ID ${traineeId}:`, profileRes.rows[0]);

  const qrRes = await db.query('SELECT * FROM quarterly_report WHERE trainee_id = $1 ORDER BY periode DESC', [traineeId]);
  console.log(`quarterly_report rows for ID ${traineeId}:`, qrRes.rows);

  process.exit(0);
}

verify();
