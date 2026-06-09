const db = require('../src/db/neonClient');

async function checkGracella() {
  try {
    const res78 = await db.query('SELECT * FROM dashboard_trainne WHERE id = $1', ['90100078']);
    console.log('ID 90100078:', res78.rows[0]);

    const res79 = await db.query('SELECT * FROM dashboard_trainne WHERE id = $1', ['90100079']);
    console.log('ID 90100079:', res79.rows[0]);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkGracella();
