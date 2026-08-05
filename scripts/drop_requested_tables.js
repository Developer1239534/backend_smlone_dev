const db = require('../src/db/neonClient');

async function dropTables() {
  const tables = [
    'ranking_houses',
    'registrasi_ca',
    'registrasi_cp',
    'registrasi_tr',
    'news_announcements',
    'request_fitur'
  ];

  console.log('🔄 Dropping requested tables...');
  for (const t of tables) {
    await db.query(`DROP TABLE IF EXISTS ${t} CASCADE;`);
    console.log(`✅ Dropped table: ${t}`);
  }

  const res = await db.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  console.log('\n📊 Remaining Tables in Database:');
  console.table(res.rows);
  process.exit(0);
}

dropTables().catch(err => {
  console.error('❌ Error dropping tables:', err);
  process.exit(1);
});
