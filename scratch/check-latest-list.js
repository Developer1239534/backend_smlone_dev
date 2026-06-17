const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

const dataFilePath = path.join(__dirname, 'latest-user-request-sep-dec-2025.txt');

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
    const shortUrls = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split('\t');
      if (parts.length < 2) {
        console.log(`Line ${i + 1} has fewer than 2 columns: "${line}"`);
        continue;
      }

      const id = parts[0].trim();
      const periode = parts[1].trim();
      const url = parts[2] ? parts[2].trim() : '';

      if (!id || isNaN(id) || !periode) {
        console.log(`Line ${i + 1} has invalid ID or Period: ID="${id}", Period="${periode}"`);
        continue;
      }

      if (url && url.length < 60) {
        truncatedUrls.push({ lineNum: i + 1, id, url, length: url.length });
      } else if (url && !url.includes('/edit')) {
        shortUrls.push({ lineNum: i + 1, id, url, length: url.length });
      }

      const dedupKey = `${id}|||${periode}`;
      if (dedupSet.has(dedupKey)) {
        console.log(`Duplicate entry found at line ${i + 1} for ID ${id} (${periode})`);
        continue;
      }
      dedupSet.add(dedupKey);

      records.push({ id, periode, url });
    }

    console.log(`\n--- PARSING SUMMARY ---`);
    console.log(`Total lines read (excl. header): ${lines.length - 1}`);
    console.log(`Valid records parsed:          ${records.length}`);
    console.log(`Duplicate records:             ${(lines.length - 1) - records.length}`);
    console.log(`Truncated URLs (<60 chars):    ${truncatedUrls.length}`);
    if (truncatedUrls.length > 0) {
      console.log('Truncated details:', truncatedUrls);
    }
    console.log(`URLs without "/edit":          ${shortUrls.length}`);
    if (shortUrls.length > 0) {
      console.log('URLs without "/edit" details:', shortUrls);
    }

    // Check with DB
    let missingTrainees = [];
    let existingInDbCount = 0;
    let urlChangedCount = 0;

    for (const rec of records) {
      let targetId = rec.id;
      if (targetId === '968') {
        targetId = '966';
      }

      const trainneCheck = await db.query('SELECT trainee_name FROM dashboard_trainne WHERE id = $1', [targetId]);
      if (trainneCheck.rows.length === 0) {
        missingTrainees.push(rec.id);
        continue;
      }

      const traineeName = trainneCheck.rows[0].trainee_name;

      const reportCheck = await db.query(
        'SELECT url FROM quarterly_report WHERE trainee_id = $1 AND periode = $2',
        [targetId, rec.periode]
      );

      if (reportCheck.rows.length > 0) {
        existingInDbCount++;
        const currentUrl = reportCheck.rows[0].url;
        if (currentUrl !== rec.url) {
          urlChangedCount++;
          console.log(`🔄 URL Diff for ID ${rec.id} (${traineeName}, ${rec.periode}):`);
          console.log(`   Old: "${currentUrl}"`);
          console.log(`   New: "${rec.url}"`);
        }
      }
    }

    console.log(`\n--- DATABASE CHECK ---`);
    console.log(`Existing in DB:            ${existingInDbCount}`);
    console.log(`URL updates needed:        ${urlChangedCount}`);
    console.log(`Trainee IDs not found:     ${missingTrainees.length}`);
    if (missingTrainees.length > 0) {
      console.log('Missing Trainee IDs:', missingTrainees);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error during check:', err);
    process.exit(1);
  }
}

main();
