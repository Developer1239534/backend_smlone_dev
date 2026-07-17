const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    const res = await pool.query(`
      SELECT COUNT(*) as total_users,
             SUM(CASE WHEN plain_password = 'SML' || id THEN 1 ELSE 0 END) as correct_pass,
             SUM(CASE WHEN plain_password != 'SML' || id OR plain_password IS NULL THEN 1 ELSE 0 END) as wrong_pass
      FROM dashboard_trainne
    `);
    
    console.log("Password Status:");
    console.log(res.rows[0]);
    
    const sample = await pool.query(`
      SELECT id, trainee_name, plain_password 
      FROM dashboard_trainne 
      WHERE plain_password != 'SML' || id OR plain_password IS NULL
      LIMIT 10
    `);
    console.log("\nSample of incorrect passwords:");
    console.log(sample.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
main();
