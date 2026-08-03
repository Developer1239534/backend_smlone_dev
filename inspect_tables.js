const db = require('./src/db/neonClient');

async function inspectTables() {
  const tablesRes = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log('Tables in DB:', tablesRes.rows.map(t => t.table_name));

  for (const t of tablesRes.rows.map(x => x.table_name)) {
    const cols = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${t}'`);
    console.log(`\nColumns for table [${t}]:`);
    console.log(cols.rows.map(c => `${c.column_name} (${c.data_type})`));
  }
}

inspectTables().catch(console.error).then(() => process.exit(0));
