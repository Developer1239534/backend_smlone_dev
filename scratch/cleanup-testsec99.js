const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query(`
      DELETE FROM dashboard_trainne
      WHERE id = 'testsec99'
      RETURNING *
    `);
    console.log('Deleted testsec99 trainee:', res.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
