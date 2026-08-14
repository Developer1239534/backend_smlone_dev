const fs = require('fs');
const db = require('./src/db/neonClient');

async function main() {
  console.log('🚀 Starting import of Quarterly Report, Real Stage Report, & Screening Test into portal_trainee...');

  // 1. Add new columns if not exist
  await db.query(`
    ALTER TABLE portal_trainee 
    ADD COLUMN IF NOT EXISTS quarterly_report_url TEXT,
    ADD COLUMN IF NOT EXISTS real_stage_report_url TEXT;
  `);

  console.log('✅ Columns verified in portal_trainee table.');

  // 2. Read raw prompt text
  const text = fs.readFileSync('C:/Users/ASUS ROG/.gemini/antigravity/scratch/user_prompt.txt', 'utf8');
  const lines = text.split('\n');

  let qUpdated = 0, qInserted = 0;
  let rUpdated = 0, rInserted = 0;
  let sUpdated = 0, sInserted = 0;

  for (let line of lines) {
    line = line.replace('\r', '');
    if (!line || line.startsWith('<') || line.includes('QUARTERLY REPORT') || line.includes('Screening Test')) continue;

    const cols = line.split('\t').map(c => c.trim());

    // Quarterly Report (cols[0] = ID, cols[1] = Link)
    if (cols[0] && cols[0] !== 'ID' && cols[1] && cols[1].startsWith('http')) {
      const id = cols[0];
      const qLink = cols[1];

      const res = await db.query(`
        INSERT INTO portal_trainee (trainee_id, quarterly_report_url, updated_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (trainee_id) DO UPDATE
        SET quarterly_report_url = EXCLUDED.quarterly_report_url,
            updated_at = CURRENT_TIMESTAMP
        RETURNING (xmax = 0) AS is_insert;
      `, [id, qLink]);

      if (res.rows[0].is_insert) qInserted++;
      else qUpdated++;
    }

    // Real Stage Report (cols[2] = ID, cols[3] = Link)
    if (cols[2] && cols[2] !== 'ID' && cols[3] && cols[3].startsWith('http')) {
      const id = cols[2];
      const rLink = cols[3];

      const res = await db.query(`
        INSERT INTO portal_trainee (trainee_id, real_stage_report_url, updated_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (trainee_id) DO UPDATE
        SET real_stage_report_url = EXCLUDED.real_stage_report_url,
            updated_at = CURRENT_TIMESTAMP
        RETURNING (xmax = 0) AS is_insert;
      `, [id, rLink]);

      if (res.rows[0].is_insert) rInserted++;
      else rUpdated++;
    }

    // Screening Test (cols[2] = ID, cols[4] = Link)
    if (cols[2] && cols[2] !== 'ID' && cols[4] && cols[4].startsWith('http')) {
      const id = cols[2];
      const sLink = cols[4];

      const res = await db.query(`
        INSERT INTO portal_trainee (trainee_id, screening_test_url, updated_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (trainee_id) DO UPDATE
        SET screening_test_url = EXCLUDED.screening_test_url,
            updated_at = CURRENT_TIMESTAMP
        RETURNING (xmax = 0) AS is_insert;
      `, [id, sLink]);

      if (res.rows[0].is_insert) sInserted++;
      else sUpdated++;
    }
  }

  console.log('\n📊 Import Results:');
  console.log(`- Quarterly Reports: ${qUpdated} updated, ${qInserted} inserted`);
  console.log(`- Real Stage Reports: ${rUpdated} updated, ${rInserted} inserted`);
  console.log(`- Screening Tests: ${sUpdated} updated, ${sInserted} inserted`);

  // Verification Count
  const stats = await db.query(`
    SELECT 
      COUNT(quarterly_report_url) as total_quarterly,
      COUNT(real_stage_report_url) as total_real_stage,
      COUNT(screening_test_url) as total_screening
    FROM portal_trainee;
  `);

  console.log('\n📈 Total non-null URLs in portal_trainee:');
  console.log('Quarterly Report URLs:', stats.rows[0].total_quarterly);
  console.log('Real Stage Report URLs:', stats.rows[0].total_real_stage);
  console.log('Screening Test URLs:', stats.rows[0].total_screening);

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error during import:', err);
  process.exit(1);
});
