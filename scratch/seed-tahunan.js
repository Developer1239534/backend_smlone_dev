const fs = require('fs');
const path = require('path');
const { pool } = require('../src/db/neonClient');

const transcriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\.system_generated\\logs\\transcript_full.jsonl';

async function main() {
  try {
    if (!fs.existsSync(transcriptPath)) {
      console.error('❌ transcript_full.jsonl not found at:', transcriptPath);
      return;
    }

    console.log('📖 Reading full transcript log to locate the untruncated gp_tahunan data...');
    const content = fs.readFileSync(transcriptPath, 'utf8');
    const lines = content.split('\n');

    let targetText = '';
    
    // Find the step where the user sent the gp_tahunan data
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const step = JSON.parse(line);
        if (step.source === 'USER_EXPLICIT' && step.type === 'USER_INPUT') {
          const text = step.content || '';
          if (text.includes('gp_tahunan') && text.includes('6 Jan 2026')) {
            console.log(`🎯 Found matching step: index ${step.step_index}`);
            // Check if this is the longest one (to get the full untruncated one)
            if (text.length > targetText.length) {
              targetText = text;
            }
          }
        }
      } catch (err) {
        // ignore JSON parse error
      }
    }

    if (!targetText) {
      console.error('❌ Could not find the gp_tahunan user request in transcript!');
      return;
    }

    console.log(`📊 Found text block of length: ${targetText.length} characters.`);
    
    // Parse the table
    const dataLines = targetText.split(/\r?\n/);
    const parsedRecords = [];

    let startParsing = false;
    for (const line of dataLines) {
      const clean = line.trim();
      if (!clean) continue;

      if (clean.includes('Student Name') && clean.includes('Date')) {
        startParsing = true;
        continue;
      }

      if (!startParsing) continue;

      // Split by tab or multiple spaces
      const parts = clean.split(/\t+/);
      if (parts.length < 2) continue;

      const traineeId = parts[0].trim();
      const date = parts[1].trim();
      let totalGoldRaw = parts[2] ? parts[2].trim() : '0';
      if (!totalGoldRaw) totalGoldRaw = '0';

      const totalGold = parseInt(totalGoldRaw, 10);

      // Verify basic fields
      if (!traineeId || isNaN(traineeId) || !date || isNaN(totalGold)) {
        continue;
      }

      parsedRecords.push({ traineeId, date, totalGold });
    }

    console.log(`✅ Parsed ${parsedRecords.length} records from the untruncated transcript data.`);
    if (parsedRecords.length === 0) {
      console.error('❌ No records parsed!');
      return;
    }

    console.log('Sample parsed data (first 5):', parsedRecords.slice(0, 5));
    console.log('Sample parsed data (last 5):', parsedRecords.slice(-5));

    console.log('💾 Seeding records into Neon database...');
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
    }

    console.log(`\n===========================================`);
    console.log(`  GP_TAHUNAN SEEDING COMPLETED`);
    console.log(`===========================================`);
    console.log(`Total parsed:   ${parsedRecords.length}`);
    console.log(`Successfully seeded: ${successCount}`);
    console.log(`===========================================\n`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
