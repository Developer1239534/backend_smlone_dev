const { pool } = require('../src/db/neonClient');

async function main() {
  try {
    const ids = ['1177', '70100184'];

    console.log('🧹 Deleting anomalies from gp_tahunan table...');
    const delGpTahunan = await pool.query(
      `DELETE FROM gp_tahunan WHERE trainee_id IN ($1, $2)`,
      ids
    );
    console.log(`Deleted ${delGpTahunan.rowCount} rows from gp_tahunan.`);

    console.log('🧹 Deleting anomalies from dashboard_trainne table...');
    const delTrainee = await pool.query(
      `DELETE FROM dashboard_trainne WHERE id IN ($1, $2) OR junior_youth IN ('111', '180')`,
      ids
    );
    console.log(`Deleted ${delTrainee.rowCount} rows from dashboard_trainne.`);

    // Verification
    console.log('\n🔍 Verifying cleanup...');
    const checkTrainee = await pool.query(
      `SELECT * FROM dashboard_trainne WHERE id IN ($1, $2) OR junior_youth IN ('111', '180')`,
      ids
    );
    console.log(`Remaining anomalies in dashboard_trainne: ${checkTrainee.rowCount}`);

  } catch (err) {
    console.error('❌ Error executing deletion:', err.message);
  } finally {
    await pool.end();
  }
}

main();
