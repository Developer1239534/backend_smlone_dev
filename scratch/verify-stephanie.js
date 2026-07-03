require('dotenv').config();
const db = require('../src/db/neonClient');

(async () => {
  try {
    const res = await db.query(
      "SELECT id, trainee_name, screening_test FROM dashboard_trainne WHERE trainee_name ILIKE '%Stephanie Evelyn Luo%'"
    );
    console.log('=== STEPHANIE EVELYN LUO DATABASE RECORD ===');
    console.log(res.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
})();
