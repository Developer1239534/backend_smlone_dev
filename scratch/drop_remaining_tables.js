const { Pool } = require('pg');
require('dotenv').config({ path: 'C:/Users/ASUS ROG/.gemini/antigravity/scratch/backend_smlone_dev/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const tables = [
  'level_1_ca_cleaned_trainee',
  'level_1_ca_registrations',
  'level_1_cp_cleaned_trainee',
  'level_1_cp_registrations',
  'level_1_tr_cleaned_trainee',
  'level_1_tr_registrations',
  'level_2_feedback_students',
  'level_2_report_seluruh_cabang'
];

async function dropTables() {
  try {
    for (const table of tables) {
      console.log(`Dropping table: ${table}...`);
      await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
      console.log(`Table ${table} dropped successfully.`);
    }
  } catch (error) {
    console.error('Error dropping tables:', error);
  } finally {
    await pool.end();
    console.log('Database connection closed.');
  }
}

dropTables();
