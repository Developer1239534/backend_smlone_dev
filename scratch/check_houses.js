const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    const q1 = await pool.query("SELECT * FROM houses");
    console.log("HOUSES:", q1.rows);
    
    const q2 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'questions'");
    console.log("QUESTIONS SCHEMA:", q2.rows);

    const q3 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'dashboard_trainne'");
    console.log("TRAINEE SCHEMA:", q3.rows);

    const q4 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'house_rank'");
    console.log("HOUSE RANK SCHEMA:", q4.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
main();
