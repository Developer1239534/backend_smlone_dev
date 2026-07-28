const fs = require('fs');
const db = require('./src/db/neonClient');

const rawText = fs.readFileSync(__dirname + '/raw_goldpoint_input.txt', 'utf8');

async function run() {
  const lines = rawText.split(/\r?\n/);

  // Map to store unique trainee records by ID (or array of all entries)
  const traineesMap = new Map();

  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = line.split('\t');

    // Scan cols in chunks of 10 or find all occurrences of ID
    for (let c = 0; c < cols.length; c++) {
      const val = cols[c].trim();
      if (/^\d+$/.test(val) && val.length >= 2 && val.length <= 10 && val !== '25' && val !== '26' && val !== '28' && val !== '31') {
        // Check if next column looks like a name
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

          const total_gold_periode = parseInt(totalGoldStr, 10) || 0;
          const rank = parseInt(rankStr, 10) || 0;

          if (nama_trainee && !nama_trainee.toLowerCase().includes('top 25') && !nama_trainee.toLowerCase().includes('nama trainee')) {
            // Store or update if total_gold_periode is higher/present
            if (!traineesMap.has(id) || total_gold_periode > (traineesMap.get(id).total_gold_periode || 0)) {
              traineesMap.set(id, {
                id,
                nama_trainee,
                status,
                level,
                house,
                class: className,
                branch,
                total_gold_periode,
                gp_month: total_gold_periode,
                kategori,
                rank
              });
            }
          }
        }
      }
    }
  }

  console.log(`Parsed ${traineesMap.size} unique trainees from gold point input.`);

  let upsertedCount = 0;
  for (const [id, rec] of traineesMap.entries()) {
    const queryText = `
      INSERT INTO goldpoint_trainee 
        (id, nama_trainee, status, level, house, class, branch, total_gold_periode, gp_month, kategori, rank, updated_at)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      ON CONFLICT (id) 
      DO UPDATE SET
        nama_trainee = EXCLUDED.nama_trainee,
        status = EXCLUDED.status,
        level = EXCLUDED.level,
        house = EXCLUDED.house,
        class = EXCLUDED.class,
        branch = EXCLUDED.branch,
        total_gold_periode = EXCLUDED.total_gold_periode,
        gp_month = EXCLUDED.gp_month,
        kategori = EXCLUDED.kategori,
        rank = EXCLUDED.rank,
        updated_at = NOW()
      RETURNING *;
    `;

    await db.query(queryText, [
      rec.id, rec.nama_trainee, rec.status, rec.level, rec.house, rec.class,
      rec.branch, rec.total_gold_periode, rec.gp_month, rec.kategori, rec.rank
    ]);

    // Connect & Sync with portal_trainee table
    await db.query(`
      UPDATE portal_trainee 
      SET name = $2, house = $3, class = $4, branch_id = $5, level = $6
      WHERE trainee_id = $1 OR id = $1
    `, [rec.id, rec.nama_trainee, rec.house, rec.class, rec.branch, rec.level]).catch(() => null);

    upsertedCount++;
  }

  // Auto-fix any 0 or null ranks in database based on total_gold_periode
  await db.query(`
    WITH ranked AS (
      SELECT id, ROW_NUMBER() OVER (
        PARTITION BY kategori, branch 
        ORDER BY total_gold_periode DESC, nama_trainee ASC
      ) AS calculated_rank
      FROM goldpoint_trainee
    )
    UPDATE goldpoint_trainee g
    SET rank = r.calculated_rank
    FROM ranked r
    WHERE g.id = r.id AND (g.rank IS NULL OR g.rank = 0);
  `).catch(() => null);

  console.log(`Successfully upserted ${upsertedCount} trainees into goldpoint_trainee table & synced with portal_trainee.`);
  process.exit(0);
}

run().catch(err => {
  console.error('Error importing gold point data:', err);
  process.exit(1);
});
