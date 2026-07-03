const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query("SELECT id, trainee_name, weekly_report, progress_video, plain_password FROM dashboard_trainne WHERE trainee_name LIKE 'Trainee %' AND id != '20' LIMIT 10");
    console.log('=== Samples of other Trainee placeholder records ===');
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
}

main();
