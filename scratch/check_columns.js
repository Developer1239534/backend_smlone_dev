const db = require('../src/db/neonClient');

async function checkColumns() {
  try {
    const result = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'level_1_keseluruhan' 
      ORDER BY ordinal_position;
    `);
    console.log('Columns in level_1_keseluruhan:');
    console.log(result.rows.map(r => `${r.column_name} (${r.data_type})`));
  } catch (e) {
    console.error(e.message);
  }
  process.exit(0);
}

checkColumns();
