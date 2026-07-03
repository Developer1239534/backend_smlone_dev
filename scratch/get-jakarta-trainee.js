const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query("SELECT id, trainee_name, status, cabang FROM dashboard_trainne WHERE cabang = 'Jakarta'");
    console.log('Jakarta Trainee:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
}

main();
