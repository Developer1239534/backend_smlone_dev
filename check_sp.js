const db = require('./src/db/neonClient');

async function checkSp() {
  const count = await db.query(`SELECT COUNT(*) FROM report_activity WHERE speaking_project_to_next_level IS NOT NULL AND speaking_project_to_next_level != '';`);
  const sample = await db.query(`SELECT trainee_id, name, speaking_project_to_next_level, life_project_to_next_level FROM report_activity WHERE speaking_project_to_next_level IS NOT NULL LIMIT 5;`);
  console.log('Count of non-null speaking_project_to_next_level:', count.rows[0].count);
  console.log('Sample:', sample.rows);
  process.exit(0);
}

checkSp();
