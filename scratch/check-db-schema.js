const { pool } = require('../src/db/neonClient');

async function main() {
  try {
    const res = await pool.query(`
      SELECT column_name, table_name 
      FROM information_schema.columns 
      WHERE table_name IN ('dashboard_trainne', 'gp_month') 
        AND column_name = 'total_gold_periode'
    `);
    console.log('Columns matching total_gold_periode in DB:');
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
