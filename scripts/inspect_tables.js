const db = require('../src/db/neonClient');

async function main() {
  const res1 = await db.query('SELECT * FROM "Report_Trainee" LIMIT 3');
  console.log('--- Quoted "Report_Trainee" Columns & Sample ---');
  console.log(res1.rows);

  const res2 = await db.query('SELECT * FROM report_trainee LIMIT 3');
  console.log('--- Lowercase report_trainee Columns & Sample ---');
  console.log(res2.rows);

  process.exit(0);
}

main().catch(console.error);
