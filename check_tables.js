const db = require('./src/db/neonClient');

async function check() {
  const res = await db.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);

  console.log('Tables in DB:');
  for (const row of res.rows) {
    const countRes = await db.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
    console.log(`- ${row.table_name}: ${countRes.rows[0].count} rows`);
  }
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
