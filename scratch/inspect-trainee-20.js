const db = require('../src/db/neonClient');

async function main() {
  try {
    const traineeRes = await db.query("SELECT * FROM dashboard_trainne WHERE id = '20'");
    console.log('=== Trainee 20 ===');
    console.log(traineeRes.rows);

    const reportRes = await db.query("SELECT * FROM quarterly_report WHERE trainee_id = '20'");
    console.log('\n=== Quarterly Reports for Trainee 20 ===');
    console.log(reportRes.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
}

main();
