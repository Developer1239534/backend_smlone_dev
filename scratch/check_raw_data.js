require('dotenv').config();
const db = require('../src/db/neonClient');

async function check() {
  try {
    const res = await db.query('SELECT * FROM level_1_ca_registrations ORDER BY created_at DESC LIMIT 1;');
    console.log(res.rows[0]);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
check();
