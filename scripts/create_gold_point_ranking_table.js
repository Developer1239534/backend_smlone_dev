const db = require('../src/db/neonClient');

async function createTable() {
  console.log('🔄 Creating table gold_point_ranking in Neon PostgreSQL...');
  await db.query(`
    CREATE TABLE IF NOT EXISTS gold_point_ranking (
      id SERIAL PRIMARY KEY,
      period VARCHAR(100),
      trainee_id VARCHAR(255),
      trainee_name VARCHAR(255),
      membership_status VARCHAR(100),
      level VARCHAR(100),
      house VARCHAR(100),
      class_name VARCHAR(255),
      branch VARCHAR(100),
      program VARCHAR(255),
      total_gold INT DEFAULT 0,
      ranking INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_gold_point_ranking_trainee_id ON gold_point_ranking(trainee_id);
    CREATE INDEX IF NOT EXISTS idx_gold_point_ranking_period ON gold_point_ranking(period);
  `);
  console.log('✅ Table gold_point_ranking created successfully with all required columns!');
  process.exit(0);
}

createTable().catch(console.error);
