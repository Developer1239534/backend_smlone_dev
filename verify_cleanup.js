const db = require('./src/db/neonClient');

async function verify() {
  const traineeId = '48';
  const ptRes = await db.query('SELECT name, class, level, house, program, membership_expired_date FROM portal_trainee WHERE trainee_id = $1', [traineeId]);
  console.log('portal_trainee for ID 48:', ptRes.rows[0]);

  const dtRes = await db.query('SELECT trainee_name, class, level, house_sml, program, membership_expiry, status FROM dashboard_trainne WHERE id = $1', [traineeId]);
  console.log('dashboard_trainne for ID 48:', dtRes.rows[0]);

  process.exit(0);
}

verify();
