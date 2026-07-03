const { pool } = require('../src/db/neonClient');

async function main() {
  try {
    console.log('⚡ Optimizing database indexes for 10k+ records performance...');

    // Indexes on dashboard_trainne
    console.log('Creating index on trainee_name (ILIKE search)...');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_trainee_name ON dashboard_trainne(trainee_name)');

    console.log('Creating index on cabang (filter)...');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_trainee_cabang ON dashboard_trainne(cabang)');

    console.log('Creating index on class (filter)...');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_trainee_class ON dashboard_trainne(class)');

    console.log('Creating index on junior_youth (filter)...');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_trainee_junior_youth ON dashboard_trainne(junior_youth)');

    // Indexes on gp_tahunan
    console.log('Creating index on gp_tahunan(trainee_id, date) (composite filter)...');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_gp_tahunan_trainee_date ON gp_tahunan(trainee_id, date)');

    console.log('✅ Database performance optimization complete!');

  } catch (err) {
    console.error('❌ Error optimizing database indexes:', err.message);
  } finally {
    await pool.end();
  }
}

main();
