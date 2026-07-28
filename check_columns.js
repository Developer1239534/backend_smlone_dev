const db = require('./src/db/neonClient');

async function checkColumns() {
  const res = await db.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'portal_trainee'
  `);
  console.log('Columns in portal_trainee:', res.rows.map(r => r.column_name));
}

checkColumns().catch(console.error);
