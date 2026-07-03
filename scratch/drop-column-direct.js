const { pool } = require('../src/db/neonClient');

async function main() {
  try {
    console.log('🔄 Dropping total_gold_periode column from dashboard_trainne table directly...');
    await pool.query('ALTER TABLE dashboard_trainne DROP COLUMN IF EXISTS total_gold_periode CASCADE;');
    console.log('✅ Column successfully dropped!');

    // Verification
    const res = await pool.query(`
      SELECT column_name, table_name 
      FROM information_schema.columns 
      WHERE table_name IN ('dashboard_trainne', 'gp_month') 
        AND column_name = 'total_gold_periode'
    `);
    console.log('\nVerification - columns remaining matching total_gold_periode:');
    console.log(res.rows);
  } catch (err) {
    console.error('❌ Error dropping column:', err.message);
  } finally {
    await pool.end();
  }
}

main();
