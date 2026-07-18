const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function dropTable() {
  try {
    console.log('Dropping table level_1_cp_cleaned_trainee...');
    await pool.query('DROP TABLE IF EXISTS level_1_cp_cleaned_trainee CASCADE;');
    console.log('Table level_1_cp_cleaned_trainee has been successfully DROPPED!');
  } catch (e) {
    console.error('Error dropping table:', e);
  } finally {
    await pool.end();
    process.exit();
  }
}

dropTable();
