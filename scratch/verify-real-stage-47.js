const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query(`
      SELECT r.trainee_id, t.trainee_name, r.periode, r.url 
      FROM real_stage r
      JOIN dashboard_trainne t ON r.trainee_id = t.id
      WHERE r.periode = 'Real Stage 47'
      ORDER BY t.trainee_name ASC
    `);

    console.log(`=== REAL STAGE 47 DATABASE STATUS ===`);
    console.log(`Total rows in DB: ${res.rows.length}`);
    console.log(res.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
