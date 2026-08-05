const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

async function repopulate() {
  console.log('🔄 Repopulating gold_point_rankings table from seed...');
  const jsonPath = path.join(__dirname, 'seed_gold_point_rankings.json');

  if (!fs.existsSync(jsonPath)) {
    console.error('❌ seed_gold_point_rankings.json not found!');
    process.exit(1);
  }

  const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  await db.query(`
    CREATE TABLE IF NOT EXISTS gold_point_rankings (
      id SERIAL PRIMARY KEY,
      period VARCHAR(100) NOT NULL,
      category VARCHAR(100) NOT NULL,
      program VARCHAR(100) NOT NULL,
      trainee_id VARCHAR(255) NOT NULL,
      trainee_name VARCHAR(255),
      membership_status VARCHAR(100),
      level VARCHAR(100),
      house VARCHAR(100),
      class_name VARCHAR(255),
      branch VARCHAR(100),
      total_gold INT DEFAULT 0,
      ranking INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_period_category_program_trainee'
      ) THEN
        ALTER TABLE gold_point_rankings 
        ADD CONSTRAINT unique_period_category_program_trainee UNIQUE (period, category, program, trainee_id);
      END IF;
    END $$;
  `);

  const valueRows = [];
  const queryParams = [];
  let paramIdx = 1;

  for (const r of rows) {
    valueRows.push(`(
      $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++},
      $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++},
      $${paramIdx++}, $${paramIdx++}, NOW(), NOW()
    )`);

    queryParams.push(
      r.period, r.category, r.program, r.trainee_id, r.trainee_name,
      r.membership_status, r.level, r.house, r.class_name, r.branch,
      r.total_gold, r.ranking
    );
  }

  if (valueRows.length > 0) {
    const bulkSql = `
      INSERT INTO gold_point_rankings (
        period, category, program, trainee_id, trainee_name,
        membership_status, level, house, class_name, branch,
        total_gold, ranking, created_at, updated_at
      )
      VALUES ${valueRows.join(',\n')}
      ON CONFLICT (period, category, program, trainee_id)
      DO UPDATE SET
        trainee_name = EXCLUDED.trainee_name,
        membership_status = EXCLUDED.membership_status,
        level = EXCLUDED.level,
        house = EXCLUDED.house,
        class_name = EXCLUDED.class_name,
        branch = EXCLUDED.branch,
        total_gold = EXCLUDED.total_gold,
        ranking = EXCLUDED.ranking,
        updated_at = NOW();
    `;

    await db.query(bulkSql, queryParams);
    console.log(`✅ Successfully repopulated ${rows.length} rows into gold_point_rankings!`);
  }
}

repopulate().catch(console.error);
