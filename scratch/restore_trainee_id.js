const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    await pool.query('ALTER TABLE awards DROP COLUMN IF EXISTS trainee_id');
    await pool.query('ALTER TABLE awards ADD COLUMN trainee_id VARCHAR(255)');
    console.log('Added trainee_id column as VARCHAR(255)');
    
    await pool.query(`
      UPDATE awards a 
      SET trainee_id = t.id 
      FROM dashboard_trainne t 
      WHERE a.trainee_name = t.trainee_name
    `);
    console.log('Populated trainee_id from dashboard_trainne');
    
    await pool.query('ALTER TABLE awards DROP CONSTRAINT IF EXISTS unique_award_name_cat_traineename_period');
    
    await pool.query('ALTER TABLE awards ADD CONSTRAINT unique_award_name_cat_trainee_period UNIQUE (award_name, category, trainee_id, period)');
    console.log('Restored constraints');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
