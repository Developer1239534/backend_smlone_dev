const db = require('../src/db/neonClient');

async function main() {
  try {
    console.log('=== UPDATING GP_MONTH SCHEMA (SET trainee_id AS PRIMARY KEY) ===');

    // 1. Drop the existing gp_month table
    console.log('Dropping existing gp_month table...');
    await db.query('DROP TABLE IF EXISTS gp_month CASCADE');

    // 2. Create the gp_month table with trainee_id as Primary Key (no serial ID column)
    console.log('Creating gp_month table with trainee_id as Primary Key...');
    await db.query(`
      CREATE TABLE gp_month (
        trainee_id VARCHAR(50) PRIMARY KEY REFERENCES dashboard_trainne(id) ON DELETE CASCADE,
        periode VARCHAR(50) NOT NULL,
        total_gold_periode VARCHAR(50),
        rank_id_junior VARCHAR(50),
        rank_id_youth VARCHAR(50),
        rank_id_junior_timor VARCHAR(50),
        rank_id_youth_timor VARCHAR(50),
        rank_id_junior_tritura VARCHAR(50),
        rank_id_youth_tritura VARCHAR(50),
        rank_id_junior_cemara VARCHAR(50),
        rank_id_youth_cemara VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('gp_month table successfully created.');

    console.log('Schema update completed.');

  } catch (err) {
    console.error('Schema update error:', err);
  } finally {
    await db.pool.end();
  }
}

main();
