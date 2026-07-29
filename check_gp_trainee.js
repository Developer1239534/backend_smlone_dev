const db = require('./src/db/neonClient');

async function checkGoldpointTrainee() {
  const res = await db.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'goldpoint_trainee';
  `);
  console.log('Columns in goldpoint_trainee:', res.rows);
  process.exit(0);
}

checkGoldpointTrainee();
