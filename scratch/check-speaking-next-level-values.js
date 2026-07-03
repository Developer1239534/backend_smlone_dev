const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query("SELECT COUNT(*) AS total, COUNT(speaking_project_to_next_level) AS non_null_count FROM dashboard_trainne");
    console.log('Trainee counts:', res.rows[0]);
    
    const sample = await db.query("SELECT id, trainee_name, speaking_project_to_next_level FROM dashboard_trainne WHERE speaking_project_to_next_level IS NOT NULL LIMIT 10");
    console.log('Sample updated trainees:', sample.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
}

main();
