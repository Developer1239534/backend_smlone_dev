const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

async function main() {
  console.log('🚀 Seeding ALL 1,165 report_trainee records from seed_report_trainee.json...');

  // 1. Ensure table schema exists
  await db.query(`
    CREATE TABLE IF NOT EXISTS report_trainee (
      id VARCHAR(50) PRIMARY KEY,
      trainee_id VARCHAR(50) NOT NULL,
      report_title TEXT,
      link_yt TEXT,
      report_title_2 TEXT,
      link_term TEXT,
      link_terms JSONB,
      report_title_3 TEXT,
      link_to_report TEXT,
      link_reports_3 JSONB,
      report_title_4 TEXT,
      link_to_report_4 TEXT,
      referral_code TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS report_title_2 TEXT;
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS link_term TEXT;
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS link_terms JSONB;
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS report_title_3 TEXT;
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS link_to_report TEXT;
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS link_reports_3 JSONB;
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS report_title_4 TEXT;
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS link_to_report_4 TEXT;
    ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS referral_code TEXT;
  `);

  console.log('✅ Schema verified.');

  // Helper retry query
  async function queryWithRetry(sql, params, retries = 5) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await db.query(sql, params);
      } catch (err) {
        console.warn(`[Attempt ${attempt}/${retries}] Query failed: ${err.message}. Retrying in 2s...`);
        if (attempt === retries) throw err;
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  // Load JSON data
  const jsonPath = path.join(__dirname, 'seed_report_trainee.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ seed_report_trainee.json file not found!');
    process.exit(1);
  }

  const records = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${records.length} records from seed_report_trainee.json.`);

  // Batch upsert
  const BATCH_SIZE = 25;
  let inserted = 0;

  for (let b = 0; b < records.length; b += BATCH_SIZE) {
    const chunk = records.slice(b, b + BATCH_SIZE);
    const valuePlaceholders = [];
    const params = [];

    chunk.forEach((rec, idx) => {
      const base = idx * 13;
      valuePlaceholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13}, NOW())`);
      params.push(
        rec.id,
        rec.trainee_id || rec.id,
        rec.report_title || '▶️ Progress Video',
        rec.link_yt || '',
        rec.report_title_2 || '',
        rec.link_term || '',
        rec.link_terms ? JSON.stringify(rec.link_terms) : null,
        rec.report_title_3 || '',
        rec.link_to_report || '',
        rec.link_reports_3 ? JSON.stringify(rec.link_reports_3) : null,
        rec.report_title_4 || '',
        rec.link_to_report_4 || '',
        rec.referral_code || ''
      );
    });

    const query = `
      INSERT INTO report_trainee (
        id, trainee_id, report_title, link_yt, report_title_2, link_term, link_terms,
        report_title_3, link_to_report, link_reports_3, report_title_4, link_to_report_4, referral_code, updated_at
      )
      VALUES ${valuePlaceholders.join(', ')}
      ON CONFLICT (id)
      DO UPDATE SET
        trainee_id = EXCLUDED.trainee_id,
        report_title = EXCLUDED.report_title,
        link_yt = EXCLUDED.link_yt,
        report_title_2 = EXCLUDED.report_title_2,
        link_term = EXCLUDED.link_term,
        link_terms = EXCLUDED.link_terms,
        report_title_3 = EXCLUDED.report_title_3,
        link_to_report = EXCLUDED.link_to_report,
        link_reports_3 = EXCLUDED.link_reports_3,
        report_title_4 = EXCLUDED.report_title_4,
        link_to_report_4 = EXCLUDED.link_to_report_4,
        referral_code = EXCLUDED.referral_code,
        updated_at = NOW()
    `;

    await queryWithRetry(query, params);
    inserted += chunk.length;
    console.log(`Inserted/Updated batch ${Math.floor(b / BATCH_SIZE) + 1}/${Math.ceil(records.length / BATCH_SIZE)} (${inserted}/${records.length})`);
  }

  const countRes = await queryWithRetry('SELECT COUNT(*) FROM report_trainee');
  console.log(`🎉 Successfully seeded report_trainee! Total rows in database: ${countRes.rows[0].count}`);

  process.exit(0);
}

main().catch(console.error);
