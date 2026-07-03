const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query("SELECT id, trainee_name, speaking_project_to_next_level FROM dashboard_trainne WHERE id IN ('966', '922', '968', '1171') OR trainee_name ILIKE '%Cenata%' OR trainee_name ILIKE '%Sinambela%'");
    console.log('Results:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
}

main();
