const fs = require('fs');
const db = require('./src/db/neonClient');

async function importRealStage() {
  console.log('🔄 Checking & creating real_stage table...');
  await db.query(`
    CREATE TABLE IF NOT EXISTS real_stage (
      id SERIAL PRIMARY KEY,
      trainee_id VARCHAR,
      periode VARCHAR,
      url VARCHAR,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (trainee_id, periode)
    );
  `);
  console.log('✅ real_stage table verified.');

  const content = fs.readFileSync(__dirname + '/raw_real_stage.txt', 'utf8');
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  let i = 0;
  let successCount = 0;
  let skippedCount = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Check if line is a numeric student ID
    if (/^\d+$/.test(line)) {
      const studentId = line;
      
      // Look at next lines for Title and URL
      let title = '';
      let url = '';

      if (i + 1 < lines.length && lines[i + 1].toLowerCase().includes('real stage')) {
        title = lines[i + 1];
        
        if (i + 2 < lines.length && lines[i + 2].includes('http')) {
          url = lines[i + 2];
          i += 3; // Consume ID, Title, and URL
        } else {
          i += 2; // Consume ID and Title only
        }
      } else {
        i += 1; // Consume ID only
      }

      if (studentId && title && url) {
        // Clean URL from markdown link formatting e.g. [url](url)
        let cleanUrl = url;
        const mdMatch = url.match(/\((https?:\/\/[^)]+)\)/);
        if (mdMatch) {
          cleanUrl = mdMatch[1];
        } else {
          const bracketMatch = url.match(/\[(https?:\/\/[^\]]+)\]/);
          if (bracketMatch) {
            cleanUrl = bracketMatch[1];
          }
        }
        cleanUrl = cleanUrl.trim();

        // Verify if trainee exists in portal_trainee
        const checkTrainee = await db.query('SELECT name FROM portal_trainee WHERE trainee_id = $1', [studentId]);
        if (checkTrainee.rows.length === 0) {
          console.log(`⚠️ Skipped ID ${studentId}: Trainee not found in system.`);
          skippedCount++;
          continue;
        }

        const traineeName = checkTrainee.rows[0].name;

        // Upsert to real_stage
        await db.query(`
          INSERT INTO real_stage (trainee_id, periode, url, created_at)
          VALUES ($1, $2, $3, NOW())
          ON CONFLICT (trainee_id, periode) DO UPDATE
          SET url = EXCLUDED.url;
        `, [studentId, title, cleanUrl]);

        console.log(`✅ Imported ${title} for ${traineeName} (ID: ${studentId}) -> ${cleanUrl}`);
        successCount++;
      }
    } else {
      i++;
    }
  }

  // Update real_stage_report_url in portal_trainee with the latest Real Stage URL for each trainee
  console.log('\n🔄 Syncing latest Real Stage URLs to portal_trainee...');
  const traineesWithRS = await db.query('SELECT DISTINCT trainee_id FROM real_stage;');
  
  let syncedCount = 0;
  for (const row of traineesWithRS.rows) {
    const tid = row.trainee_id;
    // Get all real stage reports for this trainee
    const rsRes = await db.query('SELECT periode, url FROM real_stage WHERE trainee_id = $1', [tid]);
    
    // Sort by period number descending (e.g. Real Stage 48 > Real Stage 38)
    const sorted = rsRes.rows.sort((a, b) => {
      const numA = parseInt(a.periode.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.periode.replace(/\D/g, ''), 10) || 0;
      return numB - numA;
    });

    const latestUrl = sorted[0]?.url || null;
    if (latestUrl) {
      await db.query('UPDATE portal_trainee SET real_stage_report_url = $1 WHERE trainee_id = $2', [latestUrl, tid]);
      syncedCount++;
    }
  }

  console.log(`\n🎉 Real Stage Import Finished!`);
  console.log(`- Successfully imported: ${successCount} reports.`);
  console.log(`- Skipped (Trainee not found): ${skippedCount}`);
  console.log(`- Synced to portal_trainee: ${syncedCount} latest reports.`);
  process.exit(0);
}

importRealStage().catch(err => {
  console.error('Error importing real stage:', err);
  process.exit(1);
});
