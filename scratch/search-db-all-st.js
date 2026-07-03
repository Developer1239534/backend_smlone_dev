const db = require('../src/db/neonClient');

async function main() {
  try {
    const res1 = await db.query("SELECT * FROM quarterly_report WHERE url LIKE '%STIg%'");
    console.log('quarterly_report:', res1.rows);

    const res2 = await db.query("SELECT id, trainee_name, weekly_report FROM dashboard_trainne WHERE weekly_report LIKE '%STIg%'");
    console.log('dashboard_trainne (weekly_report):', res2.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
