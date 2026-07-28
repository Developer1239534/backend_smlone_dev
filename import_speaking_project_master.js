const fs = require('fs');
const db = require('./src/db/neonClient');

const rawText = fs.readFileSync(__dirname + '/raw_speaking_project_master.txt', 'utf8');

async function run() {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  let updatedCount = 0;
  let parsedEntries = [];

  for (const line of lines) {
    const parts = line.split(/\t+/);
    if (parts.length < 2) continue;

    const id = parts[0].trim();
    if (!/^\d+$/.test(id)) continue; // Skip header line "20 21 22..." or invalid IDs

    const name = parts[1] ? parts[1].trim() : '';
    const project = parts[2] ? parts[2].trim() : '';

    // Ignore if project is empty, "No registration", or invalid
    if (!project || project.toLowerCase() === 'no registration' || project === '-') {
      continue;
    }

    parsedEntries.push({ id, name, project });
  }

  console.log(`Extracted ${parsedEntries.length} valid speaking project entries to update.`);

  for (const entry of parsedEntries) {
    const res = await db.query(`
      UPDATE portal_trainee
      SET latest_speaking_project = $2, updated_at = NOW()
      WHERE trainee_id = $1
    `, [entry.id, entry.project]);

    if (res.rowCount > 0) {
      updatedCount++;
    } else {
      // If trainee row doesn't exist yet, insert basic row
      await db.query(`
        INSERT INTO portal_trainee (trainee_id, name, latest_speaking_project, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT (trainee_id) DO UPDATE SET
          latest_speaking_project = EXCLUDED.latest_speaking_project,
          updated_at = NOW()
      `, [entry.id, entry.name !== 'No registration' ? entry.name : null, entry.project]);
      updatedCount++;
    }
  }

  console.log(`Successfully updated latest_speaking_project for ${updatedCount} trainees in database.`);
  process.exit(0);
}

run().catch(err => {
  console.error('Error importing speaking projects:', err);
  process.exit(1);
});
