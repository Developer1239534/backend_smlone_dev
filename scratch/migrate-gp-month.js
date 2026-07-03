const db = require('../src/db/neonClient');

async function main() {
  try {
    console.log('=== STARTING GP_MONTH DATABASE MIGRATION ===');

    // 1. Create the gp_month table
    console.log('Creating gp_month table if not exists...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS gp_month (
        id SERIAL PRIMARY KEY,
        trainee_id VARCHAR(50) NOT NULL REFERENCES dashboard_trainne(id) ON DELETE CASCADE,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(trainee_id, periode)
      )
    `);
    console.log('gp_month table ready.');

    // 2. Migrate existing data from dashboard_trainne to gp_month (using '6/30/2026' as default period)
    console.log('Migrating existing gold points and ranks data to gp_month...');
    const migrateRes = await db.query(`
      INSERT INTO gp_month (
        trainee_id, periode, total_gold_periode,
        rank_id_junior, rank_id_youth,
        rank_id_junior_timor, rank_id_youth_timor,
        rank_id_junior_tritura, rank_id_youth_tritura,
        rank_id_junior_cemara, rank_id_youth_cemara
      )
      SELECT 
        id AS trainee_id, 
        '6/30/2026' AS periode, 
        total_gold_periode,
        rank_id_junior, rank_id_youth,
        rank_id_junior_timor, rank_id_youth_timor,
        rank_id_junior_tritura, rank_id_youth_tritura,
        rank_id_junior_cemara, rank_id_youth_cemara
      FROM dashboard_trainne
      WHERE total_gold_periode IS NOT NULL 
         OR rank_id_junior IS NOT NULL 
         OR rank_id_youth IS NOT NULL
         OR rank_id_junior_timor IS NOT NULL
         OR rank_id_youth_timor IS NOT NULL
         OR rank_id_junior_tritura IS NOT NULL
         OR rank_id_youth_tritura IS NOT NULL
         OR rank_id_junior_cemara IS NOT NULL
         OR rank_id_youth_cemara IS NOT NULL
      ON CONFLICT (trainee_id, periode) DO UPDATE SET
        total_gold_periode = EXCLUDED.total_gold_periode,
        rank_id_junior = EXCLUDED.rank_id_junior,
        rank_id_youth = EXCLUDED.rank_id_youth,
        rank_id_junior_timor = EXCLUDED.rank_id_junior_timor,
        rank_id_youth_timor = EXCLUDED.rank_id_youth_timor,
        rank_id_junior_tritura = EXCLUDED.rank_id_junior_tritura,
        rank_id_youth_tritura = EXCLUDED.rank_id_youth_tritura,
        rank_id_junior_cemara = EXCLUDED.rank_id_junior_cemara,
        rank_id_youth_cemara = EXCLUDED.rank_id_youth_cemara
    `);
    console.log(`Migrated ${migrateRes.rowCount} rows to gp_month.`);

    // 3. Clear data in dashboard_trainne columns
    console.log('Clearing gold points and rankings from dashboard_trainne columns...');
    const clearRes = await db.query(`
      UPDATE dashboard_trainne SET
        total_gold_periode = NULL,
        rank_id_junior = NULL,
        rank_id_youth = NULL,
        rank_id_junior_timor = NULL,
        rank_id_youth_timor = NULL,
        rank_id_junior_tritura = NULL,
        rank_id_youth_tritura = NULL,
        rank_id_junior_cemara = NULL,
        rank_id_youth_cemara = NULL
    `);
    console.log(`Cleared columns for ${clearRes.rowCount} trainees in dashboard_trainne.`);

    console.log('\n=== MIGRATION COMPLETED SUCCESSFULY ===');

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await db.pool.end();
  }
}

main();
