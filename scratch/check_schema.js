const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    const cols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'gp_month'
    `);
    console.log(cols.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
main();
