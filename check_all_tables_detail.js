require('dotenv').config();
const db = require('./src/db/neonClient');

async function checkAll() {
  const tables = await db.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);

  console.log('=== CURRENT TABLES AND ROW COUNTS ===');
  for (const row of tables.rows) {
    const countRes = await db.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
    console.log(`- ${row.table_name}: ${countRes.rows[0].count} rows`);
  }
}

checkAll().catch(err => console.error(err)).finally(() => process.exit(0));
