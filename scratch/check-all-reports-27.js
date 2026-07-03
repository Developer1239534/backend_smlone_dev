const db = require('../src/db/neonClient');

async function checkAllReports() {
  try {
    const res1 = await db.query("SELECT * FROM real_stage WHERE trainee_id = '27'");
    console.log('real_stage reports:', res1.rows);

    const res2 = await db.query("SELECT * FROM quarterly_report WHERE trainee_id = '27'");
    console.log('quarterly reports:', res2.rows);

    const res3 = await db.query("SELECT id, trainee_name, weekly_report FROM dashboard_trainne WHERE id = '27'");
    console.log('trainee profile info:', res3.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAllReports();
