require('dotenv').config();
const db = require('../src/db/neonClient');

(async () => {
  try {
    const totalCount = await db.query('SELECT count(*) FROM dashboard_trainne');
    const withPassword = await db.query("SELECT count(*) FROM dashboard_trainne WHERE password IS NOT NULL");
    const withPlainPassword = await db.query("SELECT count(*) FROM dashboard_trainne WHERE plain_password IS NOT NULL");

    console.log('=== PASSWORD COUNTS ===');
    console.log('Total Trainees: ' + totalCount.rows[0].count);
    console.log('With hashed password: ' + withPassword.rows[0].count);
    console.log('With plain password: ' + withPlainPassword.rows[0].count);

    // Let's check a sample of registered users
    const sample = await db.query("SELECT id, trainee_name, password IS NOT NULL as has_pass, plain_password IS NOT NULL as has_plain FROM dashboard_trainne WHERE password IS NOT NULL LIMIT 10");
    console.log('\n=== SAMPLE REGISTERED TRAINEES ===');
    console.log(sample.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
})();
