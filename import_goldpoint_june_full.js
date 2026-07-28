const fs = require('fs');
const db = require('./src/db/neonClient');

async function runImport() {
  console.log('🔄 Starting Full June Gold Point Master Data Sync...');

  // Reset total_gold and gp_month for all portal_trainee records to 0 first
  await db.query(`UPDATE portal_trainee SET total_gold = 0, gp_month = 0;`);

  const fileContent = fs.readFileSync(__dirname + '/raw_goldpoint_june_full.txt', 'utf8');
  const lines = fileContent.split(/\r?\n/);

  let updatedCount = 0;
  let insertedCount = 0;

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

    if (!id || id.toUpperCase() === 'ID' || name.toUpperCase() === 'NAMA TRAINEE') continue;

    const total_gold = parseInt(totalGoldStr, 10) || 0;

    // Clean Kategori
    if (kategori.toLowerCase().includes('youth')) {
      kategori = 'Youth';
    } else if (kategori.toLowerCase().includes('junior')) {
      kategori = 'Junior';
    } else if (kategori.toLowerCase().includes('apprentice')) {
      kategori = 'Apprentice';
    } else {
      kategori = 'Junior';
    }

    // Clean Class
    if (!className) className = 'Gladwell';

    // Clean House
    if (!house) house = 'House of Thenova';

    // Clean Level
    if (!level) level = 'Sergeant';

    // Clean Branch
    if (!branch || (branch !== 'TIMOR' && branch !== 'TRITURA' && branch !== 'CEMARA')) {
      branch = 'TIMOR';
    }

    // Try updating by trainee_id first
    const updateRes = await db.query(`
      UPDATE portal_trainee 
      SET 
        name = COALESCE(NULLIF($2, ''), name),
        total_gold = $3,
        gp_month = $3,
        kategori = $4,
        class = $5,
        house = $6,
        level = $7,
        branch_id = $8,
        updated_at = NOW()
      WHERE trainee_id = $1
    `, [id, name, total_gold, kategori, className, house, level, branch]);

    if (updateRes.rowCount > 0) {
      updatedCount++;
    } else {
      // Check if trainee exists by name
      const nameCheck = await db.query(`SELECT trainee_id FROM portal_trainee WHERE LOWER(name) = LOWER($1)`, [name]);
      if (nameCheck.rows.length > 0) {
        const existingId = nameCheck.rows[0].trainee_id;
        await db.query(`
          UPDATE portal_trainee 
          SET 
            total_gold = $2,
            gp_month = $2,
            kategori = $3,
            class = $4,
            house = $5,
            level = $6,
            branch_id = $7,
            updated_at = NOW()
          WHERE trainee_id = $1
        `, [existingId, total_gold, kategori, className, house, level, branch]);
        updatedCount++;
      } else {
        // Insert new trainee into portal_trainee
        await db.query(`
          INSERT INTO portal_trainee (
            trainee_id, name, total_gold, gp_month, kategori, class, house, level, branch_id, program, created_at, updated_at
          ) VALUES ($1, $2, $3, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
          ON CONFLICT (trainee_id) DO UPDATE SET
            total_gold = $3, gp_month = $3, kategori = $4, class = $5, house = $6, level = $7, branch_id = $8, updated_at = NOW();
        `, [id, name, total_gold, kategori, className, house, level, branch, `${kategori} Program`]);
        insertedCount++;
      }
    }
  }

  console.log(`✅ Full June Gold Point Sync Finished!`);
  console.log(`- Updated: ${updatedCount} trainees.`);
  console.log(`- Inserted: ${insertedCount} new trainees.`);
  process.exit(0);
}

runImport().catch(err => {
  console.error('Error syncing June Master Data:', err);
  process.exit(1);
});
