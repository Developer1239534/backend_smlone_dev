const db = require('./src/db/neonClient');

async function dropTables() {
  const tablesToDrop = [
    'gold_point_rankings',
    'report_activity',
    'report_trainee',
    'report_trainee_data'
  ];

  console.log('🗑️ Dropping specified tables from Neon DB...');

  for (const table of tablesToDrop) {
    try {
      await db.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
      console.log(`  - Table "${table}" successfully dropped.`);
    } catch (err) {
      console.error(`  - Failed to drop "${table}":`, err.message);
    }
  }

  const listRes = await db.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  console.log('\n📋 Remaining tables in Neon DB:');
  for (const row of listRes.rows) {
    console.log(`  - ${row.table_name}`);
  }

  process.exit(0);
}

dropTables();
