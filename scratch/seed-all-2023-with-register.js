const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../src/db/neonClient');

const batchFiles = [
  path.join(__dirname, 'request-2023-b1.txt'),
  path.join(__dirname, 'request-2023-b2.txt'),
  path.join(__dirname, 'request-2023-b3.txt')
];

async function main() {
  try {
    const rawRecords = [];
    const dedupSet = new Set();
    const truncatedUrls = [];
    const duplicates = [];

    // 1. Parse all batch files
    for (const dataFilePath of batchFiles) {
      if (!fs.existsSync(dataFilePath)) {
        console.warn(`⚠️ Warning: Batch file not found: ${dataFilePath}`);
        continue;
      }

      console.log(`Parsing file: ${path.basename(dataFilePath)}`);
      const content = fs.readFileSync(dataFilePath, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        if (line.startsWith('<USER_REQUEST>') || line.startsWith('</USER_REQUEST>') || line.startsWith('ini ya data periode 2023') || line.includes('jika ada ID tidak ada')) continue;

        // Split by tab or multiple spaces
        const parts = line.split(/\t+/);
        if (parts.length < 2) continue;

        const id = parts[0].trim();
        const periode = parts[1].trim();
        const url = parts[2] ? parts[2].trim() : '';

        // Skip invalid rows or headers
        if (!id || id === '#N/A' || isNaN(id) || !periode) continue;

        // Skip truncated URLs (must be a valid doc link, length >= 60)
        if (!url || url.length < 60) {
          truncatedUrls.push({ file: path.basename(dataFilePath), lineNum: i + 1, id, url });
          continue;
        }

        const dedupKey = `${id}|||${periode}`;
        if (dedupSet.has(dedupKey)) {
          duplicates.push({ file: path.basename(dataFilePath), lineNum: i + 1, id, url });
          continue;
        }
        dedupSet.add(dedupKey);

        rawRecords.push({ id, periode, url });
      }
    }

    console.log(`\n--- PARSING SUMMARY ---`);
    console.log(`Total unique records parsed:   ${rawRecords.length}`);
    console.log(`Duplicates skipped:           ${duplicates.length}`);
    console.log(`Truncated URLs skipped:       ${truncatedUrls.length}`);

    // 2. Process seeding and auto-registration
    let registeredCount = 0;
    let upsertedCount = 0;

    console.log('\n--- SEEDING DATABASE ---');
    for (const rec of rawRecords) {
      let targetId = rec.id;
      // Handle mapping rules
      if (targetId === '968') {
        targetId = '966';
      }

      // Check if trainee exists in DB
      const check = await db.query('SELECT trainee_name FROM dashboard_trainne WHERE id = $1', [targetId]);
      
      if (check.rows.length === 0) {
        // Auto-register trainee
        const plainPassword = `smlone${targetId}`;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        await db.query(`
          INSERT INTO dashboard_trainne (
            id, trainee_name, status, password, plain_password
          ) VALUES ($1, $2, $3, $4, $5)
        `, [targetId, `Trainee ${targetId}`, 'Active', hashedPassword, plainPassword]);

        registeredCount++;
        console.log(`👤 Auto-registered missing trainee: ID ${targetId}`);
      }

      // Upsert quarterly report record
      await db.query(`
        INSERT INTO quarterly_report (trainee_id, periode, url)
        VALUES ($1, $2, $3)
        ON CONFLICT (trainee_id, periode)
        DO UPDATE SET url = EXCLUDED.url;
      `, [targetId, rec.periode, rec.url]);

      upsertedCount++;
    }

    console.log(`\n===========================================`);
    console.log(`   2023 COMPLETE SEEDING COMPLETED`);
    console.log(`===========================================`);
    console.log(`Total unique reports processed:   ${rawRecords.length}`);
    console.log(`Trainees auto-registered:         ${registeredCount}`);
    console.log(`Reports successfully upserted:    ${upsertedCount}`);
    console.log(`===========================================\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

main();
