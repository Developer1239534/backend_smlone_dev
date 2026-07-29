const db = require('./src/db/neonClient');

async function setupGpMonth() {
  console.log('🔄 Checking & setting up gp_month table...');

  await db.query(`
    CREATE TABLE IF NOT EXISTS gp_month (
      trainee_id VARCHAR PRIMARY KEY,
      total_gold_periode INTEGER DEFAULT 0,
      rank_id_junior VARCHAR,
      rank_id_youth VARCHAR,
      rank_id_junior_timor VARCHAR,
      rank_id_youth_timor VARCHAR,
      rank_id_junior_tritura VARCHAR,
      rank_id_youth_tritura VARCHAR,
      rank_id_junior_cemara VARCHAR,
      rank_id_youth_cemara VARCHAR,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log('✅ Created gp_month table.');

  // Sync data from portal_trainee to gp_month
  const trainees = await db.query('SELECT trainee_id, total_gold, kategori, branch_id FROM portal_trainee WHERE name IS NOT NULL;');
  console.log(`Syncing ${trainees.rows.length} records...`);

  let count = 0;
  for (const t of trainees.rows) {
    const cid = String(t.trainee_id).trim();
    const gold = t.total_gold || 0;
    const cat = String(t.kategori || '').toLowerCase();
    const branch = String(t.branch_id || '').toLowerCase();

    // Map ranks (placeholder or simple rank for compatibility)
    let rank_id_junior = null;
    let rank_id_youth = null;
    let rank_id_junior_timor = null;
    let rank_id_youth_timor = null;
    let rank_id_junior_tritura = null;
    let rank_id_youth_tritura = null;
    let rank_id_junior_cemara = null;
    let rank_id_youth_cemara = null;

    if (cat.includes('junior')) {
      rank_id_junior = '1';
      if (branch.includes('timor')) rank_id_junior_timor = '1';
      if (branch.includes('tritura')) rank_id_junior_tritura = '1';
      if (branch.includes('cemara')) rank_id_junior_cemara = '1';
    } else if (cat.includes('youth')) {
      rank_id_youth = '1';
      if (branch.includes('timor')) rank_id_youth_timor = '1';
      if (branch.includes('tritura')) rank_id_youth_tritura = '1';
      if (branch.includes('cemara')) rank_id_youth_cemara = '1';
    }

    await db.query(`
      INSERT INTO gp_month (
        trainee_id, total_gold_periode, rank_id_junior, rank_id_youth,
        rank_id_junior_timor, rank_id_youth_timor, rank_id_junior_tritura,
        rank_id_youth_tritura, rank_id_junior_cemara, rank_id_youth_cemara, created_at
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
        rank_id_youth_cemara = EXCLUDED.rank_id_youth_cemara;
    `, [
      cid, gold, rank_id_junior, rank_id_youth,
      rank_id_junior_timor, rank_id_youth_timor, rank_id_junior_tritura,
      rank_id_youth_tritura, rank_id_junior_cemara, rank_id_youth_cemara
    ]);
    count++;
  }

  console.log(`✅ Successfully synced ${count} trainees to gp_month.`);
  process.exit(0);
}

setupGpMonth().catch(err => {
  console.error('Error setting up gp_month:', err);
  process.exit(1);
});
