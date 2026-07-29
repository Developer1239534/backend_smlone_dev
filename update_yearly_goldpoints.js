const fs = require('fs');
const db = require('./src/db/neonClient');

async function updateYearlyGoldPoints() {
  console.log('🚀 Starting 1-Year Gold Points Update...');

  const content = fs.readFileSync('raw_yearly_goldpoints_full.txt', 'utf8');
  const lines = content.split(/\r?\n/);

  const studentTotals = new Map();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    let parts = line.split('\t');
    if (parts.length < 2) {
      parts = line.split(/\s+/);
    }

    const col0 = parts[0] ? parts[0].trim() : '';
    const col2 = parts[2] ? parts[2].trim() : (parts[1] ? parts[1].trim() : '');

    if (col0.toLowerCase().includes('student') || col0.toLowerCase().includes('period') || col0 === '1' || col0 === '<USER_REQUEST>') {
      continue;
    }

    if (/^\d+$/.test(col0)) {
      const goldVal = parseInt(col2, 10);
      const validGold = isNaN(goldVal) ? 0 : goldVal;
      studentTotals.set(col0, (studentTotals.get(col0) || 0) + validGold);
    }
  }

  console.log(`📊 Calculated 1-Year Gold Point sums for ${studentTotals.size} unique trainees.`);

  // Get active trainees from portal_trainee
  const ptRes = await db.query('SELECT trainee_id, name, total_gold FROM portal_trainee;');
  const dbTraineeIds = new Set(ptRes.rows.map(r => r.trainee_id));

  let updatedCount = 0;
  let skippedCount = 0;

  for (const [id, totalGold] of studentTotals.entries()) {
    if (!dbTraineeIds.has(id)) {
      skippedCount++;
      continue;
    }

    // 1. Update portal_trainee
    await db.query(`
      UPDATE portal_trainee 
      SET 
        total_gold = $2,
        gp_month = $2,
        updated_at = NOW()
      WHERE trainee_id = $1
    `, [id, totalGold]);

    // 2. Update dashboard_trainne
    await db.query(`
      UPDATE dashboard_trainne 
      SET total_gold_periode = $2
      WHERE id = $1
    `, [id, totalGold]).catch(() => null);

    // 3. Update gp_month
    await db.query(`
      UPDATE gp_month 
      SET total_gold_periode = $2,
          created_at = NOW()
      WHERE trainee_id = $1
    `, [id, totalGold]).catch(() => null);

    // 4. Update goldpoint_trainee if exists
    await db.query(`
      UPDATE goldpoint_trainee 
      SET 
        total_gold_periode = $2,
        gp_month = $2,
        updated_at = NOW()
      WHERE id = $1
    `, [id, totalGold]).catch(() => null);

    updatedCount++;
  }

  // 5. Recalculate ranks in goldpoint_trainee and portal_trainee
  console.log('🔄 Recalculating ranking orders...');
  await db.query(`
    WITH ranked AS (
      SELECT 
        trainee_id, 
        ROW_NUMBER() OVER (
          PARTITION BY COALESCE(kategori, 'Junior'), COALESCE(branch_id, 'TIMOR') 
          ORDER BY COALESCE(total_gold, 0) DESC, name ASC
        ) AS calculated_rank
      FROM portal_trainee
      WHERE name IS NOT NULL AND TRIM(name) != ''
    )
    UPDATE portal_trainee p
    SET rank = r.calculated_rank
    FROM ranked r
    WHERE p.trainee_id = r.trainee_id;
  `).catch(err => console.error('Error updating portal_trainee ranks:', err.message));

  await db.query(`
    WITH ranked AS (
      SELECT 
        id, 
        ROW_NUMBER() OVER (
          PARTITION BY COALESCE(kategori, 'Junior'), COALESCE(branch, 'TIMOR') 
          ORDER BY COALESCE(total_gold_periode, 0) DESC, nama_trainee ASC
        ) AS calculated_rank
      FROM goldpoint_trainee
    )
    UPDATE goldpoint_trainee g
    SET rank = r.calculated_rank
    FROM ranked r
    WHERE g.id = r.id;
  `).catch(err => console.error('Error updating goldpoint_trainee ranks:', err.message));

  console.log(`\n🎉 1-Year Gold Points Update Completed!`);
  console.log(`- Successfully updated: ${updatedCount} trainees`);
  console.log(`- Skipped (not in DB):   ${skippedCount} trainees`);

  process.exit(0);
}

updateYearlyGoldPoints().catch(err => {
  console.error('❌ Fatal error updating gold points:', err);
  process.exit(1);
});
