require('dotenv').config({ path: '/root/backend_smlone_dev/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL });

async function run() {
  try {
    const res = await pool.query(`SELECT "ID", "Name", "School Name", "Date of Birth", "Parent WhatsApp Number", "Trainee WhatsApp Number" FROM profile_trainee`);
    console.log('Total profile_trainee rows:', res.rows.length);
    const filled = res.rows.filter(r => r['School Name'] || r['Date of Birth'] || r['Parent WhatsApp Number'] || r['Trainee WhatsApp Number']);
    console.log('Filled count:', filled.length);
    console.log('Filled rows:', filled);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
