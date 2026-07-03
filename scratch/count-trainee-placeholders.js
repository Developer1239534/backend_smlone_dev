const db = require('../src/db/neonClient');

async function main() {
  try {
    // 1. Count trainees with name pattern 'Trainee %'
    const traineePatternRes = await db.query("SELECT COUNT(*) AS count FROM dashboard_trainne WHERE trainee_name LIKE 'Trainee %'");
    console.log(`Total trainees with name pattern 'Trainee %': ${traineePatternRes.rows[0].count}`);

    // 2. List some of them and their branches, classes, and statuses
    const sampleRes = await db.query(`
      SELECT id, trainee_name, program, class, level, cabang, status 
      FROM dashboard_trainne 
      WHERE trainee_name LIKE 'Trainee %' 
      ORDER BY CASE WHEN id ~ '^[0-9]+$' THEN id::bigint ELSE 9999999999 END, id
      LIMIT 30
    `);
    console.log('\n=== SAMPLE OF PLACEHOLDER TRAINEES ===');
    console.table(sampleRes.rows);

    // 3. Let's see if there are other identical fields
    // e.g. how many have the same password/plain_password 'smlone20' or 'smlone...'
    const passwordRes = await db.query("SELECT plain_password, COUNT(*) FROM dashboard_trainne WHERE trainee_name LIKE 'Trainee %' GROUP BY plain_password");
    console.log('\n=== PASSWORDS OF PLACEHOLDER TRAINEES ===');
    console.table(passwordRes.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
}

main();
