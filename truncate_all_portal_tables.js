const db = require('./src/db/neonClient');

async function truncateAllPortalTables() {
  console.log('🧹 Truncating all portal and dashboard trainee tables...');

  const tablesToTruncate = [
    'portal_trainee',
    'data_dashboard_keseluruhan',
    'dashboard_trainne',
    'goldpoint_trainee',
    'login_trainee'
  ];

  for (const table of tablesToTruncate) {
    try {
      await db.query(`TRUNCATE TABLE ${table} CASCADE;`);
      console.log(`✅ Successfully truncated table: ${table}`);
    } catch (err) {
      console.log(`⚠️ Table ${table} skip/error:`, err.message);
    }
  }

  console.log('\n📊 Final Row Count Verification:');
  for (const table of tablesToTruncate) {
    try {
      const res = await db.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`- ${table}: ${res.rows[0].count} rows`);
    } catch (err) {
      console.log(`- ${table}: table does not exist`);
    }
  }

  process.exit(0);
}

truncateAllPortalTables().catch(err => {
  console.error('❌ Error truncating tables:', err);
  process.exit(1);
});
