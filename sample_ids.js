const { pool } = require('./src/db/neonClient');

async function sampleIDs() {
  try {
    const tables = [
      { name: 'profile_trainee', col: '"ID"' },
      { name: 'credential_portal', col: '"ID"' },
      { name: 'real_stage', col: '"ID Trainee"' },
      { name: 'monthly_gold_point', col: '"ID"' },
      { name: 'id_gold_point', col: '"ID"' },
      { name: 'report_progres', col: '"ID"' },
      { name: 'weekly_report', col: '"ID"' }
    ];

    for (const t of tables) {
      const res = await pool.query(`SELECT DISTINCT ${t.col} as id FROM "${t.name}" WHERE ${t.col} IS NOT NULL AND ${t.col} != '' LIMIT 10`);
      console.log(`\nSample IDs in [${t.name}]:`);
      console.log(res.rows.map(r => r.id));
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

sampleIDs();
