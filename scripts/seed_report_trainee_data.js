/**
 * Seed script for report_trainee_data table (1,236 rows)
 */

const db = require('../src/db/neonClient');
const fs = require('fs');
const path = require('path');

async function seed() {
  console.log('🔄 Creating report_trainee_data database table...');

  await db.query(`
    CREATE TABLE IF NOT EXISTS report_trainee_data (
      id SERIAL PRIMARY KEY,
      trainee_id VARCHAR(100) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      latest_speaking_project VARCHAR(255),
      speaking_project_to_next_level VARCHAR(50),
      last_speaker_date VARCHAR(100),
      last_life_project_date VARCHAR(100),
      last_life_project TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_report_trainee_data_trainee_id ON report_trainee_data(trainee_id);
    CREATE INDEX IF NOT EXISTS idx_report_trainee_data_name ON report_trainee_data(name);
  `);

  const jsonPath = path.join(__dirname, 'seed_report_trainee_data.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`File not found: ${jsonPath}`);
  }

  const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`📊 Loaded ${rows.length} rows from seed_report_trainee_data.json.`);

  console.log('🗑️ Truncating report_trainee_data table...');
  await db.query('TRUNCATE TABLE report_trainee_data RESTART IDENTITY CASCADE;');

  const BATCH_SIZE = 200;
  console.log(`📥 Inserting ${rows.length} rows into report_trainee_data...`);

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const placeholders = [];
    const values = [];
    let idx = 1;

    chunk.forEach(r => {
      placeholders.push(`($${idx}, $${idx+1}, $${idx+2}, $${idx+3}, $${idx+4}, $${idx+5}, $${idx+6})`);
      values.push(
        r.trainee_id,
        r.name,
        r.latest_speaking_project || null,
        r.speaking_project_to_next_level || null,
        r.last_speaker_date || null,
        r.last_life_project_date || null,
        r.last_life_project || null
      );
      idx += 7;
    });

    const query = `
      INSERT INTO report_trainee_data (
        trainee_id, name, latest_speaking_project, speaking_project_to_next_level, last_speaker_date, last_life_project_date, last_life_project
      )
      VALUES ${placeholders.join(',\n')}
      ON CONFLICT (trainee_id) DO UPDATE SET
        name = EXCLUDED.name,
        latest_speaking_project = EXCLUDED.latest_speaking_project,
        speaking_project_to_next_level = EXCLUDED.speaking_project_to_next_level,
        last_speaker_date = EXCLUDED.last_speaker_date,
        last_life_project_date = EXCLUDED.last_life_project_date,
        last_life_project = EXCLUDED.last_life_project,
        updated_at = NOW();
    `;
    await db.query(query, values);
    process.stdout.write(`\r  Inserted ${Math.min(i + BATCH_SIZE, rows.length)} / ${rows.length} rows...`);
  }

  console.log('\n✅ Completed report_trainee_data insertion!');
  const c1 = await db.query('SELECT COUNT(*) FROM report_trainee_data;');
  console.log(`🎉 Verification: report_trainee_data has ${c1.rows[0].count} total rows!`);

  const sample = await db.query('SELECT * FROM report_trainee_data LIMIT 5;');
  console.table(sample.rows);

  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Error during seed:', err);
  process.exit(1);
});
