const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../src/db/neonClient');

const dataFilePath = path.join(__dirname, 'request-2024.txt');

async function main() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      console.error(`❌ Data file not found at: ${dataFilePath}`);
      process.exit(1);
    }

    console.log(`Parsing file: ${path.basename(dataFilePath)}`);
    const content = fs.readFileSync(dataFilePath, 'utf8');
    const lines = content.split('\n');
    const records = [];
    const dedupSet = new Set();
    const truncatedUrls = [];
    const duplicates = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Skip tags, metadata, truncation messages, or instructions
      if (
        line.startsWith('<USER_REQUEST>') || 
        line.startsWith('</USER_REQUEST>') || 
        line.startsWith('<ADDITIONAL_METADATA>') ||
        line.startsWith('</ADDITIONAL_METADATA>') ||
        line.includes('jika ada ID tidak ada') ||
        line.includes('The current local time is') ||
        line.includes('NOTE: The output was truncated') ||
        line.includes('<truncated')
      ) {
        continue;
      }

      // Split by tab or multiple spaces
      const parts = line.split(/\t+/);
      if (parts.length < 2) continue;

      const id = parts[0].trim();
      const periode = parts[1].trim();
      const url = parts[2] ? parts[2].trim() : '';

      // Skip #N/A or invalid IDs
      if (!id || id === '#N/A' || isNaN(id) || !periode) continue;

      // Skip truncated URLs (must be length >= 60)
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
    console.log(`Total unique records parsed:   ${records.length}`);
    console.log(`Duplicates skipped:           ${duplicates.length}`);
    console.log(`Truncated URLs skipped:       ${truncatedUrls.length}`);

    let registeredCount = 0;
    let upsertedCount = 0;

    console.log('\n--- SEEDING DATABASE ---');
    for (const rec of records) {
      let targetId = rec.id;
      // Handle mapping rules (e.g. 968 -> 966)
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
    console.log(`   2024 BATCH SEEDING COMPLETED`);
    console.log(`===========================================`);
    console.log(`Total unique reports processed:   ${records.length}`);
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
