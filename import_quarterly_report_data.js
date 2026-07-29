const fs = require('fs');
const db = require('./src/db/neonClient');

function parsePeriod(periodStr) {
  if (!periodStr) return { year: 0, quarter: 0 };
  const clean = periodStr.replace(/\s+/g, '').toLowerCase();
  const yearMatch = clean.match(/\d{4}$/);
  const year = yearMatch ? parseInt(yearMatch[0], 10) : 0;
  
  let quarter = 0;
  if (clean.includes('jan') || clean.includes('mar')) {
    quarter = 1;
  } else if (clean.includes('apr') || clean.includes('jun')) {
    quarter = 2;
  } else if (clean.includes('jul') || clean.includes('sep')) {
    quarter = 3;
  } else if (clean.includes('oct') || clean.includes('dec')) {
    quarter = 4;
  }
  return { year, quarter };
}

function comparePeriods(a, b) {
  const pa = parsePeriod(a);
  const pb = parsePeriod(b);
  if (pa.year !== pb.year) {
    return pb.year - pa.year;
  }
  return pb.quarter - pa.quarter;
}

async function importQuarterlyReports() {
  console.log('🔄 Checking & creating quarterly_report table...');
  await db.query(`
    CREATE TABLE IF NOT EXISTS quarterly_report (
      id SERIAL PRIMARY KEY,
      trainee_id VARCHAR,
      periode VARCHAR,
      url VARCHAR,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (trainee_id, periode)
    );
  `);
  console.log('✅ quarterly_report table verified.');

  const content = fs.readFileSync(__dirname + '/full_user_prompt.txt', 'utf8');
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

      if (i + 1 < lines.length && (
        lines[i + 1].includes('-') || 
        lines[i + 1].toLowerCase().includes('jan') || 
        lines[i + 1].toLowerCase().includes('apr') || 
        lines[i + 1].toLowerCase().includes('jul') || 
        lines[i + 1].toLowerCase().includes('oct')
      )) {
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

        // Upsert to quarterly_report
        await db.query(`
          INSERT INTO quarterly_report (trainee_id, periode, url, created_at)
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

  // Update quarterly_report_url in portal_trainee with the latest quarterly report URL for each trainee
  console.log('\n🔄 Syncing latest quarterly reports to portal_trainee...');
  const traineesWithReports = await db.query('SELECT DISTINCT trainee_id FROM quarterly_report;');
  
  let syncedCount = 0;
  for (const row of traineesWithReports.rows) {
    const tid = row.trainee_id;
    // Get all quarterly reports for this trainee
    const qrRes = await db.query('SELECT periode, url FROM quarterly_report WHERE trainee_id = $1', [tid]);
    
    // Sort by period descending (newest first)
    const sorted = qrRes.rows.sort((a, b) => comparePeriods(a.periode, b.periode));

    const latestUrl = sorted[0]?.url || null;
    if (latestUrl) {
      await db.query('UPDATE portal_trainee SET quarterly_report_url = $1 WHERE trainee_id = $2', [latestUrl, tid]);
      syncedCount++;
    }
  }

  console.log(`\n🎉 Quarterly Report Import Finished!`);
  console.log(`- Successfully imported: ${successCount} reports.`);
  console.log(`- Skipped (Trainee not found): ${skippedCount}`);
  console.log(`- Synced to portal_trainee: ${syncedCount} latest reports.`);
  process.exit(0);
}

importQuarterlyReports().catch(err => {
  console.error('Error importing quarterly reports:', err);
  process.exit(1);
});
