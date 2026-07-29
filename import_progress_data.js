const fs = require('fs');
const db = require('./src/db/neonClient');

async function importProgress() {
  console.log('🔄 Parsing raw_progress.txt...');
  const content = fs.readFileSync(__dirname + '/raw_progress.txt', 'utf8');
  const lines = content.split(/\r?\n/);
  
  let successCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    
    const parts = line.split('\t');
    if (parts.length < 2) continue;

    const idPart = parts[0].trim();
    const namePart = parts[1].trim();
    const percentPart = parts[2] ? parts[2].trim() : '';

    if (!idPart || idPart === 'ID' || namePart.toLowerCase() === 'no registration') continue;

    // Check if ID is a number
    const isIdNumeric = /^\d+$/.test(idPart);
    let targetId = null;
    let targetName = null;
    let percentVal = null;

    if (isIdNumeric) {
      targetId = idPart;
      targetName = namePart;
      percentVal = percentPart;
    } else {
      // First line might not have numeric ID
      continue;
    }

    if (!percentVal) {
      // Skip if percent is empty
      continue;
    }

    // Clean percentage
    const cleanPercent = percentVal.replace(/\s+/g, '');
    if (!cleanPercent.endsWith('%')) continue;

    // Update portal_trainee
    const updateRes = await db.query(
      `UPDATE portal_trainee 
       SET speaking_project_to_next_level = $1, updated_at = NOW() 
       WHERE trainee_id = $2 OR LOWER(name) = LOWER($3)
       RETURNING trainee_id, name`,
      [cleanPercent, targetId, targetName]
    );

    if (updateRes.rowCount > 0) {
      console.log(`✅ Updated ${updateRes.rows[0].name} (ID: ${updateRes.rows[0].trainee_id}) to progress: ${cleanPercent}`);
      successCount++;
    } else {
      notFoundCount++;
      notFoundList.push({ id: targetId, name: targetName, progress: cleanPercent });
    }
  }

  console.log(`\n🎉 Progress Import Finished!`);
  console.log(`- Successfully updated: ${successCount} trainees.`);
  console.log(`- Trainees not found: ${notFoundCount}`);
  if (notFoundList.length > 0) {
    console.log('Sample not found list:', notFoundList.slice(0, 10));
  }
  process.exit(0);
}

importProgress().catch(err => {
  console.error('Error importing progress:', err);
  process.exit(1);
});
