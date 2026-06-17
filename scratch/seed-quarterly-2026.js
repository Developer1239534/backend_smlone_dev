const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

const dataFilePath = path.join(__dirname, 'full-user-prompt-2026.txt');

async function main() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      console.error(`❌ Data file not found at: ${dataFilePath}`);
      process.exit(1);
    }

    const content = fs.readFileSync(dataFilePath, 'utf8');
    const lines = content.split('\n');
    const records = [];
    const dedupSet = new Set();
    let truncatedRecord = null;

    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length < 2) continue;

      const id = parts[0].trim();
      const periode = parts[1].trim();
      let url = parts[2] ? parts[2].trim() : '';

      if (!id || isNaN(id) || !periode) continue;

      // Skip truncation line
      if (id.includes('<') || id.includes('truncated')) continue;

      // Check for truncated URL (Google Doc links are usually around 90-100 chars long)
      if (url && url.length < 60) {
        truncatedRecord = { id, periode, url };
        console.log(`⚠️ Detected truncated URL for ID ${id} (${periode}): "${url}". Skipping this record.`);
        continue;
      }

      const dedupKey = `${id}|||${periode}`;
      if (dedupSet.has(dedupKey)) {
        continue;
      }
      dedupSet.add(dedupKey);

      records.push({ id, periode, url });
    }

    console.log(`Parsed ${records.length} unique quarterly report records for 2026.`);

    let insertedCount = 0;
    let missingTraineeIds = new Set();

    for (const rec of records) {
      let targetId = rec.id;
      // Map Lady Valery Sinambela ID 968 -> 966
      if (targetId === '968') {
        targetId = '966';
      }

      // Check if trainee exists in DB
      const check = await db.query('SELECT 1 FROM dashboard_trainne WHERE id = $1', [targetId]);
      if (check.rows.length === 0) {
        missingTraineeIds.add(rec.id);
        continue;
      }

      // Perform upsert (INSERT ... ON CONFLICT DO UPDATE)
      await db.query(`
        INSERT INTO quarterly_report (trainee_id, periode, url)
        VALUES ($1, $2, $3)
        ON CONFLICT (trainee_id, periode)
        DO UPDATE SET url = EXCLUDED.url;
      `, [targetId, rec.periode, rec.url]);
      insertedCount++;
    }

    console.log(`\n=======================================`);
    console.log(`    2026 REPORT SEEDING COMPLETED      `);
    console.log(`=======================================`);
    console.log(`Parsed Records:          ${records.length}`);
    console.log(`Successfully Upserted:   ${insertedCount} records.`);
    console.log(`Missing Trainees (skip): ${missingTraineeIds.size}`);
    if (missingTraineeIds.size > 0) {
      console.log('Skipped IDs:', Array.from(missingTraineeIds).sort((a,b) => Number(a)-Number(b)));
    }
    if (truncatedRecord) {
      console.log(`Truncated Record Skipped: ID ${truncatedRecord.id} (${truncatedRecord.periode})`);
    }
    console.log(`=======================================\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

main();
