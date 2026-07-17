const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    const res = await pool.query(`SELECT * FROM dashboard_trainne WHERE trainee_name IN ('Gyan Lucero Joenardi', 'Lady Valery Sinambela')`);
    console.log("DUPLICATES:", res.rows);
    
    const columns = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'dashboard_trainne'`);
    console.log("COLUMNS:", columns.rows.map(r => r.column_name));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
main();
