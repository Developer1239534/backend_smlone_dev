const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

const dataFilePath = path.join(__dirname, 'latest-user-request-2026-new.txt');

async function main() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      console.error(`❌ Data file not found at: ${dataFilePath}`);
      process.exit(1);
    }

    const content = fs.readFileSync(dataFilePath, 'utf8');
    const lines = content.split('\n');
    const records = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split('\t');
      if (parts.length < 2) continue;

      const id = parts[0].trim();
      const periode = parts[1].trim();
      const url = parts[2] ? parts[2].trim() : '';

      if (!id || isNaN(id) || !periode) continue;
      if (periode !== 'Jan-Apr 2026') continue;

      // Skip the last record if the URL was cut off
      if (!url || url.length < 60) {
        console.log(`⚠️ Skipping truncated URL at line ${i + 1} for ID ${id}: "${url}"`);
        continue;
      }

      records.push({ id, periode, url });
    }

    console.log(`Parsed ${records.length} valid records to upsert.`);

    let insertedCount = 0;
    for (const rec of records) {
      let targetId = rec.id;
      if (targetId === '968') {
        targetId = '966';
      }

      // Verify trainee exists in DB
      const check = await db.query('SELECT 1 FROM dashboard_trainne WHERE id = $1', [targetId]);
      if (check.rows.length === 0) {
        continue;
      }

      await db.query(`
        INSERT INTO quarterly_report (trainee_id, periode, url)
        VALUES ($1, $2, $3)
        ON CONFLICT (trainee_id, periode)
        DO UPDATE SET url = EXCLUDED.url;
      `, [targetId, rec.periode, rec.url]);
      insertedCount++;
    }

    console.log(`\n===========================================`);
    console.log(`   2026 PARTIAL SEEDING COMPLETED`);
    console.log(`===========================================`);
    console.log(`Successfully upserted: ${insertedCount} records.`);
    console.log(`===========================================\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

main();
