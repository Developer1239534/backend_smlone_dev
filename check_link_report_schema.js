const db = require('./src/db/neonClient');

async function checkSchema() {
  try {
    const res = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'link_report'
      ORDER BY ordinal_position;
    `);
    console.log('Columns in link_report:', res.rows);
    process.exit(0);
  } catch (err) {
    console.error('Error checking schema:', err.message);
    process.exit(1);
  }
}

checkSchema();
