const fs = require('fs');
const readline = require('readline');
const path = require('path');
const { pool } = require('../src/db/neonClient');

async function main() {
  // We will check for common filenames the user might use
  const possibleNames = ['gp_Tahunan_Juni.txt', 'gp_tahunan_lengkap.txt', 'gp_tahunan_lengkap.csv', 'gp_tahunan.txt', 'gp_tahunan.csv'];
  let targetPath = null;

  for (const name of possibleNames) {
    const p = path.join(__dirname, '..', name);
    if (fs.existsSync(p)) {
      targetPath = p;
      break;
    }
  }

  if (!targetPath) {
    console.error('❌ Could not find any data file in the workspace directory!');
    console.error('Please save your complete data as "gp_tahunan_lengkap.txt" or "gp_tahunan_lengkap.csv" in the root directory.');
    return;
  }

  console.log(`📖 Reading complete data from: ${targetPath}`);

  const fileStream = fs.createReadStream(targetPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const parsedRecords = [];
  let headerSkipped = false;
  let lineCount = 0;

  for await (const line of rl) {
    lineCount++;
    const clean = line.trim();
    if (!clean) continue;

    // Skip header lines
    if (clean.includes('Student Name') || clean.includes('Total Gold') || clean.includes('Period:')) {
      headerSkipped = true;
      continue;
    }

    // Handle TSV or CSV split
    const parts = clean.includes('\t') ? clean.split(/\t+/) : clean.split(',');
    if (parts.length < 2) continue;

    const traineeId = parts[0].trim();
    const date = parts[1].trim();
    let totalGoldRaw = parts[2] ? parts[2].trim() : '0';
    if (!totalGoldRaw) totalGoldRaw = '0';

    const totalGold = parseInt(totalGoldRaw, 10);

    // Validate structure
    if (!traineeId || isNaN(traineeId) || !date || isNaN(totalGold)) {
      continue;
    }

    parsedRecords.push({ traineeId, date, totalGold });
  }

  console.log(`✅ Parsed ${parsedRecords.length} records from local file.`);
  if (parsedRecords.length === 0) {
    console.error('❌ No valid records parsed from the file!');
    return;
  }

  console.log('Sample parsed data (first 5):', parsedRecords.slice(0, 5));
  console.log('Sample parsed data (last 5):', parsedRecords.slice(-5));

  console.log('💾 Seeding records into Neon database in batches...');
  let successCount = 0;
  const batchSize = 100;

  for (let i = 0; i < parsedRecords.length; i += batchSize) {
    const batch = parsedRecords.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (row) => {
      try {
        await pool.query(
          `INSERT INTO gp_tahunan (trainee_id, date, total_gold)
           VALUES ($1, $2, $3)
           ON CONFLICT (trainee_id, date) 
           DO UPDATE SET total_gold = EXCLUDED.total_gold`,
          [row.traineeId, row.date, row.totalGold]
        );
        successCount++;
      } catch (err) {
        console.error(`❌ Error inserting trainee_id=${row.traineeId}, date=${row.date}:`, err.message);
      }
    }));

    if ((i + batchSize) % 1000 === 0 || i + batchSize >= parsedRecords.length) {
      console.log(`  Processed ${Math.min(i + batchSize, parsedRecords.length)} / ${parsedRecords.length} items...`);
    }
  }

  console.log(`\n===========================================`);
  console.log(`  GP_TAHUNAN LOCAL SEEDING COMPLETED`);
  console.log(`===========================================`);
  console.log(`Total parsed:   ${parsedRecords.length}`);
  console.log(`Successfully seeded: ${successCount}`);
  console.log(`===========================================\n`);
}

main().catch(err => console.error('❌ Global error:', err.message));
