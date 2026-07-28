const db = require('./src/db/neonClient');

async function checkColumns() {
  const res = await db.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'portal_trainee';
  `);
  console.log('portal_trainee columns:', res.rows);

  const tables = await db.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
  `);
  console.log('Tables:', tables.rows.map(r => r.table_name));
}

checkColumns().catch(console.error);
