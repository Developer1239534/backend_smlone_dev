const db = require('../src/db/neonClient');

async function checkHash() {
  try {
    const result = await db.query('SELECT id, password, plain_password FROM dashboard_trainne WHERE id = $1', ['90100223']);
    console.log(result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkHash();
