const db = require('./src/db/neonClient');

async function checkTables() {
  console.log('🔍 Checking ALL database tables for "Junior/Youth"...');
  const tables = ['login_portalllll', 'report_trainee', 'gold_point_rankings', 'gold_poin_setahun', 'ranking_house', 'admin_akun'];

  for (const t of tables) {
    try {
      const res = await db.query(`SELECT COUNT(*) FROM ${t} WHERE CAST(row_to_json(${t}) AS text) ILIKE '%Junior/Youth%';`);
      console.log(`Table ${t}: ${res.rows[0].count} matching rows`);
    } catch (err) {
      console.log(`Table ${t}: (${err.message})`);
    }
  }

  process.exit(0);
}

checkTables();
