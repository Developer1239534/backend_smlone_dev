const db = require('./src/db/neonClient');

async function stripAllTables() {
  const tableRes = await db.query(`
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'class' AND table_schema = 'public'
  `);
  
  for (const row of tableRes.rows) {
    const tableName = row.table_name;
    console.log('Checking table:', tableName);
    const res = await db.query(`SELECT DISTINCT class FROM ${tableName} WHERE class LIKE '%(%'`);
    if (res.rows.length > 0) {
      console.log('Found schedules in', tableName, ':', res.rows.map(r => r.class));
      const updateRes = await db.query(`UPDATE ${tableName} SET class = REGEXP_REPLACE(class, '\\s*\\(.*?\\)', '', 'g') WHERE class LIKE '%(%'`);
      console.log('Updated rows in', tableName, ':', updateRes.rowCount);
    } else {
      console.log('No schedule patterns found in', tableName);
    }
  }
  process.exit(0);
}

stripAllTables().catch(err => { console.error(err); process.exit(1); });
