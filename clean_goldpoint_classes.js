const fs = require('fs');
const db = require('./src/db/neonClient');

const rawText = fs.readFileSync(__dirname + '/raw_goldpoint_input.txt', 'utf8');

async function run() {
  const lines = rawText.split(/\r?\n/);
  const traineesMap = new Map();

  const validHouses = ['House of Havaria', 'House of Thenova', 'House of Quorion', 'House of Reverion', 'House of Creanova'];
  const validLevels = ['Sergeant', 'Lt. Colonel', 'Private', 'General', 'Colonel', 'Lt. General'];

  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = line.split('\t');

    for (let c = 0; c < cols.length; c++) {
      const val = cols[c].trim();
      if (/^\d+$/.test(val) && val.length >= 2 && val.length <= 10 && val !== '25' && val !== '26' && val !== '28' && val !== '31') {
        if (c + 1 < cols.length && cols[c + 1].trim() && cols[c + 1].trim().toUpperCase() !== 'NAMA TRAINEE') {
          const id = val;
          const nama_trainee = cols[c + 1].trim();
          const status = cols[c + 2] ? cols[c + 2].trim() : 'Active';
          const level = cols[c + 3] ? cols[c + 3].trim() : 'Sergeant';
          const house = cols[c + 4] ? cols[c + 4].trim() : 'House of Thenova';
          const className = cols[c + 5] ? cols[c + 5].trim() : 'Gladwell';
          const branch = cols[c + 6] ? cols[c + 6].trim() : 'TIMOR';
          const totalGoldStr = cols[c + 7] ? cols[c + 7].trim() : '0';
          const kategoriStr = cols[c + 8] ? cols[c + 8].trim() : 'Junior';
          const rankStr = cols[c + 9] ? cols[c + 9].trim() : '0';

          const total_gold = parseInt(totalGoldStr, 10) || 0;
          const rank = parseInt(rankStr, 10) || 0;

          // Clean kategori to ensure it is ONLY 'Junior' or 'Youth'
          let kategori = 'Junior';
          if (kategoriStr.toLowerCase().includes('youth')) {
            kategori = 'Youth';
          } else if (kategoriStr.toLowerCase().includes('junior')) {
            kategori = 'Junior';
          }

          // Clean class to make sure it's not a person's name or number
          let cleanClass = className;
          if (!cleanClass || /^\d+$/.test(cleanClass) || cleanClass.toLowerCase().includes('house of')) {
            cleanClass = 'Gladwell';
          }

          if (nama_trainee && !nama_trainee.toLowerCase().includes('top 25') && !nama_trainee.toLowerCase().includes('nama trainee')) {
            if (!traineesMap.has(id) || total_gold > (traineesMap.get(id).total_gold || 0)) {
              traineesMap.set(id, {
                id,
                nama_trainee,
                status,
                level,
                house,
                class: cleanClass,
                branch,
                total_gold,
                gp_month: total_gold,
                kategori,
                rank
              });
            }
          }
        }
      }
    }
  }

  console.log(`Parsed ${traineesMap.size} valid trainees from Gold Point master data.`);

  let updatedCount = 0;
  for (const [id, rec] of traineesMap.entries()) {
    const queryText = `
      UPDATE portal_trainee 
      SET 
        total_gold = $2,
        gp_month = $3,
        rank = $4,
        kategori = $5,
        class = $6,
        house = $7,
        level = $8,
        branch_id = $9,
        updated_at = NOW()
      WHERE trainee_id = $1
    `;

    const res = await db.query(queryText, [
      rec.id, rec.total_gold, rec.gp_month, rec.rank, rec.kategori,
      rec.class, rec.house, rec.level, rec.branch
    ]);

    if (res.rowCount > 0) updatedCount++;
  }

  // Also clean any remaining portal_trainee rows where kategori or class contains a name or invalid values
  await db.query(`
    UPDATE portal_trainee
    SET kategori = 'Junior'
    WHERE kategori IS NULL OR (kategori NOT ILIKE 'Junior' AND kategori NOT ILIKE 'Youth');
  `);

  console.log(`Successfully updated and cleaned class, level, house, & kategori for ${updatedCount} trainees in portal_trainee.`);
  process.exit(0);
}

run().catch(err => {
  console.error('Error cleaning goldpoint classes:', err);
  process.exit(1);
});
