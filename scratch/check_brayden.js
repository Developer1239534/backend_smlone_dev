const db = require('../src/db/neonClient');

async function checkBrayden() {
  try {
    const result = await db.query('SELECT * FROM dashboard_trainne WHERE id = $1', ['741']);
    console.log('Brayden database record:', result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkBrayden();
