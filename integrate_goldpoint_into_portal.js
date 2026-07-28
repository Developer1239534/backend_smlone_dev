const fs = require('fs');
const db = require('./src/db/neonClient');

const rawText = fs.readFileSync(__dirname + '/raw_goldpoint_input.txt', 'utf8');

async function run() {
  console.log('Adding gold point columns to portal_trainee if not exists...');
  await db.query(`
    ALTER TABLE portal_trainee 
    ADD COLUMN IF NOT EXISTS total_gold INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS gp_month INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS rank INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS kategori VARCHAR;
  `);

  const lines = rawText.split(/\r?\n/);
  const traineesMap = new Map();

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
          const kategori = cols[c + 8] ? cols[c + 8].trim() : 'Junior';
          const rankStr = cols[c + 9] ? cols[c + 9].trim() : '0';

          const total_gold = parseInt(totalGoldStr, 10) || 0;
          const rank = parseInt(rankStr, 10) || 0;

          if (nama_trainee && !nama_trainee.toLowerCase().includes('top 25') && !nama_trainee.toLowerCase().includes('nama trainee')) {
            if (!traineesMap.has(id) || total_gold > (traineesMap.get(id).total_gold || 0)) {
              traineesMap.set(id, {
                id,
                nama_trainee,
                status,
                level,
                house,
                class: className,
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

  console.log(`Parsed ${traineesMap.size} unique gold point records.`);

  let updatedCount = 0;
  for (const [id, rec] of traineesMap.entries()) {
    const queryText = `
      UPDATE portal_trainee 
      SET 
        total_gold = $2,
        gp_month = $3,
        rank = $4,
        kategori = $5,
        level = COALESCE($6, level),
        house = COALESCE($7, house),
        class = COALESCE($8, class),
        branch_id = COALESCE($9, branch_id),
        updated_at = NOW()
      WHERE trainee_id = $1
    `;

    const res = await db.query(queryText, [
      rec.id, rec.total_gold, rec.gp_month, rec.rank, rec.kategori,
      rec.level, rec.house, rec.class, rec.branch
    ]);

    if (res.rowCount > 0) updatedCount++;
  }

  console.log(`Successfully integrated Gold Point data into portal_trainee for ${updatedCount} trainees.`);
  process.exit(0);
}

run().catch(err => {
  console.error('Error integrating gold point data into portal_trainee:', err);
  process.exit(1);
});
