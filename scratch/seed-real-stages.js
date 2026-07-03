const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

const dataFilePath = path.join(__dirname, 'latest-user-request-real-stages.txt');

async function main() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      console.error(`❌ Data file not found at: ${dataFilePath}`);
      process.exit(1);
    }

    console.log(`Parsing file: ${path.basename(dataFilePath)}`);
    const content = fs.readFileSync(dataFilePath, 'utf8');
    const lines = content.split('\n');

    let headerIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('ID\t') || lines[i].includes('ID ')) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) {
      console.error('❌ Could not find header line starting with ID');
      process.exit(1);
    }

    let headerLine = lines[headerIndex];
    const idIdx = headerLine.indexOf('ID');
    if (idIdx > 0) {
      headerLine = headerLine.substring(idIdx);
    }
    console.log(`Found header line: "${headerLine}"`);
    const headerCols = headerLine.split('\t').map(c => c.trim());

    // Find offsets dynamically
    let idCol = 0;
    let periodCol = 1;
    let urlCol = 2;

    headerCols.forEach((col, idx) => {
      if (col.toLowerCase() === 'id') idCol = idx;
      if (col.toLowerCase().includes('periode')) periodCol = idx;
      if (col.toLowerCase().includes('report') || col.toLowerCase().includes('link')) urlCol = idx;
    });

    const records = [];
    const dedupSet = new Set();

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (
        line.startsWith('</USER_REQUEST>') || 
        line.startsWith('<ADDITIONAL_METADATA>') || 
        line.startsWith('</ADDITIONAL_METADATA>')
      ) {
        continue;
      }

      const parts = lines[i].split('\t').map(p => p.trim());
      if (parts.length <= Math.max(idCol, periodCol)) continue;

      const id = parts[idCol];
      const periode = parts[periodCol];
      const url = parts[urlCol] || null;

      if (!id || isNaN(id) || !periode) continue;

      const dedupKey = `${id}|||${periode}`;
      if (dedupSet.has(dedupKey)) {
        continue;
      }
      dedupSet.add(dedupKey);

      records.push({ id, periode, url: (url && url !== '-') ? url : null });
    }

    console.log(`Ensure real_stage table exists...`);
    await db.query(`
      CREATE TABLE IF NOT EXISTS real_stage (
        id SERIAL PRIMARY KEY,
        trainee_id VARCHAR(50) NOT NULL REFERENCES dashboard_trainne(id) ON DELETE CASCADE,
        periode VARCHAR(100) NOT NULL,
        url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(trainee_id, periode)
      );
    `);

    console.log(`Parsed ${records.length} unique Real Stage records to seed/sync.`);

    let insertedCount = 0;
    let updatedCount = 0;
    let missingIds = new Set();

    for (const rec of records) {
      let targetId = rec.id;
      if (targetId === '968') {
        targetId = '966';
      }

      // Check if trainee exists in DB
      const check = await db.query('SELECT 1 FROM dashboard_trainne WHERE id = $1', [targetId]);
      if (check.rows.length === 0) {
        missingIds.add(rec.id);
        continue;
      }

      // Perform upsert (INSERT ... ON CONFLICT DO UPDATE)
      const upsertResult = await db.query(`
        INSERT INTO real_stage (trainee_id, periode, url)
        VALUES ($1, $2, $3)
        ON CONFLICT (trainee_id, periode)
        DO UPDATE SET url = EXCLUDED.url
        RETURNING (xmax = 0) AS inserted;
      `, [targetId, rec.periode, rec.url]);

      if (upsertResult.rows[0].inserted) {
        insertedCount++;
      } else {
        updatedCount++;
      }
    }

    console.log(`\n=======================================`);
    console.log(`       REAL STAGE SYNC COMPLETED       `);
    console.log(`=======================================`);
    console.log(`Successfully Inserted: ${insertedCount} records.`);
    console.log(`Successfully Updated:  ${updatedCount} records.`);
    console.log(`Missing Trainees:      ${missingIds.size}`);
    if (missingIds.size > 0) {
      console.log('Missing Trainee IDs:', Array.from(missingIds));
    }
    console.log(`=======================================\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Sync error:', err);
    process.exit(1);
  }
}

main();
