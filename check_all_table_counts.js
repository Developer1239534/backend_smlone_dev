const db = require('./src/db/neonClient');

async function checkAllTableCounts() {
  try {
    const res = await db.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public';`);
    console.log('📋 Existing database tables & row counts:');
    for (const row of res.rows) {
      try {
        const cnt = await db.query(`SELECT COUNT(*) FROM ${row.table_name};`);
        console.log(`- ${row.table_name}: ${cnt.rows[0].count} rows`);
      } catch(e) {
        console.log(`- ${row.table_name}: error (${e.message})`);
      }
    }
  } catch (err) {
    console.error('Error listing tables:', err);
  }
  process.exit(0);
}

checkAllTableCounts();
