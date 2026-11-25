require('dotenv').config({ path: '/root/backend_smlone_dev/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL });

async function run() {
  try {
    const res = await pool.query(`
      SELECT * FROM report_progres ORDER BY ctid DESC LIMIT 10
    `);
    console.log('Recent report_progres:', JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

run();
