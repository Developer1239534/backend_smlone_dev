/**
 * Seed Script for gold_poin_setahun Table
 * Parses raw_gold_poin_setahun.txt (8,887 rows)
 * Creates gold_poin_setahun and gold_point_setahun tables
 * Bulk inserts all rows with batching
 */

const db = require('../src/db/neonClient');
const fs = require('fs');
const path = require('path');

const PERIOD_START = '1 Jan 2026';
const PERIOD_END = '31 Dec 2026';

async function seed() {
  console.log('🔄 Creating gold_poin_setahun database tables...');

  await db.query(`
    CREATE TABLE IF NOT EXISTS gold_poin_setahun (
      id SERIAL PRIMARY KEY,
      period_start VARCHAR(100) DEFAULT '${PERIOD_START}',
      period_end VARCHAR(100) DEFAULT '${PERIOD_END}',
      trainee_id VARCHAR(100) NOT NULL,
      student_name VARCHAR(255),
      date_string VARCHAR(100) NOT NULL,
      total_gold INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_gold_poin_setahun_trainee_id ON gold_poin_setahun(trainee_id);
    CREATE INDEX IF NOT EXISTS idx_gold_poin_setahun_date_string ON gold_poin_setahun(date_string);

    CREATE TABLE IF NOT EXISTS gold_point_setahun (
      id SERIAL PRIMARY KEY,
      period_start VARCHAR(100) DEFAULT '${PERIOD_START}',
      period_end VARCHAR(100) DEFAULT '${PERIOD_END}',
      trainee_id VARCHAR(100) NOT NULL,
      student_name VARCHAR(255),
      date_string VARCHAR(100) NOT NULL,
      total_gold INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('📖 Fetching Trainee Name map from Database...');
  const nameRes = await db.query(`
    SELECT trainee_id, name FROM profile_trainee 
    UNION 
    SELECT id as trainee_id, name FROM login_portal_fix;
  `);

  const nameMap = {};
  nameRes.rows.forEach(r => {
    if (r.trainee_id && r.name) {
      nameMap[r.trainee_id.trim()] = r.name.trim();
    }
  });

  console.log(`✅ Loaded ${Object.keys(nameMap).length} trainee name mappings.`);

  // Read raw text
  const rawPath = path.join(__dirname, '..', 'raw_gold_poin_setahun.txt');
  if (!fs.existsSync(rawPath)) {
    throw new Error(`File not found: ${rawPath}`);
  }

  const fileContent = fs.readFileSync(rawPath, 'utf8');
  const lines = fileContent.split(/\r?\n/);

  const rows = [];
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('<') || trimmed.startsWith('Period') || trimmed.startsWith('1\t2') || trimmed.startsWith('Student Name')) {
      return;
    }
    const parts = trimmed.split('\t').map(p => p.trim());
    if (parts.length >= 2) {
      const traineeId = parts[0];
      const dateStr = parts[1];
      const goldStr = parts[2] || '';
      let totalGold = 0;
      if (goldStr !== '') {
        const parsed = parseInt(goldStr, 10);
        if (!isNaN(parsed)) totalGold = parsed;
      }
      const studentName = nameMap[traineeId] || traineeId;

      rows.push({
        period_start: PERIOD_START,
        period_end: PERIOD_END,
        trainee_id: traineeId,
        student_name: studentName,
        date_string: dateStr,
        total_gold: totalGold,
      });
    }
  });

  console.log(`📊 Parsed ${rows.length} valid rows from text.`);

  console.log('🗑️  Truncating gold_poin_setahun and gold_point_setahun tables...');
  await db.query('TRUNCATE TABLE gold_poin_setahun RESTART IDENTITY CASCADE;');
  await db.query('TRUNCATE TABLE gold_point_setahun RESTART IDENTITY CASCADE;');

  // Batch insert into gold_poin_setahun
  const BATCH_SIZE = 500;
  console.log(`📥 Inserting ${rows.length} rows into gold_poin_setahun...`);

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const placeholders = [];
    const values = [];
    let idx = 1;

    chunk.forEach(r => {
      placeholders.push(`($${idx}, $${idx+1}, $${idx+2}, $${idx+3}, $${idx+4}, $${idx+5})`);
      values.push(r.period_start, r.period_end, r.trainee_id, r.student_name, r.date_string, r.total_gold);
      idx += 6;
    });

    const query = `
      INSERT INTO gold_poin_setahun (period_start, period_end, trainee_id, student_name, date_string, total_gold)
      VALUES ${placeholders.join(',\n')};
    `;
    await db.query(query, values);
    process.stdout.write(`\r  Inserted ${Math.min(i + BATCH_SIZE, rows.length)} / ${rows.length} rows...`);
  }
  console.log('\n✅ Completed gold_poin_setahun insertion!');

  // Duplicate to gold_point_setahun for safety
  console.log(`📥 Inserting ${rows.length} rows into gold_point_setahun (alias table)...`);
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const placeholders = [];
    const values = [];
    let idx = 1;

    chunk.forEach(r => {
      placeholders.push(`($${idx}, $${idx+1}, $${idx+2}, $${idx+3}, $${idx+4}, $${idx+5})`);
      values.push(r.period_start, r.period_end, r.trainee_id, r.student_name, r.date_string, r.total_gold);
      idx += 6;
    });

    const query = `
      INSERT INTO gold_point_setahun (period_start, period_end, trainee_id, student_name, date_string, total_gold)
      VALUES ${placeholders.join(',\n')};
    `;
    await db.query(query, values);
  }
  console.log('✅ Completed gold_point_setahun insertion!');

  // Verify counts
  const c1 = await db.query('SELECT COUNT(*) FROM gold_poin_setahun;');
  console.log(`\n🎉 Verification: gold_poin_setahun has ${c1.rows[0].count} total rows!`);

  // Sample view
  const sample = await db.query('SELECT * FROM gold_poin_setahun LIMIT 5;');
  console.table(sample.rows);

  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Error during seed:', err);
  process.exit(1);
});
