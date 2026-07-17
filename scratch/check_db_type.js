const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    const res = await pool.query(`SELECT data_type FROM information_schema.columns WHERE table_name = 'dashboard_trainne' AND column_name = 'id'`);
    console.log('Type of dashboard_trainne.id:', res.rows[0].data_type);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
