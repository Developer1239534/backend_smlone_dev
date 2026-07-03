const fs = require('fs');
const path = require('path');
const { pool } = require('../src/db/neonClient');

async function main() {
  try {
    const filePath = path.join(__dirname, 'full-request.txt');
    if (!fs.existsSync(filePath)) {
      console.error('❌ full-request.txt not found!');
      return;
    }

    console.log('📖 Reading full-request.txt...');
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const lines = rawContent.split(/\r?\n/);

    const aggregated = {}; // Key: `${trainee_id}_${date}`, Value: total_gold

    let parsedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty, headers, or system markers
      if (!line || 
          line.startsWith('<USER_REQUEST>') || 
          line.startsWith('Student Name') || 
          line.startsWith('1\t2\t3') || 
          line.includes('<truncated') || 
          line.includes('NOTE: The output was truncated')) {
        skippedCount++;
        continue;
      }

      // Format: ID \t Date \t TotalGold
      const parts = line.split(/\t/);
      if (parts.length < 2) {
        skippedCount++;
        continue;
      }

      const traineeId = parts[0].trim();
      const date = parts[1].trim();
      
      // If TotalGold is missing or empty, default to 0
      let totalGoldRaw = parts[2] ? parts[2].trim() : '0';
      if (!totalGoldRaw) totalGoldRaw = '0';
      
      const totalGold = parseInt(totalGoldRaw, 10);

      if (!traineeId || !date || isNaN(totalGold)) {
        skippedCount++;
        continue;
      }

      const key = `${traineeId}_${date}`;
      if (aggregated[key] !== undefined) {
        aggregated[key] += totalGold;
      } else {
        aggregated[key] = totalGold;
      }

      parsedCount++;
    }

    console.log(`📊 Parsing complete. Total lines parsed: ${parsedCount}, skipped: ${skippedCount}`);
    const keys = Object.keys(aggregated);
    console.log(`📈 Unique trainee-date combinations to insert/update: ${keys.length}`);

    // Database preparation
    console.log('🧹 Clearing existing gp_tahunan table...');
    await pool.query('DELETE FROM gp_tahunan');

    console.log('🔧 Adding UNIQUE constraint (trainee_id, date) to gp_tahunan table...');
    try {
      await pool.query('ALTER TABLE gp_tahunan ADD CONSTRAINT gp_tahunan_trainee_id_date_unique UNIQUE (trainee_id, date)');
      console.log('✅ UNIQUE constraint added successfully!');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('ℹ️ UNIQUE constraint already exists.');
      } else {
        console.error('⚠️ Could not add UNIQUE constraint:', err.message);
      }
    }

    console.log('💾 Seeding data into Neon database...');
    const batchSize = 100;
    let successCount = 0;

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

      if ((i + batchSize) % 500 === 0 || i + batchSize >= keys.length) {
        console.log(`  Processed ${Math.min(i + batchSize, keys.length)} / ${keys.length} items...`);
      }
    }

    console.log(`\n✅ Finished seeding gp_tahunan! Successfully inserted/updated: ${successCount} records.`);

    // Find the last date parsed
    let lastDate = 'Unknown';
    if (keys.length > 0) {
      const lastKey = keys[keys.length - 1];
      lastDate = lastKey.split('_')[1];
    }
    console.log(`Latest date parsed in this chunk: ${lastDate}`);

  } catch (err) {
    console.error('❌ Global error in main:', err.message);
  } finally {
    await pool.end();
  }
}

main();
