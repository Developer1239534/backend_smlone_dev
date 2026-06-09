const db = require('../src/db/neonClient');

async function checkCalysta() {
  try {
    const result = await db.query('SELECT * FROM dashboard_trainne WHERE id = $1', ['70100063']);
    console.log('Calysta database record:', result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkCalysta();
