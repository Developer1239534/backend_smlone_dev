const fs = require('fs');
const db = require('./src/db/neonClient');

async function run() {
  const content = fs.readFileSync(__dirname + '/raw_speaking_projects.txt', 'utf8');
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const latestProjectMap = new Map();

  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length < 2) continue;

    const id = parts[0].trim();
    const project = parts[1].trim();

    // Skip header or invalid IDs
    if (!/^\d+$/.test(id)) continue;

    // Since the file is sorted newest-to-oldest, the first occurrence is the latest project
    if (!latestProjectMap.has(id)) {
      latestProjectMap.set(id, project);
    }
  }

  console.log(`Extracted latest speaking project for ${latestProjectMap.size} unique trainees from raw data.`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const [id, project] of latestProjectMap.entries()) {
    // Check if trainee exists in portal_trainee or dashboard_trainne
    const checkPT = await db.query('SELECT name, latest_speaking_project FROM portal_trainee WHERE trainee_id = $1', [id]);
    const checkDT = await db.query('SELECT trainee_name, last_speaking_project FROM dashboard_trainne WHERE id = $1', [id]);

    if (checkPT.rows.length === 0 && checkDT.rows.length === 0) {
      // Skipped because trainee doesn't exist in either table
      skippedCount++;
      continue;
    }

    // Update portal_trainee if exists
    if (checkPT.rows.length > 0) {
      await db.query(`
        UPDATE portal_trainee
        SET latest_speaking_project = $2,
            updated_at = NOW()
        WHERE trainee_id = $1;
      `, [id, project]);
    }

    // Update dashboard_trainne if exists
    if (checkDT.rows.length > 0) {
      await db.query(`
        UPDATE dashboard_trainne
        SET last_speaking_project = $2
        WHERE id = $1;
      `, [id, project]);
    }

    const name = checkPT.rows.length > 0 ? checkPT.rows[0].name : checkDT.rows[0].trainee_name;
    console.log(`✅ Updated ID ${id} (${name}) -> Speaking Project: ${project}`);
    updatedCount++;
  }

  console.log(`\n🎉 Speaking Projects Update Finished!`);
  console.log(`- Successfully updated: ${updatedCount} trainees.`);
  console.log(`- Skipped (not found):   ${skippedCount}`);
  process.exit(0);
}

run().catch(err => {
  console.error('Error updating speaking projects:', err);
  process.exit(1);
});
