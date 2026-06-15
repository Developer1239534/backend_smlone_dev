require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    // 1. Get total count
    const totalRes = await pool.query("SELECT COUNT(*) FROM dashboard_trainne");
    
    // 2. Get registered count (password is not null)
    const registeredRes = await pool.query("SELECT COUNT(*) FROM dashboard_trainne WHERE password IS NOT NULL");
    
    // 3. Get list of some registered users
    const listRes = await pool.query(
      "SELECT id, trainee_name, status, plain_password, gender, cabang FROM dashboard_trainne WHERE password IS NOT NULL ORDER BY id LIMIT 50"
    );
    
    console.log(`Total Trainees in DB: ${totalRes.rows[0].count}`);
    console.log(`Registered Trainees: ${registeredRes.rows[0].count}`);
    console.log('\nSample Registered Trainees list:');
    console.table(listRes.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}
run();
