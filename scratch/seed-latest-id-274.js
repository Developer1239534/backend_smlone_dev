const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

const dataFilePath = path.join(__dirname, 'latest-user-request-id-274.txt');

async function main() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      console.error(`❌ Data file not found at: ${dataFilePath}`);
      process.exit(1);
    }

    const content = fs.readFileSync(dataFilePath, 'utf8');
    const lines = content.split('\n');
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split('\t');
      if (parts.length < 2) continue;

      const id = parts[0].trim();
      const periode = parts[1].trim();
      const url = parts[2] ? parts[2].trim() : '';

      if (!id || isNaN(id) || !periode) continue;

      records.push({ id, periode, url });
    }

    console.log(`Parsed ${records.length} records for ID 274.`);

    // Verify if ID 274 exists in DB
    const check = await db.query('SELECT trainee_name FROM dashboard_trainne WHERE id = $1', ['274']);
    if (check.rows.length === 0) {
      console.error(`❌ Trainee with ID 274 not found in dashboard_trainne table!`);
      process.exit(1);
    }

    const traineeName = check.rows[0].trainee_name;
    console.log(`Trainee name for ID 274: "${traineeName}"`);

    let upsertedCount = 0;
    for (const rec of records) {
      await db.query(`
        INSERT INTO quarterly_report (trainee_id, periode, url)
        VALUES ($1, $2, $3)
        ON CONFLICT (trainee_id, periode)
        DO UPDATE SET url = EXCLUDED.url;
      `, [rec.id, rec.periode, rec.url]);
      upsertedCount++;
      console.log(`- Upserted ${rec.periode} report: "${rec.url}"`);
    }

    console.log(`\n===========================================`);
    console.log(`   ID 274 REPORTS SEEDING COMPLETED`);
    console.log(`===========================================`);
    console.log(`Total records processed:  ${records.length}`);
    console.log(`Successfully upserted:   ${upsertedCount}`);
    console.log(`===========================================\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

main();
