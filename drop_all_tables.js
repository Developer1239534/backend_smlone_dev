const db = require('./src/db/neonClient');

async function dropAllTables() {
  const tables = [
    'feedback',
    'gold_poin_setahun',
    'gold_point_rankings',
    'gold_point_setahun',
    'house_rank',
    'ranking_house',
    'report_trainee',
    'login_portal_fix',
    'login_portalllll'
  ];

  try {
    console.log('🔥 Dropping selected tables from database...');
    for (const t of tables) {
      try {
        await db.query(`DROP TABLE IF EXISTS ${t} CASCADE;`);
        console.log(`✅ Dropped table "${t}"`);
      } catch (err) {
        console.error(`Error dropping table "${t}":`, err.message);
      }
    }
    console.log('🎉 Selected tables dropped successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error executing dropAllTables:', err);
    process.exit(1);
  }
}

dropAllTables();
