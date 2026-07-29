const fs = require('fs');
const db = require('./src/db/neonClient');

async function updateMonthlyGoldPoints() {
  console.log('🚀 Starting Monthly Gold Points Update (June 2026)...');

  const content = fs.readFileSync('raw_monthly_goldpoints_full.txt', 'utf8');
  const lines = content.split(/\r?\n/);

  const records = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.includes('Month') || line.includes('Last Date') || line.includes('Total Gold/Periode') || line.includes('USER_REQUEST') || line.includes('<ADDITIONAL_METADATA>') || line.includes('current local time')) {
      continue;
    }

    const parts = line.split('\t');
    if (parts.length < 3) continue;

    const id = parts[0].trim();
    if (!/^\d+$/.test(id)) continue;

    const name = parts[1] ? parts[1].trim() : '';
    const activeStatus = parts[2] ? parts[2].trim() : '';
    const level = parts[3] ? parts[3].trim() : '';
    const house = parts[4] ? parts[4].trim() : '';
    const className = parts[5] ? parts[5].trim() : '';
    const branch = parts[6] ? parts[6].trim() : '';
    const totalGoldStr = parts[7] ? parts[7].trim() : '0';
    const kategori = parts[8] ? parts[8].trim() : '';

    const rankJunior = parts[9] ? parts[9].trim() || null : null;
    const rankYouth = parts[10] ? parts[10].trim() || null : null;
    const rankJuniorTimor = parts[11] ? parts[11].trim() || null : null;
    const rankYouthTimor = parts[12] ? parts[12].trim() || null : null;
    const rankJuniorTritura = parts[13] ? parts[13].trim() || null : null;
    const rankYouthTritura = parts[14] ? parts[14].trim() || null : null;
    const rankJuniorCemara = parts[15] ? parts[15].trim() || null : null;
    const rankYouthCemara = parts[16] ? parts[16].trim() || null : null;

    const total_gold_periode = parseInt(totalGoldStr, 10) || 0;

    records.push({
      id,
      name,
      activeStatus,
      level,
      house,
      className,
      branch,
      total_gold_periode,
      kategori,
      rankJunior,
      rankYouth,
      rankJuniorTimor,
      rankYouthTimor,
      rankJuniorTritura,
      rankYouthTritura,
      rankJuniorCemara,
      rankYouthCemara
    });
  }

  console.log(`📊 Loaded ${records.length} monthly records.`);

  // Get existing portal_trainee IDs
  const ptRes = await db.query('SELECT trainee_id FROM portal_trainee;');
  const dbTraineeIds = new Set(ptRes.rows.map(r => r.trainee_id));

  let ptUpdated = 0;
  let ptSkipped = 0;
  let gpmUpserted = 0;
  let dtUpdated = 0;

  for (const rec of records) {
    if (dbTraineeIds.has(rec.id)) {
      // 1. Update gp_month in portal_trainee (leave total_gold untouched!)
      await db.query(`
        UPDATE portal_trainee 
        SET 
          gp_month = $2,
          updated_at = NOW()
        WHERE trainee_id = $1
      `, [rec.id, rec.total_gold_periode]);
      ptUpdated++;
    } else {
      ptSkipped++;
    }

    // 2. Upsert into gp_month table
    const gpmRes = await db.query(`
      INSERT INTO gp_month (
        trainee_id, total_gold_periode,
        rank_id_junior, rank_id_youth,
        rank_id_junior_timor, rank_id_youth_timor,
        rank_id_junior_tritura, rank_id_youth_tritura,
        rank_id_junior_cemara, rank_id_youth_cemara,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      ON CONFLICT (trainee_id) DO UPDATE SET
        total_gold_periode = EXCLUDED.total_gold_periode,
        rank_id_junior = EXCLUDED.rank_id_junior,
        rank_id_youth = EXCLUDED.rank_id_youth,
        rank_id_junior_timor = EXCLUDED.rank_id_junior_timor,
        rank_id_youth_timor = EXCLUDED.rank_id_youth_timor,
        rank_id_junior_tritura = EXCLUDED.rank_id_junior_tritura,
        rank_id_youth_tritura = EXCLUDED.rank_id_youth_tritura,
        rank_id_junior_cemara = EXCLUDED.rank_id_junior_cemara,
        rank_id_youth_cemara = EXCLUDED.rank_id_youth_cemara,
        created_at = NOW();
    `, [
      rec.id, rec.total_gold_periode,
      rec.rankJunior, rec.rankYouth,
      rec.rankJuniorTimor, rec.rankYouthTimor,
      rec.rankJuniorTritura, rec.rankYouthTritura,
      rec.rankJuniorCemara, rec.rankYouthCemara
    ]).catch(err => {
      console.error(`Error upserting gp_month for ${rec.id}:`, err.message);
    });

    if (gpmRes) gpmUpserted++;

    // 3. Update dashboard_trainne ranks if exists
    await db.query(`
      UPDATE dashboard_trainne
      SET 
        rank_id_junior = $2,
        rank_id_youth = $3,
        rank_id_junior_timor = $4,
        rank_id_youth_timor = $5,
        rank_id_junior_tritura = $6,
        rank_id_youth_tritura = $7,
        rank_id_junior_cemara = $8,
        rank_id_youth_cemara = $9
      WHERE id = $1
    `, [
      rec.id,
      rec.rankJunior, rec.rankYouth,
      rec.rankJuniorTimor, rec.rankYouthTimor,
      rec.rankJuniorTritura, rec.rankYouthTritura,
      rec.rankJuniorCemara, rec.rankYouthCemara
    ]).catch(() => null);
  }

  console.log(`\n🎉 Monthly Gold Points Update Completed!`);
  console.log(`- Updated gp_month in portal_trainee: ${ptUpdated} trainees (Skipped: ${ptSkipped})`);
  console.log(`- Upserted records into gp_month table: ${gpmUpserted} trainees`);

  process.exit(0);
}

updateMonthlyGoldPoints().catch(err => {
  console.error('❌ Fatal error in updateMonthlyGoldPoints:', err);
  process.exit(1);
});
