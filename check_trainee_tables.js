const db = require('./src/db/neonClient');

async function checkTraineeTables() {
  const dtRes = await db.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'dashboard_trainne';
  `);
  console.log('Columns in dashboard_trainne:', dtRes.rows);

  const ptRes = await db.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'portal_trainee';
  `);
  console.log('Columns in portal_trainee:', ptRes.rows);

  process.exit(0);
}

checkTraineeTables();
