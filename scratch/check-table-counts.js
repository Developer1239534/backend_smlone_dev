const db = require('../src/db/neonClient');

async function main() {
  try {
    const mainCount = await db.query("SELECT COUNT(*) AS count FROM dashboard_trainne");
    const backupCount = await db.query("SELECT COUNT(*) AS count FROM dashboard_trainne_backup_before_jun12_restore_20260614032950");
    
    console.log(`dashboard_trainne: ${mainCount.rows[0].count} rows`);
    console.log(`dashboard_trainne_backup_before_jun12_restore_20260614032950: ${backupCount.rows[0].count} rows`);
    
    // Check if Trainee 20 exists in the backup table too
    const traineeBackup = await db.query("SELECT id, trainee_name, cabang FROM dashboard_trainne_backup_before_jun12_restore_20260614032950 WHERE id = '20'");
    console.log('\nTrainee 20 in backup table:', traineeBackup.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
}

main();
