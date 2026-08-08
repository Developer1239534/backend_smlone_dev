const db = require('./src/db/neonClient');

async function checkRealStage() {
  const res = await db.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
  `);
  console.log('Tables in DB:', res.rows.map(r => r.table_name));
  
  // Try querying real_stage columns
  try {
    const columns = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'real_stage';
    `);
    console.log('Columns in real_stage:', columns.rows);
  } catch (err) {
    console.error('Error reading real_stage:', err.message);
  }

  process.exit(0);
}

checkRealStage();
