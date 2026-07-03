require('dotenv').config();
const db = require('../src/db/neonClient');

(async () => {
  try {
    const res1 = await db.query("SELECT id, trainee_name FROM dashboard_trainne WHERE trainee_name ILIKE '%Valery%' OR trainee_name ILIKE '%Sinambela%'");
    console.log('=== SEARCH FOR VALERY/SINAMBELA ===');
    console.log(res1.rows);

    const res2 = await db.query("SELECT id, trainee_name FROM dashboard_trainne WHERE trainee_name ILIKE '%Angelina%' OR trainee_name ILIKE '%Cenata%'");
    console.log('\n=== SEARCH FOR ANGELINA/CENATA ===');
    console.log(res2.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
})();
