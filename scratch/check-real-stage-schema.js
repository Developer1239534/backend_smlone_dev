require('dotenv').config();
const db = require('../src/db/neonClient');

(async () => {
  try {
    const cols = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'real_stage'
    `);
    console.log('=== COLUMNS ===');
    console.log(cols.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));

    const sample = await db.query('SELECT * FROM real_stage LIMIT 5');
    console.log('\n=== SAMPLE ROWS ===');
    console.log(sample.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
})();
