const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query(`
      SELECT id, trainee_name, program, status 
      FROM dashboard_trainne 
      WHERE id !~ '^[0-9]+$'
    `);
    console.log('Non-numeric IDs in DB:', res.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
