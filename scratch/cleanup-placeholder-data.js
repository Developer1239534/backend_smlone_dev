const db = require('../src/db/neonClient');

async function main() {
  try {
    console.log('=== STARTING CLEANUP OF UNUSED PLACEHOLDER DATA AND BACKUP TABLES ===');

    // 1. Delete quarterly reports for placeholder trainees
    const reportDel = await db.query(`
      DELETE FROM quarterly_report 
      WHERE trainee_id IN (
        SELECT id FROM dashboard_trainne WHERE trainee_name LIKE 'Trainee %'
      )
    `);
    console.log(`Deleted quarterly reports: ${reportDel.rowCount} rows deleted.`);

    // 2. Delete the placeholder trainees themselves
    const traineeDel = await db.query(`
      DELETE FROM dashboard_trainne 
      WHERE trainee_name LIKE 'Trainee %'
    `);
    console.log(`Deleted placeholder trainees: ${traineeDel.rowCount} rows deleted.`);

    // 3. Drop the backup table
    await db.query('DROP TABLE IF EXISTS "dashboard_trainne_backup_before_jun12_restore_20260614032950"');
    console.log('Dropped backup table: dashboard_trainne_backup_before_jun12_restore_20260614032950');

    console.log('\n=== CLEANUP COMPLETED SUCCESSFULLY ===');

  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    await db.pool.end();
  }
}

main();
