const db = require('./src/db/neonClient');

async function checkCols() {
  const res = await db.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'report_activity' 
    ORDER BY ordinal_position;
  `);
  console.log('Columns in report_activity:', res.rows.map(r => r.column_name));
  process.exit(0);
}

checkCols();
