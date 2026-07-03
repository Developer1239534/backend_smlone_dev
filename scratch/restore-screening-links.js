const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

const reportPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\screening_test_results.md';

async function main() {
  try {
    if (!fs.existsSync(reportPath)) {
      console.error('Report file not found: ' + reportPath);
      process.exit(1);
    }

    const content = fs.readFileSync(reportPath, 'utf8');
    const lines = content.trim().split('\n');

    // Parse the table
    // Table rows start after header and separator (lines containing | ID | ...)
    const traineesToRestore = [];

    for (const line of lines) {
      if (line.startsWith('|') && !line.includes('ID | Nama Trainee') && !line.includes(':---')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 6) {
          const id = parts[1];
          const name = parts[2];
          const status = parts[3];
          const linkCol = parts[5];

          let url = null;
          if (status.includes('Ada Link')) {
            // Extract URL from markdown link: [Buka Link](URL)
            const match = linkCol.match(/\((https?:\/\/[^\s\)]+)\)/);
            if (match) {
              url = match[1];
            }
          }

          traineesToRestore.push({ id, name, url });
        }
      }
    }

    console.log(`Parsed ${traineesToRestore.length} trainees from report.`);

    // Start transaction or do sequential updates
    console.log('Nullifying all screening_test links first...');
    await db.query('UPDATE dashboard_trainne SET screening_test = NULL');

    console.log('Restoring known valid links...');
    let restoredCount = 0;
    for (const trainee of traineesToRestore) {
      if (trainee.url) {
        await db.query('UPDATE dashboard_trainne SET screening_test = $1 WHERE id = $2', [trainee.url, trainee.id]);
        restoredCount++;
      }
    }

    console.log(`Successfully restored ${restoredCount} valid links in the database.`);
    
    // Verify count
    const countRes = await db.query('SELECT count(*) FROM dashboard_trainne WHERE screening_test IS NOT NULL');
    console.log(`Current non-null screening_test links in DB: ${countRes.rows[0].count}`);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
