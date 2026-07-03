const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

const reportPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\screening_test_results.md';

async function main() {
  try {
    if (!fs.existsSync(reportPath)) {
      console.error('Original report not found.');
      process.exit(1);
    }

    const content = fs.readFileSync(reportPath, 'utf8');
    const lines = content.trim().split('\n');

    // Parse the original report to see who was empty
    const originalEmpty = [];
    for (const line of lines) {
      if (line.startsWith('|') && !line.includes('ID | Nama Trainee') && !line.includes(':---')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 6) {
          const id = parts[1];
          const name = parts[2];
          const status = parts[3];
          if (status.includes('Kosong')) {
            originalEmpty.push({ id, name });
          }
        }
      }
    }

    // Query current database state
    const res = await db.query('SELECT id, trainee_name, screening_test FROM dashboard_trainne ORDER BY id ASC');
    const dbTrainees = res.rows;

    const newlyMatched = [];
    const stillEmpty = [];

    dbTrainees.forEach(t => {
      const originallyWasEmpty = originalEmpty.some(oe => oe.id === t.id);
      if (t.screening_test) {
        if (originallyWasEmpty) {
          newlyMatched.push(t);
        }
      } else {
        stillEmpty.push(t);
      }
    });

    console.log(`=== ANALYSIS ===`);
    console.log(`Newly Matched Trainees: ${newlyMatched.length}`);
    console.log(`Trainees Still Empty:  ${stillEmpty.length}`);

    // Save results
    fs.writeFileSync(
      path.join(__dirname, 'newly_matched_and_empty.json'),
      JSON.stringify({ newlyMatched, stillEmpty }, null, 2),
      'utf8'
    );

    console.log('\n=== SAMPLE NEWLY MATCHED (First 30) ===');
    newlyMatched.slice(0, 30).forEach(t => {
      console.log(`ID: ${t.id} | Name: ${t.trainee_name}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
