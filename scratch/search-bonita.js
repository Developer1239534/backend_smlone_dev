const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query(`
      SELECT id, trainee_name FROM dashboard_trainne
      WHERE id = '863' OR trainee_name ILIKE '%Bonita%'
    `);
    console.log('Result in dashboard_trainne:', res.rows);

    const res2 = await db.query(`
      SELECT * FROM real_stage
      WHERE trainee_id = '863' OR trainee_id IN (
        SELECT id FROM dashboard_trainne WHERE trainee_name ILIKE '%Bonita%'
      )
      ORDER BY periode
    `);
    console.log('Result in real_stage:', res2.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
