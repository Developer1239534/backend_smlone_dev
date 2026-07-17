const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    const q = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'quiz_history'");
    console.log(q.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
main();
