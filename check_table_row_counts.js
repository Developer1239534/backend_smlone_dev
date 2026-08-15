const db = require('./src/db/neonClient');

async function checkRowCounts() {
  const tables = [
    'admin_akun',
    'credential_portal',
    'gold_poin_setahun',
    'gold_point_rankings',
    'house_rank',
    'link_report',
    'monthly_gold_point',
    'profile_trainee',
    'ranking_house',
    'report_activity',
    'report_trainee',
    'report_trainee_data'
  ];

  console.log('📊 Checking row counts across tables in Neon DB:');
  for (const t of tables) {
    try {
      const res = await db.query(`SELECT COUNT(*) FROM "${t}";`);
      console.log(`  - ${t}: ${res.rows[0].count} rows`);
    } catch (err) {
      console.log(`  - ${t}: ❌ Table does not exist (${err.message})`);
    }
  }
  process.exit(0);
}

checkRowCounts();
