const db = require('./src/db/neonClient');

async function verifyAll() {
  const tableRes = await db.query(`
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'class' AND table_schema = 'public'
  `);
  
  for (const row of tableRes.rows) {
    const tableName = row.table_name;
    const res = await db.query(`SELECT DISTINCT class FROM ${tableName} ORDER BY class`);
    console.log(`Table ${tableName} distinct classes:`, res.rows.map(r => r.class));
  }
  process.exit(0);
}

verifyAll().catch(err => { console.error(err); process.exit(1); });
