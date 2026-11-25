require('dotenv').config({ path: '/root/backend_smlone_dev/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL });

async function run() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'profile_trainee'
    `);
    console.log('Columns of profile_trainee:', res.rows.map(r => r.column_name));
    
    // Let's check pm2 logs or backend logs for recent profile updates
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

run();
