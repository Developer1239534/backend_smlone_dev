const { pool } = require('../src/db/neonClient');

async function main() {
  try {
    console.log('Dropping deprecated table month_house...');
    await pool.query('DROP TABLE IF EXISTS month_house CASCADE;');
    console.log('✅ Deprecated table dropped successfully!');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
