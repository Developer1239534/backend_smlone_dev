require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const res = await pool.query(`SELECT id, trainee_name, phone, tanggal_lahir, profile_picture FROM dashboard_trainne LIMIT 10;`);
  console.log(res.rows);
  pool.end();
}
main();
