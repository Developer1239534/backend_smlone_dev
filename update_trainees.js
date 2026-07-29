const fs = require('fs');
const db = require('./src/db/neonClient');

function parseDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length !== 3) return null;
  const day = parts[0].padStart(2, '0');
  const monthStr = parts[1].substring(0, 3).toLowerCase();
  const year = parts[2];
  
  const months = {
    jan: '01', feb: '02', mar: '03', apr: '04',
    may: '05', jun: '06', jul: '07', aug: '08',
    sep: '09', oct: '10', nov: '11', dec: '12'
  };
  
  const month = months[monthStr];
  if (!month) return null;
  return `${year}-${month}-${day}`;
}

function cleanClass(classStr) {
  if (!classStr) return '';
  return classStr.replace(/\s*\(.*?\)/g, '').trim();
}

async function run() {
  const content = fs.readFileSync(__dirname + '/raw_update_trainees.txt', 'utf8');
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length < 9) {
      console.log(`⚠️ Line does not have 9 columns: "${line}"`);
      continue;
    }

    const id = parts[0].trim();
    const name = parts[1].trim();
    const rawExpiry = parts[2].trim();
    const activeExpired = parts[3].trim();
    const program = parts[4].trim();
    const rawClassStr = parts[5].trim();
    // Index 6 is Total Gold (ignored / kept empty)
    const house = parts[7].trim();
    const level = parts[8].trim();

    const cleanedClass = cleanClass(rawClassStr);
    const parsedExpiry = parseDate(rawExpiry);

    // Verify if trainee exists
    const checkPT = await db.query('SELECT name FROM portal_trainee WHERE trainee_id = $1', [id]);
    const checkDT = await db.query('SELECT trainee_name FROM dashboard_trainne WHERE id = $1', [id]);

    if (checkPT.rows.length === 0 && checkDT.rows.length === 0) {
      console.log(`⚠️ Skipped ID ${id}: Trainee not found in system.`);
      skippedCount++;
      continue;
    }

    // Update portal_trainee if exists
    if (checkPT.rows.length > 0) {
      await db.query(`
        UPDATE portal_trainee
        SET name = $1,
            membership_expired_date = $2,
            program = $3,
            class = $4,
            house = $5,
            level = $6,
            updated_at = NOW()
        WHERE trainee_id = $7;
      `, [name, parsedExpiry, program, cleanedClass, house, level, id]);
    }

    // Update dashboard_trainne if exists
    if (checkDT.rows.length > 0) {
      await db.query(`
        UPDATE dashboard_trainne
        SET trainee_name = $1,
            membership_expiry = $2,
            status = $3,
            program = $4,
            class = $5,
            house_sml = $6,
            level = $7
        WHERE id = $8;
      `, [name, parsedExpiry, activeExpired, program, cleanedClass, house, level, id]);
    }

    console.log(`✅ Updated ID ${id} (${name}) -> Class: ${cleanedClass}, Expiry: ${parsedExpiry}, Status: ${activeExpired}`);
    updatedCount++;
  }

  console.log(`\n🎉 Trainees Update Finished!`);
  console.log(`- Successfully updated: ${updatedCount} trainees.`);
  console.log(`- Skipped (not found):   ${skippedCount}`);
  process.exit(0);
}

run().catch(err => {
  console.error('Error updating trainees:', err);
  process.exit(1);
});
