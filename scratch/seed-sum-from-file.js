const fs = require('fs');
const readline = require('readline');
const path = require('path');
const { pool } = require('../src/db/neonClient');

async function main() {
  const targetPath = path.join(__dirname, '..', 'gp_Tahunan_Juni.txt');
  if (!fs.existsSync(targetPath)) {
    console.error('❌ gp_Tahunan_Juni.txt not found at root!');
    return;
  }

  console.log(`📖 Reading and summing complete data from: ${targetPath}`);

  const fileStream = fs.createReadStream(targetPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  // Aggregate in memory: key -> total_gold
  const aggregated = {}; // Key: `${traineeId}_${date}`

  for await (const line of rl) {
    const clean = line.trim();
    if (!clean || clean.includes('Student Name') || clean.includes('Total Gold') || clean.includes('Period:')) {
      continue;
    }

    const parts = clean.includes('\t') ? clean.split(/\t+/) : clean.split(',');
    if (parts.length < 2) continue;

    const traineeId = parts[0].trim();
    const date = parts[1].trim();
    let totalGoldRaw = parts[2] ? parts[2].trim() : '0';
    if (!totalGoldRaw) totalGoldRaw = '0';
    const totalGold = parseInt(totalGoldRaw, 10);

    if (!traineeId || isNaN(traineeId) || !date || isNaN(totalGold)) continue;

    const key = `${traineeId}_${date}`;
    if (aggregated[key] !== undefined) {
      aggregated[key] += totalGold;
    } else {
      aggregated[key] = totalGold;
    }
  }

  const keys = Object.keys(aggregated);
  console.log(`✅ Grouped into ${keys.length} unique trainee-date combinations.`);

  console.log('💾 Seeding SUMMED records into Neon database in batches...');
  let successCount = 0;
  const batchSize = 100;

  for (let i = 0; i < keys.length; i += batchSize) {
    const batchKeys = keys.slice(i, i + batchSize);
    
    await Promise.all(batchKeys.map(async (key) => {
      const [traineeId, date] = key.split('_');
      const totalGold = aggregated[key];

      try {
        await pool.query(
          `INSERT INTO gp_tahunan (trainee_id, date, total_gold)
           VALUES ($1, $2, $3)
           ON CONFLICT (trainee_id, date) 
           DO UPDATE SET total_gold = EXCLUDED.total_gold`,
          [traineeId, date, totalGold]
        );
        successCount++;
      } catch (err) {
        console.error(`❌ Error inserting trainee_id=${traineeId}, date=${date}:`, err.message);
      }
    }));

    if ((i + batchSize) % 1000 === 0 || i + batchSize >= keys.length) {
      console.log(`  Processed ${Math.min(i + batchSize, keys.length)} / ${keys.length} items...`);
    }
  }

  console.log(`\n===========================================`);
  console.log(`  GP_TAHUNAN SUMMED SEEDING COMPLETED`);
  console.log(`===========================================`);
  console.log(`Total unique records: ${keys.length}`);
  console.log(`Successfully seeded:  ${successCount}`);
  console.log(`===========================================\n`);
}

main().catch(err => console.error('❌ Global error:', err.message));
