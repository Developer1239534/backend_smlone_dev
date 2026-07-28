const fs = require('fs');
const db = require('./src/db/neonClient');

async function importJuneMaster() {
  const fileContent = fs.readFileSync(__dirname + '/raw_goldpoint_june_master.txt', 'utf8');
  const lines = fileContent.split(/\r?\n/);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split('\t');
    if (parts.length < 9) continue;

    const id = parts[0].trim();
    const name = parts[1].trim();
    const activeStatus = parts[2].trim();
    let level = parts[3].trim();
    let house = parts[4].trim();
    let className = parts[5].trim();
    let branch = parts[6].trim();
    const totalGoldStr = parts[7].trim();
    let kategori = parts[8].trim();

    if (id.toUpperCase() === 'ID' || name.toUpperCase() === 'NAMA TRAINEE') continue;

    const total_gold = parseInt(totalGoldStr, 10) || 0;

    // Clean Kategori
    if (kategori.toLowerCase().includes('youth')) {
      kategori = 'Youth';
    } else {
      kategori = 'Junior';
    }

    // Clean Class: ensure it is a valid Class string and NOT empty/number
    if (!className || /^\d+$/.test(className)) {
      className = 'Gladwell';
    }

    // Clean House
    if (!house || house.toLowerCase() === 'house') {
      house = 'House of Thenova';
    }

    // Clean Level
    if (!level || level.toLowerCase() === 'level') {
      level = 'Sergeant';
    }

    // Clean Branch
    if (!branch || (branch !== 'TIMOR' && branch !== 'TRITURA' && branch !== 'CEMARA')) {
      branch = 'TIMOR';
    }

    const queryText = `
      UPDATE portal_trainee 
      SET 
        total_gold = $2,
        gp_month = $3,
        kategori = $4,
        class = $5,
        house = $6,
        level = $7,
        branch_id = $8,
        updated_at = NOW()
      WHERE trainee_id = $1
    `;

    const res = await db.query(queryText, [
      id, total_gold, total_gold, kategori, className, house, level, branch
    ]);

    if (res.rowCount > 0) {
      updatedCount++;
    } else {
      skippedCount++;
    }
  }

  console.log(`✅ June Gold Point Master Data Import Complete!`);
  console.log(`Updated: ${updatedCount} trainees in portal_trainee.`);
  console.log(`Skipped (not found): ${skippedCount} trainees.`);
  process.exit(0);
}

importJuneMaster().catch(err => {
  console.error('Error importing June Master:', err);
  process.exit(1);
});
