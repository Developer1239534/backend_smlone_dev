require('dotenv').config({ path: '/root/backend_smlone_dev/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL });

async function run() {
  try {
    const res = await pool.query(`
      SELECT "ID", "Name", "School Name", "Date of Birth", "Parent WhatsApp Number", "Trainee WhatsApp Number", "Parents Email Account" 
      FROM profile_trainee
    `);
    const filled = res.rows.filter(r => 
      (r['School Name'] && r['School Name'].trim() !== '') ||
      (r['Date of Birth'] && r['Date of Birth'].trim() !== '') ||
      (r['Parent WhatsApp Number'] && r['Parent WhatsApp Number'].trim() !== '') ||
      (r['Trainee WhatsApp Number'] && r['Trainee WhatsApp Number'].trim() !== '')
    );
    console.log('All actually filled profiles:', filled);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

run();
