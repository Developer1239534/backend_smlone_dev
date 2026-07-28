const db = require('./src/db/neonClient');

async function run() {
  console.log('Ensuring awards table exists...');
  await db.query(`
    CREATE TABLE IF NOT EXISTS awards (
      id SERIAL PRIMARY KEY,
      trainee_id VARCHAR,
      trainee_name VARCHAR,
      award_type VARCHAR,
      award_name VARCHAR,
      category VARCHAR,
      medal VARCHAR,
      period VARCHAR DEFAULT '2026-06',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log('Ensuring dashboard_trainne table exists...');
  await db.query(`
    CREATE TABLE IF NOT EXISTS dashboard_trainne (
      id SERIAL PRIMARY KEY,
      trainee_id VARCHAR UNIQUE,
      name VARCHAR,
      status VARCHAR,
      level VARCHAR,
      house VARCHAR,
      class VARCHAR,
      branch VARCHAR,
      total_gold INT DEFAULT 0,
      myby_coins INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Populate dashboard_trainne from portal_trainee & goldpoint_trainee if available
  console.log('Syncing portal_trainee data to dashboard_trainne...');
  await db.query(`
    INSERT INTO dashboard_trainne (trainee_id, name, status, level, house, class, branch, total_gold, updated_at)
    SELECT 
      trainee_id, name, status, level, house, class, branch_id, 0, NOW()
    FROM portal_trainee
    ON CONFLICT (trainee_id) DO UPDATE SET
      name = EXCLUDED.name,
      status = EXCLUDED.status,
      level = EXCLUDED.level,
      house = EXCLUDED.house,
      class = EXCLUDED.class,
      branch = EXCLUDED.branch,
      updated_at = NOW();
  `);

  console.log('Database tables successfully verified and synced.');
  process.exit(0);
}

run().catch(err => {
  console.error('Error ensuring tables:', err);
  process.exit(1);
});
