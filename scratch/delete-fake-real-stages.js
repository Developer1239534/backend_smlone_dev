const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query(`
      DELETE FROM real_stage
      WHERE url LIKE '%test%' OR periode = 'Real Stage 50'
      RETURNING *
    `);
    console.log('Deleted rows:', res.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
