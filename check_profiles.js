require('dotenv').config({ path: '/root/backend_smlone_dev/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL });

async function run() {
  try {
    const res = await pool.query(`
      SELECT "ID", "Name", "School Name", "Date of Birth", "Parent WhatsApp Number", "Trainee WhatsApp Number", "Parents Email Account" 
      FROM profile_trainee 
      WHERE ("School Name" IS NOT NULL AND "School Name" != '') 
         OR ("Date of Birth" IS NOT NULL AND "Date of Birth" != '')
         OR ("Parent WhatsApp Number" IS NOT NULL AND "Parent WhatsApp Number" != '')
         OR ("Trainee WhatsApp Number" IS NOT NULL AND "Trainee WhatsApp Number" != '')
    `);
    console.log('Profiles with filled data:', JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

run();
