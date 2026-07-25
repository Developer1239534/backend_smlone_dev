const { Pool } = require('pg');
require('dotenv').config({ path: 'C:/Users/ASUS ROG/.gemini/antigravity/scratch/backend_smlone_dev/.env' });

const connectionString = process.env.DATABASE_URL;

console.log('Connecting to database...');

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function dropTable() {
  const table = 'level_1_ca_cleaned_trainee';
  try {
    console.log(`Dropping table: ${table}...`);
    await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
    console.log(`Table ${table} dropped successfully.`);
  } catch (error) {
    console.error('Error dropping table:', error);
  } finally {
    await pool.end();
    console.log('Database connection closed.');
  }
}

dropTable();
