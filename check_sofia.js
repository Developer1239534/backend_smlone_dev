require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function checkSofia() {
  const res = await pool.query('SELECT * FROM monthly_gold_point WHERE "Nama Trainee" = \'Sofia Grace Wu\';');
  console.table(res.rows);
  const total = await pool.query('SELECT COUNT(*) FROM monthly_gold_point;');
  console.log('TOTAL_ROWS:', total.rows[0].count);
  await pool.end();
}
checkSofia();
