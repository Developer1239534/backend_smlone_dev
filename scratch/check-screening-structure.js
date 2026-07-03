require('dotenv').config();
const db = require('../src/db/neonClient');

(async () => {
  try {
    const cols = await db.query(
      "SELECT column_name, data_type " +
      "FROM information_schema.columns " +
      "WHERE table_name = 'dashboard_trainne'"
    );
    console.log('=== COLUMNS ===');
    console.log(cols.rows.map(c => c.column_name + ' (' + c.data_type + ')').join(', '));

    const totalCount = await db.query('SELECT count(*) FROM dashboard_trainne');
    const withLink = await db.query("SELECT count(*) FROM dashboard_trainne WHERE screening_test IS NOT NULL");
    const withoutLink = await db.query("SELECT count(*) FROM dashboard_trainne WHERE screening_test IS NULL");

    console.log('\n=== COUNTS ===');
    console.log('Total trainees: ' + totalCount.rows[0].count);
    console.log('With screening_test link: ' + withLink.rows[0].count);
    console.log('Without screening_test link: ' + withoutLink.rows[0].count);

    console.log('\n=== SAMPLE WITH LINK ===');
    const sampleWith = await db.query('SELECT id, trainee_name, screening_test FROM dashboard_trainne WHERE screening_test IS NOT NULL LIMIT 5');
    console.log(sampleWith.rows);

    console.log('\n=== SAMPLE WITHOUT LINK ===');
    const sampleWithout = await db.query('SELECT id, trainee_name, screening_test FROM dashboard_trainne WHERE screening_test IS NULL LIMIT 5');
    console.log(sampleWithout.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
})();
