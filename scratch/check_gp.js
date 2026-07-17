const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    const res = await pool.query(`
      SELECT trainee_id, count(*) 
      FROM gp_month 
      GROUP BY trainee_id 
      HAVING count(*) > 1
    `);
    console.log('Duplicates:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
main();
