require('dotenv').config();
const db = require('../src/db/neonClient');

(async () => {
  try {
    const cols = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'myby_coin'
    `);
    console.log('=== COLUMNS ===');
    console.log(cols.rows);

    const cons = await db.query(`
      SELECT constraint_name, constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_name = 'myby_coin'
    `);
    console.log('\n=== CONSTRAINTS ===');
    console.log(cons.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
})();
