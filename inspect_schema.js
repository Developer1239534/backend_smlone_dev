const db = require('./src/db/neonClient');

async function inspect() {
  const res = await db.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'dashboard_trainne';
  `);
  console.log('Columns in dashboard_trainne:', res.rows);
  process.exit(0);
}

inspect().catch(err => { console.error(err); process.exit(1); });
