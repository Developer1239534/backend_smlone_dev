require('dotenv').config({ path: '/root/backend_smlone_dev/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL });

async function run() {
  try {
    const tables = [
      'profile_trainee', 'report_progres', 'credential_portal', 
      'myby_trainee_wallets', 'myby_coin_transactions'
    ];
    for (const t of tables) {
      const countRes = await pool.query(`SELECT COUNT(*) FROM ${t}`);
      console.log(`Table ${t}: ${countRes.rows[0].count} rows`);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

run();
