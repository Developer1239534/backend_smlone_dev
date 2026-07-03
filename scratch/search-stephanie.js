require('dotenv').config();
const db = require('../src/db/neonClient');

(async () => {
  try {
    const res = await db.query(
      "SELECT id, trainee_name, password IS NOT NULL as has_pass, plain_password FROM dashboard_trainne WHERE trainee_name ILIKE '%Stephanie Evelyn Luo%'"
    );
    console.log('=== SEARCH RESULT FOR STEPHANIE EVELYN LUO ===');
    console.log(res.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
})();
