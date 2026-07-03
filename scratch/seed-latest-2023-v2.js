const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

const dataFilePath = path.join(__dirname, 'latest-user-request-2023.txt');

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
    const truncatedUrls = [];
    const duplicates = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      if (line.startsWith('<USER_REQUEST>') || line.startsWith('</USER_REQUEST>')) continue;

      // Split by tab or multiple spaces
      const parts = line.split(/\t+/);
      if (parts.length < 2) continue;

      const id = parts[0].trim();
      const periode = parts[1].trim();
      const url = parts[2] ? parts[2].trim() : '';

      // Skip #N/A or invalid IDs
      if (!id || id === '#N/A' || isNaN(id) || !periode) continue;

      // Skip truncated URLs
      if (!url || url.length < 60) {
        truncatedUrls.push({ lineNum: i + 1, id, url });
        continue;
      }

      const dedupKey = `${id}|||${periode}`;
      if (dedupSet.has(dedupKey)) {
        duplicates.push({ lineNum: i + 1, id, url });
        continue;
      }
      dedupSet.add(dedupKey);

      records.push({ id, periode, url });
    }

    console.log(`\n--- PARSING SUMMARY ---`);
    console.log(`Parsed records:               ${records.length}`);
    console.log(`Duplicates skipped:           ${duplicates.length}`);
    console.log(`Truncated URLs (<60 chars):    ${truncatedUrls.length}`);

    let insertedCount = 0;
    let missingTrainees = new Set();

    console.log('\n--- SEEDING DATABASE ---');
    for (const rec of records) {
      let targetId = rec.id;
      if (targetId === '968') {
        targetId = '966';
      }

      // Verify trainee exists in DB
      const check = await db.query('SELECT 1 FROM dashboard_trainne WHERE id = $1', [targetId]);
      if (check.rows.length === 0) {
        missingTrainees.add(rec.id);
        continue;
      }

      // Upsert query
      await db.query(`
        INSERT INTO quarterly_report (trainee_id, periode, url)
        VALUES ($1, $2, $3)
        ON CONFLICT (trainee_id, periode)
        DO UPDATE SET url = EXCLUDED.url;
      `, [targetId, rec.periode, rec.url]);

      insertedCount++;
    }

    console.log(`\n===========================================`);
    console.log(`   2023 BATCH 2 SEEDING COMPLETED`);
    console.log(`===========================================`);
    console.log(`Successfully upserted: ${insertedCount} records.`);
    console.log(`Missing Trainees (skipped): ${missingTrainees.size}`);
    if (missingTrainees.size > 0) {
      console.log('Missing Trainee IDs:', Array.from(missingTrainees));
    }
    console.log(`===========================================\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

main();
