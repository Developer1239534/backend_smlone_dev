const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    const res = await pool.query("SELECT trainee_name FROM dashboard_trainne WHERE id = '1128'");
    console.log('Trainee 1128:', res.rows);
    
    const res2 = await pool.query("SELECT * FROM awards WHERE trainee_name = $1", [res.rows[0]?.trainee_name]);
    console.log('Awards by name:', res2.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
